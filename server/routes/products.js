const { query, get } = require('../db.js');

function handleProductsRoute(req, res, pathname, queryParams) {
  // GET /api/categories
  if (pathname === '/api/categories') {
    const categories = query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON LOWER(p.brand) = LOWER(c.name)
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, categories }));
  }

  // GET /api/products/:id
  const matchSingle = pathname.match(/^\/api\/products\/(\d+)$/);
  if (matchSingle) {
    const id = parseInt(matchSingle[1], 10);
    const product = get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Product not found' }));
    }

    // Parse JSON fields
    try { product.images = JSON.parse(product.images); } catch(e) { product.images = []; }
    try { product.accessories_included = JSON.parse(product.accessories_included); } catch(e) { product.accessories_included = []; }
    try { product.specs = JSON.parse(product.specs); } catch(e) { product.specs = {}; }

    // Fetch reviews
    const reviews = query('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC', [id]);
    
    // Fetch related products (same brand or similar price range)
    const related = query(`
      SELECT id, name, brand, model, selling_price, original_price, discount_percent, grade, battery_health, images, rating, reviews_count
      FROM products
      WHERE brand = ? AND id != ?
      LIMIT 4
    `, [product.brand, id]);

    related.forEach(item => {
      try { item.images = JSON.parse(item.images); } catch(e) { item.images = []; }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, product, reviews, related }));
  }

  // GET /api/products
  if (pathname === '/api/products') {
    const conditions = [];
    const params = [];

    // Search query
    if (queryParams.search) {
      conditions.push('(name LIKE ? OR brand LIKE ? OR model LIKE ? OR description LIKE ?)');
      const term = `%${queryParams.search}%`;
      params.push(term, term, term, term);
    }

    // Brand filter
    if (queryParams.brand && queryParams.brand !== 'all') {
      const brands = queryParams.brand.split(',').map(b => b.trim());
      const placeholders = brands.map(() => '?').join(',');
      conditions.push(`LOWER(brand) IN (${placeholders})`);
      brands.forEach(b => params.push(b.toLowerCase()));
    }

    // Price range
    if (queryParams.min_price) {
      conditions.push('selling_price >= ?');
      params.push(parseFloat(queryParams.min_price));
    }
    if (queryParams.max_price) {
      conditions.push('selling_price <= ?');
      params.push(parseFloat(queryParams.max_price));
    }

    // RAM filter
    if (queryParams.ram) {
      const rams = queryParams.ram.split(',').map(r => r.trim());
      const orClauses = rams.map(() => 'ram LIKE ?').join(' OR ');
      conditions.push(`(${orClauses})`);
      rams.forEach(r => params.push(`%${r}%`));
    }

    // Storage filter
    if (queryParams.storage) {
      const storages = queryParams.storage.split(',').map(s => s.trim());
      const orClauses = storages.map(() => 'storage LIKE ?').join(' OR ');
      conditions.push(`(${orClauses})`);
      storages.forEach(s => params.push(`%${s}%`));
    }

    // Grade filter
    if (queryParams.grade) {
      conditions.push('grade LIKE ?');
      params.push(`%${queryParams.grade}%`);
    }

    // Battery health filter
    if (queryParams.min_battery) {
      conditions.push('battery_health >= ?');
      params.push(parseInt(queryParams.min_battery, 10));
    }

    // Featured / Latest / Special Offers
    if (queryParams.featured === '1') {
      conditions.push('is_featured = 1');
    }
    if (queryParams.latest === '1') {
      conditions.push('is_latest = 1');
    }
    if (queryParams.special_offer === '1') {
      conditions.push('is_special_offer = 1');
    }

    // In stock only
    if (queryParams.in_stock === '1') {
      conditions.push('stock > 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'id DESC';
    switch (queryParams.sort) {
      case 'price_asc':
        orderBy = 'selling_price ASC';
        break;
      case 'price_desc':
        orderBy = 'selling_price DESC';
        break;
      case 'discount':
        orderBy = 'discount_percent DESC';
        break;
      case 'rating':
        orderBy = 'rating DESC, reviews_count DESC';
        break;
      case 'battery':
        orderBy = 'battery_health DESC';
        break;
      case 'newest':
      default:
        orderBy = 'id DESC';
        break;
    }

    // Pagination
    const limit = parseInt(queryParams.limit, 10) || 50;
    const offset = parseInt(queryParams.offset, 10) || 0;

    const countRow = get(`SELECT COUNT(*) as total FROM products ${whereClause}`, params);
    const total = countRow ? countRow.total : 0;

    const sql = `SELECT * FROM products ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const rows = query(sql, [...params, limit, offset]);

    rows.forEach(item => {
      try { item.images = JSON.parse(item.images); } catch(e) { item.images = []; }
      try { item.accessories_included = JSON.parse(item.accessories_included); } catch(e) { item.accessories_included = []; }
      try { item.specs = JSON.parse(item.specs); } catch(e) { item.specs = {}; }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      total,
      products: rows,
      limit,
      offset
    }));
  }

  return false;
}

module.exports = { handleProductsRoute };
