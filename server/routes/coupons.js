const { query, get } = require('../db.js');

function handleCouponsRoute(req, res, pathname, body) {
  // GET /api/coupons
  if (pathname === '/api/coupons' && req.method === 'GET') {
    const coupons = query('SELECT code, type, value, min_order_amount FROM coupons WHERE is_active = 1');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, coupons }));
  }

  // POST /api/coupons/apply
  if (pathname === '/api/coupons/apply' && req.method === 'POST') {
    const { code, orderAmount } = body || {};
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Coupon code is required' }));
    }

    const coupon = get('SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1', [code.toUpperCase().trim()]);
    if (!coupon) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Invalid or expired coupon code' }));
    }

    const subtotal = parseFloat(orderAmount) || 0;
    if (subtotal < coupon.min_order_amount) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.min_order_amount.toLocaleString('en-IN')}`
      }));
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    // Never exceed subtotal
    if (discount > subtotal) discount = subtotal;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      discount,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discount.toLocaleString('en-IN')}`,
      coupon: {
        code: coupon.code,
        discountAmount: discount,
        type: coupon.type,
        value: coupon.value
      }
    }));
  }

  return false;
}

module.exports = { handleCouponsRoute };
