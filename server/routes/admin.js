const { query, get, run } = require('../db.js');
const { verifyToken, extractToken } = require('./auth.js');
const fs = require('node:fs');
const path = require('node:path');

function requireAdmin(req, res) {
  const token = extractToken(req);
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Admin access required. Please login as admin.' }));
    return null;
  }
  return decoded;
}

function handleAdminRoute(req, res, pathname, queryParams, body) {
  if (!pathname.startsWith('/api/admin')) {
    return false;
  }

  const adminUser = requireAdmin(req, res);
  if (!adminUser) return true;

  // GET /api/admin/stats
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    const totalSalesRow = get("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid' OR payment_status LIKE '%Paid%'");
    const totalOrdersRow = get('SELECT COUNT(*) as count FROM orders');
    const pendingCallsRow = get("SELECT COUNT(*) as count FROM orders WHERE order_status LIKE '%Awaiting%' OR order_status LIKE '%Placed%'");
    const totalProductsRow = get('SELECT COUNT(*) as count, SUM(stock) as total_stock FROM products');
    const totalUsersRow = get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const lowStockProducts = query('SELECT id, name, brand, model, stock, selling_price FROM products WHERE stock <= 2 ORDER BY stock ASC');
    const recentOrders = query('SELECT * FROM orders ORDER BY id DESC LIMIT 10');

    recentOrders.forEach(o => {
      try { o.items = JSON.parse(o.items_json); } catch(e) { o.items = []; }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      stats: {
        totalSales: totalSalesRow && totalSalesRow.total ? totalSalesRow.total : 0,
        totalOrders: totalOrdersRow ? totalOrdersRow.count : 0,
        pendingCalls: pendingCallsRow ? pendingCallsRow.count : 0,
        totalProducts: totalProductsRow ? totalProductsRow.count : 0,
        totalStock: totalProductsRow && totalProductsRow.total_stock ? totalProductsRow.total_stock : 0,
        totalCustomers: totalUsersRow ? totalUsersRow.count : 0
      },
      lowStockProducts,
      recentOrders
    }));
  }

  // 1-CLICK QUICK ACTION: Confirm Phone Call (Supports ID or Order ID string)
  const matchConfirmCall = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9\-]+)\/confirm-call$/);
  if (matchConfirmCall && req.method === 'POST') {
    const ident = matchConfirmCall[1];
    run(`
      UPDATE orders
      SET order_status = 'Phone Call Confirmed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR order_id = ?
    `, [parseInt(ident, 10) || 0, ident]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Order phone call confirmed! Status moved to Confirmed.' }));
  }

  // 1-CLICK QUICK ACTION: Dispatch with Courier
  const matchDispatch = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9\-]+)\/quick-dispatch$/);
  if (matchDispatch && req.method === 'POST') {
    const ident = matchDispatch[1];
    const tracking = `BLUEDART-${Math.floor(1000000 + Math.random() * 9000000)}`;
    run(`
      UPDATE orders
      SET order_status = 'Dispatched', tracking_number = COALESCE(NULLIF(tracking_number, ''), ?), courier_partner = 'Blue Dart Express', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR order_id = ?
    `, [tracking, parseInt(ident, 10) || 0, ident]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Order marked as Dispatched via Blue Dart Express!', trackingNumber: tracking, tracking }));
  }

  // 1-CLICK QUICK ACTION: Mark Paid / Delivered
  const matchDelivered = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9\-]+)\/mark-delivered$/);
  if (matchDelivered && req.method === 'POST') {
    const ident = matchDelivered[1];
    run(`
      UPDATE orders
      SET order_status = 'Delivered', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR order_id = ?
    `, [parseInt(ident, 10) || 0, ident]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Order marked as Delivered and Payment collected!' }));
  }

  // 1-CLICK QUICK ACTION: Cancel Order (Restores stock)
  const matchCancel = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9\-]+)\/cancel$/);
  if (matchCancel && req.method === 'POST') {
    const ident = matchCancel[1];
    const order = get('SELECT items_json FROM orders WHERE id = ? OR order_id = ?', [parseInt(ident, 10) || 0, ident]);
    if (order) {
      try {
        const items = JSON.parse(order.items_json);
        for (const item of items) {
          run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      } catch(e) {}
    }
    run("UPDATE orders SET order_status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ? OR order_id = ?", [parseInt(ident, 10) || 0, ident]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Order cancelled and stock restored to inventory.' }));
  }

  // GET /api/admin/orders
  if (pathname === '/api/admin/orders' && req.method === 'GET') {
    let sql = 'SELECT * FROM orders';
    const params = [];
    if (queryParams.status) {
      sql += ' WHERE LOWER(order_status) LIKE ?';
      params.push(`%${queryParams.status.toLowerCase()}%`);
    }
    sql += ' ORDER BY id DESC';

    const orders = query(sql, params);
    orders.forEach(o => {
      try { o.items = JSON.parse(o.items_json); } catch(e) { o.items = []; }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, orders }));
  }

  // PUT /api/admin/orders/:id/status
  const matchOrderStatus = pathname.match(/^\/api\/admin\/orders\/(\d+)\/status$/);
  if (matchOrderStatus && req.method === 'PUT') {
    const id = parseInt(matchOrderStatus[1], 10);
    const { order_status, payment_status, tracking_number, courier_partner } = body || {};

    run(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        tracking_number = COALESCE(?, tracking_number),
        courier_partner = COALESCE(?, courier_partner),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [order_status, payment_status, tracking_number, courier_partner, id]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Order status updated successfully' }));
  }

  // GET /api/admin/products
  if (pathname === '/api/admin/products' && req.method === 'GET') {
    const products = query('SELECT * FROM products ORDER BY id DESC');
    products.forEach(p => {
      try { p.images = JSON.parse(p.images); } catch(e) { p.images = []; }
      try { p.accessories_included = JSON.parse(p.accessories_included); } catch(e) { p.accessories_included = []; }
      try { p.specs = JSON.parse(p.specs); } catch(e) { p.specs = {}; }
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, products }));
  }

  // POST /api/admin/products - Add product
  if (pathname === '/api/admin/products' && req.method === 'POST') {
    const p = body || {};
    if (!p.name || !p.brand || !p.selling_price || !p.ram || !p.storage) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Name, brand, price, RAM, and storage are required' }));
    }

    const originalPrice = parseFloat(p.original_price) || parseFloat(p.selling_price);
    const sellingPrice = parseFloat(p.selling_price);
    const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
    const imagesJson = Array.isArray(p.images) ? JSON.stringify(p.images) : (p.images ? JSON.stringify([p.images]) : '[]');
    const accessoriesJson = Array.isArray(p.accessories_included) ? JSON.stringify(p.accessories_included) : JSON.stringify([p.accessories_included || 'Fast Charger, USB Cable']);
    const specsJson = typeof p.specs === 'object' ? JSON.stringify(p.specs) : JSON.stringify({ note: p.specs || '' });

    const result = run(`
      INSERT INTO products (
        name, brand, model, original_price, selling_price, discount_percent,
        ram, storage, color, grade, battery_health, display_condition,
        camera_condition, body_condition, accessories_included, warranty,
        stock, images, description, specs, is_featured, is_latest, is_special_offer
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      p.name, p.brand, p.model || p.name, originalPrice, sellingPrice, discountPercent,
      p.ram, p.storage, p.color || 'Black', p.grade || 'Superb (Like New)',
      parseInt(p.battery_health, 10) || 92,
      p.display_condition || 'Flawless condition, 100% tested display',
      p.camera_condition || '100% Tested & Functional lenses',
      p.body_condition || 'Clean pristine frame',
      accessoriesJson,
      p.warranty || '6 Months Store Warranty + 7 Days Replacement',
      parseInt(p.stock, 10) || 1,
      imagesJson,
      p.description || '',
      specsJson,
      p.is_featured ? 1 : 0,
      p.is_latest ? 1 : 0,
      p.is_special_offer ? 1 : 0
    ]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Product added successfully', id: Number(result.lastInsertRowid) }));
  }

  // PUT /api/admin/products/:id - Edit product
  const matchEditProduct = pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (matchEditProduct && req.method === 'PUT') {
    const id = parseInt(matchEditProduct[1], 10);
    const p = body || {};

    const existing = get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Product not found' }));
    }

    const originalPrice = parseFloat(p.original_price) !== undefined ? parseFloat(p.original_price) : existing.original_price;
    const sellingPrice = parseFloat(p.selling_price) !== undefined ? parseFloat(p.selling_price) : existing.selling_price;
    const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

    let imagesJson = existing.images;
    if (p.images) {
      imagesJson = Array.isArray(p.images) ? JSON.stringify(p.images) : JSON.stringify([p.images]);
    }

    run(`
      UPDATE products SET
        name = COALESCE(?, name),
        brand = COALESCE(?, brand),
        original_price = ?,
        selling_price = ?,
        discount_percent = ?,
        ram = COALESCE(?, ram),
        storage = COALESCE(?, storage),
        battery_health = COALESCE(?, battery_health),
        grade = COALESCE(?, grade),
        display_condition = COALESCE(?, display_condition),
        camera_condition = COALESCE(?, camera_condition),
        body_condition = COALESCE(?, body_condition),
        stock = COALESCE(?, stock),
        images = ?,
        description = COALESCE(?, description)
      WHERE id = ?
    `, [
      p.name, p.brand, originalPrice, sellingPrice, discountPercent,
      p.ram, p.storage,
      p.battery_health !== undefined ? parseInt(p.battery_health, 10) : null,
      p.grade, p.display_condition, p.camera_condition, p.body_condition,
      p.stock !== undefined ? parseInt(p.stock, 10) : null,
      imagesJson, p.description, id
    ]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Product updated successfully' }));
  }

  // DELETE /api/admin/products/:id
  if (matchEditProduct && req.method === 'DELETE') {
    const id = parseInt(matchEditProduct[1], 10);
    run('DELETE FROM products WHERE id = ?', [id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Product deleted successfully' }));
  }

  // GET /api/admin/customers
  if (pathname === '/api/admin/customers' && req.method === 'GET') {
    const customers = query(`
      SELECT u.id, u.name, u.email, u.phone, u.city, u.state, u.created_at,
             COUNT(o.id) as order_count,
             COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id OR LOWER(o.customer_email) = LOWER(u.email)
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, customers }));
  }

  // GET /api/admin/coupons
  if (pathname === '/api/admin/coupons' && req.method === 'GET') {
    const coupons = query('SELECT * FROM coupons ORDER BY id DESC');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, coupons }));
  }

  // POST /api/admin/coupons
  if (pathname === '/api/admin/coupons' && req.method === 'POST') {
    const { code, type, value, min_order_amount } = body || {};
    run('INSERT INTO coupons (code, type, value, min_order_amount, is_active) VALUES (?, ?, ?, ?, 1)',
      [code.toUpperCase().trim(), type || 'percentage', parseFloat(value), parseFloat(min_order_amount) || 0]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Coupon created successfully' }));
  }

  // DELETE /api/admin/coupons/:id
  const matchCouponDelete = pathname.match(/^\/api\/admin\/coupons\/(\d+)$/);
  if (matchCouponDelete && req.method === 'DELETE') {
    const id = parseInt(matchCouponDelete[1], 10);
    run('DELETE FROM coupons WHERE id = ?', [id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Coupon deleted' }));
  }

  // GET /api/admin/settings
  if (pathname === '/api/admin/settings' && req.method === 'GET') {
    const rows = query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, settings }));
  }

  // PUT /api/admin/settings
  if (pathname === '/api/admin/settings' && req.method === 'PUT') {
    const settings = body || {};
    for (const [key, val] of Object.entries(settings)) {
      run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', [key, String(val), String(val)]);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Settings updated successfully' }));
  }

  return false;
}

module.exports = { handleAdminRoute };
