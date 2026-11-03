// A TO Z MOBILES - Admin Control Center Engine (Call & Confirm Optimized)
(function() {
  'use strict';

  let currentAdminUser = null;
  let allProducts = [];
  let allOrders = [];
  let currentOrderFilter = 'all';

  function formatINR(num) {
    if (isNaN(num)) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
  }

  // --- AUTH CHECK ---
  async function checkAdminAuth() {
    const overlay = document.getElementById('admin-login-overlay');
    const app = document.getElementById('admin-app');
    const token = window.api ? window.api.getToken() : localStorage.getItem('atoz_token');

    if (!token) {
      if (overlay) overlay.style.display = 'flex';
      if (app) app.style.display = 'none';
      return false;
    }

    try {
      const res = await window.api.getProfile();
      if (res && res.success && res.user && res.user.role === 'admin') {
        currentAdminUser = res.user;
        if (overlay) overlay.style.display = 'none';
        if (app) app.style.display = 'flex';
        loadAdminOrders();
        loadDashboardStats();
        loadAdminSettings();
        return true;
      } else {
        if (overlay) overlay.style.display = 'flex';
        if (app) app.style.display = 'none';
        return false;
      }
    } catch (e) {
      if (overlay) overlay.style.display = 'flex';
      if (app) app.style.display = 'none';
      return false;
    }
  }

  window.fillAdminDemo = function() {
    document.getElementById('ad-email').value = 'admin@atozmobiles.in';
    document.getElementById('ad-pass').value = 'admin123';
  };

  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('ad-email').value.trim();
    const pass = document.getElementById('ad-pass').value;

    try {
      const res = await window.api.login(email, pass);
      if (res.success) {
        if (res.user.role !== 'admin') {
          alert('Access denied. Admin role required.');
          window.api.logout();
          return;
        }
        checkAdminAuth();
      } else {
        alert(res.message || 'Invalid credentials');
      }
    } catch (err) {
      alert('Login error');
    }
  });

  window.adminLogout = function() {
    window.api.logout();
    checkAdminAuth();
  };

  // --- TAB SWITCHER ---
  window.switchAdminTab = function(tab) {
    ['orders', 'overview', 'products', 'customers', 'coupons', 'settings'].forEach(t => {
      const sec = document.getElementById(`tab-${t}`);
      const btn = document.getElementById(`btn-adm-${t}`);
      const qtab = document.getElementById(`qtab-${t}`);
      if (sec) sec.style.display = (t === tab) ? 'block' : 'none';
      if (btn) btn.classList.toggle('active', t === tab);
      if (qtab) qtab.classList.toggle('active', t === tab);
    });

    const titles = {
      orders: '📞 Call & Confirm Orders',
      overview: 'Store Sales & Analytics',
      products: 'Manage Refurbished Inventory',
      customers: 'Customer Accounts & History',
      coupons: 'Discount Promo Codes',
      settings: 'Store & Customer Call Settings'
    };
    document.getElementById('admin-page-title').textContent = titles[tab] || 'Admin Dashboard';

    if (tab === 'orders') loadAdminOrders();
    if (tab === 'overview') loadDashboardStats();
    if (tab === 'products') loadAdminProducts();
    if (tab === 'customers') loadAdminCustomers();
    if (tab === 'coupons') loadAdminCoupons();
    if (tab === 'settings') loadAdminSettings();
  };

  // --- STATS OVERVIEW ---
  async function loadDashboardStats() {
    try {
      const res = await fetch('/api/admin/stats', { headers: window.api.getHeaders() });
      const data = await res.json();
      if (!data.success) return;

      const salesStr = formatINR(data.stats.totalSales);
      if (document.getElementById('stat-sales')) document.getElementById('stat-sales').textContent = salesStr;
      if (document.getElementById('stat-total-sales-orders')) document.getElementById('stat-total-sales-orders').textContent = salesStr;
      if (document.getElementById('stat-orders')) document.getElementById('stat-orders').textContent = data.stats.totalOrders;
      if (document.getElementById('stat-products')) document.getElementById('stat-products').textContent = `${data.stats.totalProducts} (${data.stats.totalStock} units)`;
      if (document.getElementById('side-stock-badge')) document.getElementById('side-stock-badge').textContent = data.stats.totalProducts;
      if (document.getElementById('stat-customers')) document.getElementById('stat-customers').textContent = data.stats.totalCustomers;
      if (document.getElementById('stat-pending-calls')) document.getElementById('stat-pending-calls').textContent = data.stats.pendingCalls;
      if (document.getElementById('pill-needs-call')) document.getElementById('pill-needs-call').textContent = data.stats.pendingCalls;
      if (document.getElementById('side-pending-badge')) document.getElementById('side-pending-badge').textContent = data.stats.pendingCalls;
      if (document.getElementById('mobile-call-num')) document.getElementById('mobile-call-num').textContent = data.stats.pendingCalls;

      // Low Stock Table
      const lowTbody = document.getElementById('low-stock-tbody');
      if (lowTbody) {
        lowTbody.innerHTML = (data.lowStockProducts || []).map(p => `
          <tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.brand}</td>
            <td><span style="color:#EF4444; font-weight:800;">${p.stock} Unit(s)</span></td>
            <td>${formatINR(p.selling_price)}</td>
            <td>
              <button onclick="quickStockAdjust(${p.id}, ${p.stock + 5})" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-plus"></i> Restock +5
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }

  // --- ORDERS CALL & CONFIRM WORKFLOW ---
  window.filterOrdersBy = function(filter, btn) {
    currentOrderFilter = filter;
    if (btn) {
      document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    renderFilteredOrders();
  };

  async function loadAdminOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading customer orders...</td></tr>';

    try {
      const res = await fetch('/api/admin/orders', { headers: window.api.getHeaders() });
      const data = await res.json();
      if (!data.success) return;
      allOrders = data.orders || [];

      // Update counts
      const pendingCount = allOrders.filter(o => (o.order_status||'').toLowerCase().includes('awaiting') || (o.order_status||'').toLowerCase().includes('placed')).length;
      const confirmedCount = allOrders.filter(o => (o.order_status||'').toLowerCase().includes('confirm')).length;
      const dispatchedCount = allOrders.filter(o => (o.order_status||'').toLowerCase().includes('dispatch')).length;

      document.getElementById('stat-pending-calls').textContent = pendingCount;
      document.getElementById('pill-needs-call').textContent = pendingCount;
      document.getElementById('stat-confirmed-orders').textContent = confirmedCount;
      document.getElementById('stat-dispatched-orders').textContent = dispatchedCount;

      renderFilteredOrders();
    } catch (e) {
      console.error(e);
    }
  }

  function renderFilteredOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    let filtered = allOrders;

    if (currentOrderFilter === 'awaiting') {
      filtered = allOrders.filter(o => (o.order_status||'').toLowerCase().includes('awaiting') || (o.order_status||'').toLowerCase().includes('placed'));
    } else if (currentOrderFilter === 'confirmed') {
      filtered = allOrders.filter(o => (o.order_status||'').toLowerCase().includes('confirm'));
    } else if (currentOrderFilter === 'dispatched') {
      filtered = allOrders.filter(o => (o.order_status||'').toLowerCase().includes('dispatch'));
    } else if (currentOrderFilter === 'delivered') {
      filtered = allOrders.filter(o => (o.order_status||'').toLowerCase().includes('deliver'));
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94A3B8;">No orders found in this category.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(o => {
      const cleanPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
      const firstItem = (o.items && o.items[0]) ? o.items[0].name : 'Smart Phone';
      
      // Pre-filled WhatsApp message for fast confirmation
      const waMsg = `Hi ${o.customer_name}! This is A TO Z MOBILES regarding your order #${o.order_id} for ${firstItem} (Total: ₹${o.total_amount}). Please reply YES to confirm your address: ${o.shipping_address}. Thank you!`;
      const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(waMsg)}`;

      let statusBadge = 'awaiting';
      const st = (o.order_status || '').toLowerCase();
      if (st.includes('confirm')) statusBadge = 'confirmed';
      if (st.includes('dispatch')) statusBadge = 'dispatched';
      if (st.includes('deliver')) statusBadge = 'delivered';
      if (st.includes('cancel')) statusBadge = 'cancelled';

      return `
        <tr>
          <td>
            <strong style="color:#38BDF8; font-family:monospace; font-size:0.95rem;">${o.order_id}</strong>
            <div style="font-size:0.75rem; color:#94A3B8; margin-top:2px;">${new Date(o.created_at).toLocaleDateString('en-IN', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
          </td>

          <td>
            <strong style="font-size:0.95rem; color:#FFFFFF;">${o.customer_name}</strong>
            <div style="font-size:0.75rem; color:#94A3B8; max-width:180px;">${o.city || ''} ${o.state ? '&bull; ' + o.state : ''}</div>
          </td>

          <td>
            <div style="font-weight:800; font-size:1rem; color:#34D399; margin-bottom:0.35rem;">
              <i class="fa-solid fa-phone"></i> ${o.customer_phone}
            </div>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <a href="tel:${o.customer_phone}" class="btn-call" title="Call directly">
                <i class="fa-solid fa-phone-volume"></i> Call
              </a>
              <a href="${waUrl}" target="_blank" class="btn-wa" title="Open WhatsApp verification">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </a>
            </div>
          </td>

          <td>
            ${(o.items || []).map(i => `
              <div style="font-size:0.8125rem;">
                <strong>${i.name}</strong> <span style="color:#94A3B8;">(x${i.quantity})</span>
              </div>
            `).join('')}
            <div style="font-size:0.75rem; color:#94A3B8; margin-top:2px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${o.shipping_address}">
              <i class="fa-solid fa-location-dot"></i> ${o.shipping_address}
            </div>
          </td>

          <td>
            <strong style="font-size:1.1rem; color:#F8FAFC;">${formatINR(o.total_amount)}</strong>
            <div style="font-size:0.75rem; color:#94A3B8;">${o.payment_method === 'call_confirm' ? 'Cash on Delivery' : o.payment_method}</div>
          </td>

          <td>
            <span class="status-pill ${statusBadge}">${o.order_status}</span>
          </td>

          <td>
            <div style="display:flex; flex-direction:column; gap:0.4rem;">
              ${(statusBadge === 'awaiting') ? `
                <button onclick="confirmOrderPhone(${o.id}, '${o.order_id}')" class="btn-action-confirm">
                  <i class="fa-solid fa-check"></i> 1-Click Call Confirmed
                </button>
              ` : ''}

              ${(statusBadge === 'confirmed') ? `
                <button onclick="dispatchOrder(${o.id})" class="btn-action-dispatch">
                  <i class="fa-solid fa-truck-fast"></i> 1-Click Dispatch Blue Dart
                </button>
              ` : ''}

              ${(statusBadge === 'dispatched') ? `
                <button onclick="markDeliveredPaid(${o.id})" class="btn-action-paid">
                  <i class="fa-solid fa-hand-holding-dollar"></i> Mark Delivered & Paid
                </button>
              ` : ''}

              <div style="display:flex; gap:0.4rem;">
                <a href="/order-success.html?orderId=${o.order_id}" target="_blank" class="btn btn-outline btn-sm" style="color:#94A3B8; border-color:rgba(255,255,255,0.15); font-size:0.75rem; padding:0.25rem 0.5rem;">
                  Invoice
                </a>
                ${statusBadge !== 'cancelled' ? `
                  <button onclick="cancelOrder(${o.id}, '${o.order_id}')" class="btn-action-cancel" style="padding:0.25rem 0.5rem;">
                    Cancel
                  </button>
                ` : ''}
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 1-Click Quick Actions
  window.confirmOrderPhone = async function(id, orderId) {
    if (!confirm(`Mark Order #${orderId} as Phone Call Confirmed?`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}/confirm-call`, {
        method: 'POST',
        headers: window.api.getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        loadAdminOrders();
        loadDashboardStats();
      }
    } catch(e) {
      alert('Error updating order');
    }
  };

  window.dispatchOrder = async function(id) {
    try {
      const res = await fetch(`/api/admin/orders/${id}/quick-dispatch`, {
        method: 'POST',
        headers: window.api.getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        alert(`Order dispatched! Blue Dart AWB: ${data.tracking}`);
        loadAdminOrders();
      }
    } catch(e) {
      alert('Error dispatching');
    }
  };

  window.markDeliveredPaid = async function(id) {
    if (!confirm('Mark order as delivered and cash collected?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}/mark-delivered`, {
        method: 'POST',
        headers: window.api.getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        loadAdminOrders();
        loadDashboardStats();
      }
    } catch(e) {}
  };

  window.cancelOrder = async function(id, orderId) {
    if (!confirm(`Are you sure you want to cancel order #${orderId}? Stock will be automatically restored.`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}/cancel`, {
        method: 'POST',
        headers: window.api.getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        loadAdminOrders();
      }
    } catch(e) {}
  };

  // --- PRODUCTS MANAGEMENT ---
  async function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading products...</td></tr>';
    try {
      const res = await fetch('/api/admin/products', { headers: window.api.getHeaders() });
      const data = await res.json();
      if (!data.success) return;
      allProducts = data.products;

      tbody.innerHTML = allProducts.map(p => {
        const img = p.images[0] || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100';
        return `
          <tr>
            <td><img src="${img}" style="width:48px; height:48px; object-fit:contain; border-radius:4px; background:#0F172A; border:1px solid rgba(255,255,255,0.1);"></td>
            <td>
              <strong>${p.name}</strong>
              <div style="font-size:0.75rem; color:#94A3B8;">${p.grade}</div>
            </td>
            <td>${p.brand}</td>
            <td>${p.ram} / ${p.storage}</td>
            <td><span style="color:#10B981; font-weight:700;">${p.battery_health}%</span></td>
            <td><strong style="color:#38BDF8;">${formatINR(p.selling_price)}</strong></td>
            <td>
              <span style="${p.stock <= 2 ? 'color:#EF4444; font-weight:800;' : ''}">${p.stock}</span>
            </td>
            <td>
              <div style="display:flex; gap:0.4rem;">
                <button onclick="editProduct(${p.id})" class="btn btn-outline btn-sm" title="Edit" style="color:#38BDF8; border-color:rgba(255,255,255,0.2);">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button onclick="deleteProduct(${p.id}, '${p.name}')" class="btn btn-outline btn-sm" title="Delete" style="color:#EF4444; border-color:rgba(255,255,255,0.2);">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error(e);
    }
  }

  window.openProductModal = function() {
    document.getElementById('edit-prod-id').value = '';
    document.getElementById('prod-modal-title').textContent = 'Add Refurbished Phone';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').style.display = 'flex';
  };

  window.closeProductModal = function() {
    document.getElementById('product-modal').style.display = 'none';
  };

  window.editProduct = function(id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    document.getElementById('edit-prod-id').value = p.id;
    document.getElementById('prod-modal-title').textContent = 'Edit Refurbished Phone';

    document.getElementById('p-name').value = p.name;
    document.getElementById('p-brand').value = p.brand;
    document.getElementById('p-orig-price').value = p.original_price;
    document.getElementById('p-sell-price').value = p.selling_price;
    document.getElementById('p-ram').value = p.ram;
    document.getElementById('p-storage').value = p.storage;
    document.getElementById('p-battery').value = p.battery_health;
    document.getElementById('p-grade').value = p.grade;
    document.getElementById('p-display').value = p.display_condition;
    document.getElementById('p-camera').value = p.camera_condition;
    document.getElementById('p-body').value = p.body_condition;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-color').value = p.color || '';
    document.getElementById('p-image-url').value = p.images[0] || '';
    document.getElementById('p-desc').value = p.description || '';

    document.getElementById('product-modal').style.display = 'flex';
  };

  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-prod-id').value;

    const payload = {
      name: document.getElementById('p-name').value.trim(),
      brand: document.getElementById('p-brand').value,
      original_price: document.getElementById('p-orig-price').value,
      selling_price: document.getElementById('p-sell-price').value,
      ram: document.getElementById('p-ram').value.trim(),
      storage: document.getElementById('p-storage').value.trim(),
      battery_health: document.getElementById('p-battery').value,
      grade: document.getElementById('p-grade').value,
      display_condition: document.getElementById('p-display').value.trim(),
      camera_condition: document.getElementById('p-camera').value.trim(),
      body_condition: document.getElementById('p-body').value.trim(),
      stock: document.getElementById('p-stock').value,
      color: document.getElementById('p-color').value.trim(),
      images: [document.getElementById('p-image-url').value.trim()],
      description: document.getElementById('p-desc').value.trim(),
      accessories_included: ['Original Fast Adapter', 'Type-C / Lightning Cable', 'A TO Z Mobiles Eco Box', 'Warranty Card & Bill'],
      warranty: '6 Months Comprehensive Store Warranty + 7 Days Replacement'
    };

    try {
      const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: window.api.getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        closeProductModal();
        loadAdminProducts();
      }
    } catch (err) {
      alert('Save failed');
    }
  });

  window.deleteProduct = async function(id, name) {
    if (!confirm(`Delete "${name}" from inventory?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: window.api.getHeaders()
      });
      const data = await res.json();
      if (data.success) loadAdminProducts();
    } catch(e) {}
  };

  window.quickStockAdjust = async function(id, newStock) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: window.api.getHeaders(),
        body: JSON.stringify({ stock: newStock })
      });
      const data = await res.json();
      if (data.success) loadDashboardStats();
    } catch(e) {}
  };

  // --- CUSTOMERS ---
  async function loadAdminCustomers() {
    const tbody = document.getElementById('admin-customers-tbody');
    try {
      const res = await fetch('/api/admin/customers', { headers: window.api.getHeaders() });
      const data = await res.json();
      if (!data.success) return;

      tbody.innerHTML = (data.customers || []).map(c => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${c.email}</td>
          <td>${c.phone || '-'}</td>
          <td>${c.city ? `${c.city}, ${c.state}` : '-'}</td>
          <td><strong>${c.order_count}</strong> Orders</td>
          <td><strong style="color:#10B981;">${formatINR(c.total_spent)}</strong></td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }

  // --- COUPONS ---
  async function loadAdminCoupons() {
    const tbody = document.getElementById('admin-coupons-tbody');
    try {
      const res = await fetch('/api/admin/coupons', { headers: window.api.getHeaders() });
      const data = await res.json();
      if (!data.success) return;

      tbody.innerHTML = (data.coupons || []).map(c => `
        <tr>
          <td><strong style="color:#38BDF8; font-family:monospace;">${c.code}</strong></td>
          <td style="text-transform:capitalize;">${c.type}</td>
          <td><strong>${c.type === 'percentage' ? `${c.value}% OFF` : formatINR(c.value) + ' OFF'}</strong></td>
          <td>${formatINR(c.min_order_amount)}</td>
          <td>
            <button onclick="deleteCoupon(${c.id})" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:rgba(255,255,255,0.2);">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }

  window.openCouponModal = function() {
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-modal').style.display = 'flex';
  };
  window.closeCouponModal = function() {
    document.getElementById('coupon-modal').style.display = 'none';
  };

  document.getElementById('coupon-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      code: document.getElementById('cp-code').value.trim(),
      type: document.getElementById('cp-type').value,
      value: document.getElementById('cp-val').value,
      min_order_amount: document.getElementById('cp-min').value || 0
    };

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: window.api.getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        closeCouponModal();
        loadAdminCoupons();
      }
    } catch(e) {}
  });

  window.deleteCoupon = async function(id) {
    if (!confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: window.api.getHeaders()
      });
      const data = await res.json();
      if (data.success) loadAdminCoupons();
    } catch(e) {}
  };

  // --- QUICK EDIT WHATSAPP NUMBER ---
  window.saveAdminWhatsApp = async function() {
    const input = document.getElementById('quick-wa-input');
    const val = input.value.trim();
    if (!val) {
      alert('Please enter your WhatsApp number (e.g. +91 8248948451)');
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: window.api.getHeaders(),
        body: JSON.stringify({ whatsapp: val })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('current-wa-badge').textContent = val;
        alert(`✅ WhatsApp Number Successfully Updated to:\n${val}\n\nAll customer chat buttons, WhatsApp order confirmation links, and website buttons will now connect directly to this number!`);
        loadAdminSettings();
      } else {
        alert(data.message || 'Failed to update WhatsApp number');
      }
    } catch(e) {
      alert('Network error saving WhatsApp number');
    }
  };

  // --- SETTINGS ---
  async function loadAdminSettings() {
    try {
      const res = await fetch('/api/admin/settings', { headers: window.api.getHeaders() });
      const data = await res.json();
      if (!data.success) return;
      const s = data.settings || {};

      const currentWa = s.whatsapp || '+918248948451';
      if (document.getElementById('current-wa-badge')) {
        document.getElementById('current-wa-badge').textContent = currentWa;
      }
      if (document.getElementById('quick-wa-input')) {
        document.getElementById('quick-wa-input').value = currentWa;
      }

      if (document.getElementById('set-shop-name')) document.getElementById('set-shop-name').value = s.shop_name || 'A TO Z MOBILES';
      if (document.getElementById('set-whatsapp')) document.getElementById('set-whatsapp').value = currentWa;
      if (document.getElementById('set-phone')) document.getElementById('set-phone').value = s.phone || '+91 82489 48451';
      if (document.getElementById('set-upi')) document.getElementById('set-upi').value = s.upi_id || 'atozmobiles@okaxis';
      if (document.getElementById('set-address')) document.getElementById('set-address').value = s.address || '';
    } catch(e) {}
  }

  document.getElementById('admin-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      shop_name: document.getElementById('set-shop-name').value.trim(),
      whatsapp: document.getElementById('set-whatsapp').value.trim(),
      phone: document.getElementById('set-phone').value.trim(),
      upi_id: document.getElementById('set-upi').value.trim(),
      address: document.getElementById('set-address').value.trim()
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: window.api.getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) alert('Settings saved successfully!');
    } catch(e) {
      alert('Failed to save settings');
    }
  });

  // --- PASSWORD GENERATOR & STRENGTH CALCULATOR ---
  window.generateAndFillPassword = function() {
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsLower = 'abcdefghjkmnpqrstuvwxyz';
    const charsNums = '23456789';
    const charsSymbols = '@#$%&*+=!?';

    function pick(s) { return s[Math.floor(Math.random() * s.length)]; }

    // Generate high-security 16-character password e.g. AtoZ#8392!Kx$74v
    const generated = 'AtoZ#' + Math.floor(1000 + Math.random() * 9000) + pick(charsSymbols) + pick(charsUpper) + pick(charsLower) + pick(charsSymbols) + Math.floor(10 + Math.random() * 90);
    
    const newPwdInput = document.getElementById('pwd-new');
    const confirmPwdInput = document.getElementById('pwd-confirm');
    if (newPwdInput) {
      newPwdInput.value = generated;
      newPwdInput.type = 'text';
    }
    if (confirmPwdInput) {
      confirmPwdInput.value = generated;
      confirmPwdInput.type = 'text';
    }

    updatePasswordStrength(generated);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(generated).then(() => {
        alert(`🔐 Ultra-Strong Password Generated & Copied to Clipboard!\n\nPassword: ${generated}\n\nClick "Update & Save New Password" to save it.`);
      }).catch(() => {
        alert(`🔐 Ultra-Strong Password Generated:\n\n${generated}\n\nPlease write this password down and click "Update & Save New Password".`);
      });
    } else {
      alert(`🔐 Ultra-Strong Password Generated:\n\n${generated}\n\nPlease write this password down and click "Update & Save New Password".`);
    }
  };

  function updatePasswordStrength(val) {
    const bar = document.getElementById('pwd-strength-bar');
    const txt = document.getElementById('pwd-strength-text');
    if (!bar || !txt) return;

    if (!val) {
      bar.style.width = '0%';
      txt.textContent = 'None';
      txt.style.color = '#94A3B8';
      return;
    }

    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 2) {
      bar.style.width = '30%';
      bar.style.background = '#EF4444';
      txt.textContent = 'Weak';
      txt.style.color = '#EF4444';
    } else if (score <= 4) {
      bar.style.width = '70%';
      bar.style.background = '#F59E0B';
      txt.textContent = 'Strong';
      txt.style.color = '#F59E0B';
    } else {
      bar.style.width = '100%';
      bar.style.background = '#10B981';
      txt.textContent = 'Very Strong 💪';
      txt.style.color = '#10B981';
    }
  }

  const pwdInputEl = document.getElementById('pwd-new');
  if (pwdInputEl) {
    pwdInputEl.addEventListener('input', (e) => updatePasswordStrength(e.target.value));
  }

  const pwdFormEl = document.getElementById('admin-password-form');
  if (pwdFormEl) {
    pwdFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('pwd-current').value;
      const newPassword = document.getElementById('pwd-new').value;
      const confirmPassword = document.getElementById('pwd-confirm').value;

      if (newPassword !== confirmPassword) {
        alert('❌ New password and confirm password do not match!');
        return;
      }

      if (newPassword.length < 8) {
        alert('❌ New password must be at least 8 characters long!');
        return;
      }

      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: window.api.getHeaders(),
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (data.success) {
          alert(`✅ Admin Password Successfully Changed!\n\nYour new password is:\n${newPassword}\n\nPlease keep it safe.`);
          if (document.getElementById('ad-pass')) {
            document.getElementById('ad-pass').value = newPassword;
          }
          document.getElementById('pwd-current').value = '';
          document.getElementById('pwd-new').value = '';
          document.getElementById('pwd-confirm').value = '';
          updatePasswordStrength('');
        } else {
          alert('❌ ' + (data.message || 'Failed to update password'));
        }
      } catch (err) {
        alert('❌ Network error while updating password');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAdminAuth);
  } else {
    checkAdminAuth();
  }
})();
