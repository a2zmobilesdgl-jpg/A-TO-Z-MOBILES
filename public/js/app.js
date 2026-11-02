// A TO Z MOBILES - Core Application Controller
(function() {
  'use strict';

  // --- STATE STORES ---
  const CART_KEY = 'atoz_cart';
  const WISHLIST_KEY = 'atoz_wishlist';
  const USER_KEY = 'atoz_user';

  const AppState = {
    cart: JSON.parse(localStorage.getItem(CART_KEY) || '[]'),
    wishlist: JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'),
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    config: null
  };

  // --- UTILITIES ---
  function formatCurrency(num) {
    if (isNaN(num)) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
  }

  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- CART MANAGEMENT ---
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(AppState.cart));
    updateNavBadges();
  }

  function addToCart(product, quantity = 1, showNotification = true) {
    const existing = AppState.cart.find(item => item.id === product.id);
    const qtyToAdd = parseInt(quantity, 10) || 1;

    if (existing) {
      if (product.stock && (existing.quantity + qtyToAdd) > product.stock) {
        showToast(`Only ${product.stock} units available in stock`, 'error');
        return false;
      }
      existing.quantity += qtyToAdd;
    } else {
      if (product.stock && qtyToAdd > product.stock) {
        showToast(`Only ${product.stock} units available in stock`, 'error');
        return false;
      }
      let img = '';
      if (Array.isArray(product.images) && product.images.length > 0) {
        img = product.images[0];
      } else if (typeof product.images === 'string') {
        img = product.images;
      }

      AppState.cart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        model: product.model,
        price: product.selling_price,
        original_price: product.original_price,
        ram: product.ram,
        storage: product.storage,
        grade: product.grade,
        battery_health: product.battery_health,
        image: img,
        stock: product.stock,
        quantity: qtyToAdd
      });
    }

    saveCart();
    if (showNotification) {
      showToast(`"${product.name}" added to cart!`, 'success');
    }
    return true;
  }

  function updateCartQuantity(productId, newQty) {
    const item = AppState.cart.find(i => i.id === productId);
    if (!item) return;

    newQty = parseInt(newQty, 10);
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      if (item.stock && newQty > item.stock) {
        showToast(`Only ${item.stock} in stock!`, 'error');
        item.quantity = item.stock;
      } else {
        item.quantity = newQty;
      }
      saveCart();
    }
  }

  function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    saveCart();
    showToast('Item removed from cart', 'info');
  }

  function getCartSubtotal() {
    return AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function getCartCount() {
    return AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function clearCart() {
    AppState.cart = [];
    saveCart();
  }

  // --- WISHLIST MANAGEMENT ---
  function saveWishlist() {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(AppState.wishlist));
    updateNavBadges();
  }

  function toggleWishlist(product) {
    const idx = AppState.wishlist.findIndex(item => item.id === product.id);
    if (idx > -1) {
      AppState.wishlist.splice(idx, 1);
      saveWishlist();
      showToast(`Removed "${product.name}" from wishlist`, 'info');
      return false;
    } else {
      let img = '';
      if (Array.isArray(product.images) && product.images.length > 0) {
        img = product.images[0];
      } else if (typeof product.images === 'string') {
        img = product.images;
      }

      AppState.wishlist.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.selling_price,
        original_price: product.original_price,
        discount_percent: product.discount_percent,
        ram: product.ram,
        storage: product.storage,
        grade: product.grade,
        battery_health: product.battery_health,
        image: img,
        stock: product.stock
      });
      saveWishlist();
      showToast(`Added "${product.name}" to wishlist!`, 'success');
      return true;
    }
  }

  function isInWishlist(productId) {
    return AppState.wishlist.some(item => item.id === productId);
  }

  // --- UI BADGES SYNC ---
  function updateNavBadges() {
    const cartBadges = document.querySelectorAll('.cart-count-badge');
    const count = getCartCount();
    cartBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    const wishlistBadges = document.querySelectorAll('.wishlist-count-badge');
    const wCount = AppState.wishlist.length;
    wishlistBadges.forEach(badge => {
      badge.textContent = wCount;
      badge.style.display = wCount > 0 ? 'flex' : 'none';
    });

    const userAccountLabels = document.querySelectorAll('.user-account-label');
    userAccountLabels.forEach(label => {
      if (AppState.user && AppState.user.name) {
        label.textContent = AppState.user.name.split(' ')[0];
      } else {
        label.textContent = 'Account';
      }
    });
  }

  // --- WHATSAPP LAUNCHER ---
  function openWhatsApp(productName = '', price = '') {
    const phone = AppState.config?.whatsapp || '+919876543210';
    let text = `Hi A TO Z MOBILES! I am browsing your refurbished store.`;
    if (productName) {
      text = `Hi A TO Z MOBILES! I am interested in purchasing "${productName}" priced at ${price}. Please let me know the condition and availability!`;
    }
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  // --- INSTANT SEARCH DROPDOWN ---
  function initHeaderSearch() {
    const searchInput = document.getElementById('header-search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    if (!searchInput || !searchDropdown) return;

    let debounceTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      const query = this.value.trim();
      if (query.length < 2) {
        searchDropdown.style.display = 'none';
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const res = await window.api.getProducts({ search: query, limit: 5 });
          if (res.success && res.products.length > 0) {
            searchDropdown.innerHTML = res.products.map(p => `
              <a href="/product.html?id=${p.id}" class="search-item">
                <img src="${p.images[0] || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100'}" class="search-item-img" alt="${p.name}">
                <div class="search-item-info">
                  <div class="search-item-title">${p.name}</div>
                  <div class="search-item-meta">
                    <span class="pill-battery"><i class="fa-solid fa-battery-three-quarters"></i> ${p.battery_health}%</span>
                    <span>${p.grade}</span>
                  </div>
                </div>
                <div class="search-item-price">${formatCurrency(p.selling_price)}</div>
              </a>
            `).join('') + `
              <a href="/shop.html?search=${encodeURIComponent(query)}" style="display:block; text-align:center; padding: 0.6rem; background: var(--bg-subtle); font-size: 0.8125rem; font-weight:600; color:var(--primary);">
                View all results for "${query}" &rarr;
              </a>
            `;
            searchDropdown.style.display = 'block';
          } else {
            searchDropdown.innerHTML = `<div style="padding: 1rem; text-align:center; color: #94A3B8; font-size: 0.875rem;">No refurbished phones found matching "${query}"</div>`;
            searchDropdown.style.display = 'block';
          }
        } catch (e) {
          console.error('Search error:', e);
        }
      }, 250);
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
      }
    });

    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) window.location.href = `/shop.html?search=${encodeURIComponent(q)}`;
      });
    }
  }

  // --- MOBILE BOTTOM APP BAR ---
  function renderMobileBottomNav() {
    if (document.querySelector('.mobile-bottom-nav')) return;
    // Don't render on admin dashboard
    if (window.location.pathname.startsWith('/admin')) return;

    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('aria-label', 'Mobile Navigation');

    const curPath = window.location.pathname;
    const isHome = curPath === '/' || curPath.endsWith('/index.html') || curPath === '';
    const isShop = curPath.includes('shop');
    const isCart = curPath.includes('cart');

    const rawPhone = (AppState.config && AppState.config.phone) ? AppState.config.phone : '+91 98765 43210';
    const telLink = 'tel:' + rawPhone.replace(/[^0-9+]/g, '');

    nav.innerHTML = `
      <ul class="mobile-nav-items">
        <li>
          <a href="/" class="mobile-nav-link ${isHome ? 'active' : ''}">
            <i class="fa-solid fa-house"></i>
            <span>Home</span>
          </a>
        </li>
        <li>
          <a href="/shop.html" class="mobile-nav-link ${isShop ? 'active' : ''}">
            <i class="fa-solid fa-mobile-screen"></i>
            <span>Phones</span>
          </a>
        </li>
        <li>
          <a href="${telLink}" class="mobile-nav-link highlight-call" id="mobile-call-nav-btn">
            <i class="fa-solid fa-phone-volume"></i>
            <span>Call Us</span>
          </a>
        </li>
        <li>
          <a href="javascript:void(0)" onclick="AtoZ.openWhatsApp()" class="mobile-nav-link highlight-wa">
            <i class="fa-brands fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
        </li>
        <li>
          <a href="/cart.html" class="mobile-nav-link ${isCart ? 'active' : ''}">
            <i class="fa-solid fa-bag-shopping"></i>
            <span>Cart</span>
            <span class="mobile-cart-badge cart-count-badge" style="display:none;">0</span>
          </a>
        </li>
      </ul>
    `;
    document.body.appendChild(nav);
  }

  // --- INIT APPLICATION ---
  async function init() {
    renderMobileBottomNav();
    updateNavBadges();
    initHeaderSearch();

    try {
      const configRes = await window.api.getConfig();
      if (configRes.success) {
        AppState.config = configRes.config;
        const callBtn = document.getElementById('mobile-call-nav-btn');
        if (callBtn && configRes.config.phone) {
          callBtn.href = 'tel:' + configRes.config.phone.replace(/[^0-9+]/g, '');
        }
      }
    } catch (e) {}

    // Attach WhatsApp float button listener if present
    const floatBtn = document.getElementById('floating-whatsapp');
    if (floatBtn) {
      floatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsApp();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to window
  window.AtoZ = {
    AppState,
    formatCurrency,
    showToast,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartSubtotal,
    getCartCount,
    clearCart,
    toggleWishlist,
    isInWishlist,
    updateNavBadges,
    openWhatsApp
  };
})();
