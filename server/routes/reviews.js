const { query, get, run } = require('../db.js');

function handleReviewsRoute(req, res, pathname, body) {
  // GET /api/reviews/product/:id
  const matchGet = pathname.match(/^\/api\/reviews\/product\/(\d+)$/);
  if (matchGet && req.method === 'GET') {
    const productId = parseInt(matchGet[1], 10);
    const reviews = query('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC', [productId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, reviews }));
  }

  // POST /api/reviews
  if (pathname === '/api/reviews' && req.method === 'POST') {
    const { product_id, user_name, rating, title, comment } = body || {};
    if (!product_id || !user_name || !rating || !comment) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Product ID, name, rating, and comment are required' }));
    }

    const numRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    run(`
      INSERT INTO reviews (product_id, user_name, rating, title, comment, verified_purchase)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [product_id, user_name.trim(), numRating, (title || 'Verified Buyer Review').trim(), comment.trim()]);

    // Recalculate average rating & reviews_count for product
    const stats = get('SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE product_id = ?', [product_id]);
    const avg = stats && stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 5.0;
    const count = stats ? stats.count : 1;

    run('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?', [avg, count, product_id]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      rating: avg,
      reviewsCount: count
    }));
  }

  return false;
}

module.exports = { handleReviewsRoute };
