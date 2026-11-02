const crypto = require('node:crypto');
const { query, get, run } = require('../db.js');
const { verifyToken, extractToken } = require('./auth.js');

function generateOrderId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AZM-${year}-${randomNum}`;
}

function getSetting(key, fallback = '') {
  const row = get('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : fallback;
}

function handlePaymentRoute(req, res, pathname, body) {
  // POST /api/payment/create-order (Supports Phone Call Confirmation & COD)
  if (pathname === '/api/payment/create-order' && req.method === 'POST') {
    const { items, customer, couponCode, paymentMethod } = body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Cart is empty' }));
    }

    if (!customer || !customer.name || !customer.phone) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Customer name and phone number are required for order call confirmation' }));
    }

    // Verify stock and calculate subtotal
    let subtotal = 0;
    const verifiedItems = [];

    for (const cartItem of items) {
      const product = get('SELECT id, name, brand, model, selling_price, stock, images, ram, storage, grade, battery_health FROM products WHERE id = ?', [cartItem.id]);
      if (!product) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: `Product "${cartItem.name || cartItem.id}" is no longer available` }));
      }

      const qty = parseInt(cartItem.quantity, 10) || 1;
      let imgUrl = '';
      try {
        const parsedImages = JSON.parse(product.images);
        imgUrl = parsedImages[0] || '';
      } catch (e) {
        imgUrl = product.images;
      }

      subtotal += product.selling_price * qty;
      verifiedItems.push({
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        model: product.model,
        price: product.selling_price,
        quantity: qty,
        image: imgUrl,
        ram: product.ram,
        storage: product.storage,
        grade: product.grade,
        battery_health: product.battery_health
      });
    }

    // Apply Coupon if present
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = get('SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1', [couponCode.toUpperCase().trim()]);
      if (coupon && subtotal >= coupon.min_order_amount) {
        if (coupon.type === 'percentage') {
          discount = Math.round((subtotal * coupon.value) / 100);
        } else {
          discount = coupon.value;
        }
        if (discount > subtotal) discount = subtotal;
        appliedCoupon = coupon.code;
      }
    }

    const shippingFee = 0; // Free express delivery
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);
    const orderId = generateOrderId();
    
    // Default method: 'call_confirm' (Cash on Delivery with Phone Call Confirmation)
    const method = (paymentMethod === 'online' || paymentMethod === 'razorpay') ? 'razorpay' : 'call_confirm';

    // Optional user token
    let userId = null;
    const token = extractToken(req);
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      userId = decoded.id;
    }

    // Status: Pending Call Confirmation
    const initialStatus = method === 'call_confirm' ? 'Awaiting Call Confirmation' : 'Placed';
    const initialPaymentStatus = 'Pay on Delivery (Unpaid)';

    // Insert order in database
    run(`
      INSERT INTO orders (
        order_id, user_id, customer_name, customer_email, customer_phone,
        shipping_address, city, state, pincode, total_amount, discount_amount,
        coupon_code, payment_method, payment_status, razorpay_order_id,
        order_status, tracking_number, courier_partner, items_json
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `, [
      orderId,
      userId,
      customer.name.trim(),
      (customer.email || 'customer@order.com').trim(),
      customer.phone.trim(),
      (customer.address || 'Address provided via phone confirmation').trim(),
      (customer.city || '').trim(),
      (customer.state || '').trim(),
      (customer.pincode || '').trim(),
      totalAmount,
      discount,
      appliedCoupon || '',
      method,
      initialPaymentStatus,
      '',
      initialStatus,
      `BLUEDART-AZM-${Math.floor(100000 + Math.random() * 900000)}`,
      'Blue Dart Express',
      JSON.stringify(verifiedItems)
    ]);

    // Decrement stock for call_confirm orders
    for (const item of verifiedItems) {
      run('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?', [item.quantity, item.product_id]);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      orderId,
      amount: totalAmount,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      },
      paymentMethod: method,
      orderStatus: initialStatus,
      message: 'Order placed successfully! Our executive will call you within 15-30 minutes to confirm your order details and delivery address.'
    }));
  }

  // POST /api/orders/quick-call (1-Click Instant Order by Phone from Product Page)
  if (pathname === '/api/orders/quick-call' && req.method === 'POST') {
    const productId = body ? (body.productId || body.product_id) : null;
    const name = body ? (body.name || body.customerName || body.customer_name) : null;
    const phone = body ? (body.phone || body.customerPhone || body.customer_phone) : null;
    const city = body ? (body.city || '') : '';

    if (!productId || !name || !phone) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Phone ID, your name, and mobile number are required' }));
    }

    const product = get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Phone not found' }));
    }

    let imgUrl = '';
    try {
      const parsedImages = JSON.parse(product.images);
      imgUrl = parsedImages[0] || '';
    } catch(e) {
      imgUrl = product.images;
    }

    const orderId = generateOrderId();
    const item = [{
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      price: product.selling_price,
      quantity: 1,
      image: imgUrl,
      ram: product.ram,
      storage: product.storage,
      grade: product.grade,
      battery_health: product.battery_health
    }];

    run(`
      INSERT INTO orders (
        order_id, customer_name, customer_email, customer_phone,
        shipping_address, city, state, pincode, total_amount, discount_amount,
        coupon_code, payment_method, payment_status, razorpay_order_id,
        order_status, tracking_number, courier_partner, items_json
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `, [
      orderId,
      name.trim(),
      'call-order@atozmobiles.in',
      phone.trim(),
      `Address to be collected during verification call. City: ${city || 'Not specified'}`,
      city || '',
      '',
      '',
      product.selling_price,
      0,
      '',
      'call_confirm',
      'Pay on Delivery (Unpaid)',
      '',
      'Awaiting Call Confirmation',
      `BLUEDART-AZM-${Math.floor(100000 + Math.random() * 900000)}`,
      'Blue Dart Express',
      JSON.stringify(item)
    ]);

    run('UPDATE products SET stock = MAX(0, stock - 1) WHERE id = ?', [product.id]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      orderId,
      message: `Order request #${orderId} received! Our team will call you at ${phone} immediately to confirm.`
    }));
  }

  // GET /api/orders/:orderId
  const matchOrder = pathname.match(/^\/api\/orders\/([A-Za-z0-9\-]+)$/);
  if (matchOrder && req.method === 'GET') {
    const orderId = matchOrder[1];
    const order = get('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (!order) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Order not found' }));
    }

    try { order.items = JSON.parse(order.items_json); } catch(e) { order.items = []; }

    // Generate invoice receipt data
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const invoice = {
      invoiceNumber: `INV-${order.order_id.replace('AZM-', '')}`,
      invoiceDate: new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      shopName: getSetting('shop_name', 'A TO Z MOBILES'),
      shopAddress: getSetting('address', '#42, Commercial Complex, Chennai - 600040'),
      shopGst: '33AAICA2026M1Z8',
      shopPhone: getSetting('phone', '+91 98765 43210'),
      shopEmail: getSetting('email', 'support@atozmobiles.in'),
      subtotal,
      discount: order.discount_amount,
      taxableAmount: Math.round(order.total_amount / 1.18),
      gstAmount: Math.round(order.total_amount - (order.total_amount / 1.18)),
      total: order.total_amount,
      warrantyText: getSetting('warranty_period', '6 Months Comprehensive Store Warranty'),
      replacementText: getSetting('replacement_days', '7 Days Hassle-Free Replacement')
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, order, invoice }));
  }

  // GET /api/orders/track/:orderId
  const matchTrack = pathname.match(/^\/api\/orders\/track\/([A-Za-z0-9\-]+)$/);
  if (matchTrack && req.method === 'GET') {
    const orderId = matchTrack[1];
    const order = get('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (!order) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Order not found' }));
    }

    try { order.items = JSON.parse(order.items_json); } catch(e) { order.items = []; }

    // Stepper stages
    const stages = [
      { key: 'Received', label: 'Order Received', desc: 'Awaiting Phone Call Confirmation' },
      { key: 'Confirmed', label: 'Phone Call Confirmed', desc: 'Customer verified address & specs' },
      { key: 'Inspected', label: '32-Point Quality Lab Check', desc: 'Hardware, battery health & camera tested' },
      { key: 'Dispatched', label: 'Dispatched with Courier', desc: `Handed to ${order.courier_partner || 'Blue Dart Express'} (AWB: ${order.tracking_number || 'Pending'})` },
      { key: 'Delivered', label: 'Delivered & Paid', desc: 'Payment collected upon doorstep delivery' }
    ];

    let currentStepIndex = 0;
    const statusLower = (order.order_status || '').toLowerCase();
    if (statusLower.includes('cancel')) {
      currentStepIndex = -1;
    } else if (statusLower.includes('deliver')) {
      currentStepIndex = 4;
    } else if (statusLower.includes('dispatch') || statusLower.includes('ship')) {
      currentStepIndex = 3;
    } else if (statusLower.includes('inspect') || statusLower.includes('pack')) {
      currentStepIndex = 2;
    } else if (statusLower.includes('confirm') || statusLower.includes('placed')) {
      currentStepIndex = 1;
    } else {
      currentStepIndex = 0;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      order,
      stages,
      currentStepIndex,
      isCancelled: currentStepIndex === -1
    }));
  }

  // POST /api/payment/verify (For optional online payments)
  if (pathname === '/api/payment/verify' && req.method === 'POST') {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body || {};
    run(`
      UPDATE orders
      SET payment_status = 'paid', razorpay_payment_id = ?, razorpay_signature = ?, order_status = 'Call Confirmed (Paid)', updated_at = CURRENT_TIMESTAMP
      WHERE order_id = ?
    `, [razorpay_payment_id || 'manual_verify', razorpay_signature || '', orderId]);

    const updatedOrder = get('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Payment recorded', order: updatedOrder }));
  }

  return false;
}

module.exports = { handlePaymentRoute };
