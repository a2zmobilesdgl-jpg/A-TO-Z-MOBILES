const { query, get, run } = require('../db.js');
const { hashPassword, verifyPassword, createToken, verifyToken } = require('../auth-util.js');

function extractToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function handleAuthRoute(req, res, pathname, body) {
  // POST /api/auth/register
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const { name, email, phone, password, address, city, state, pincode } = body || {};
    if (!name || !email || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Name, email, and password are required' }));
    }

    const existing = get('SELECT id FROM users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (existing) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'An account with this email already exists' }));
    }

    const hash = hashPassword(password);
    const result = run(`
      INSERT INTO users (name, email, phone, password_hash, role, address, city, state, pincode)
      VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?)
    `, [name.trim(), email.toLowerCase().trim(), phone || '', hash, address || '', city || '', state || '', pincode || '']);

    const user = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      role: 'customer',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || ''
    };

    const token = createToken(user);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Account created successfully', token, user }));
  }

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const { email, password } = body || {};
    if (!email || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Email and password are required' }));
    }

    const userRow = get('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!userRow || !verifyPassword(password, userRow.password_hash)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Invalid email or password' }));
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
      address: userRow.address,
      city: userRow.city,
      state: userRow.state,
      pincode: userRow.pincode
    };

    const token = createToken(user);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Logged in successfully', token, user }));
  }

  // GET /api/auth/me
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    if (!decoded) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Unauthorized or expired session' }));
    }

    const userRow = get('SELECT id, name, email, phone, role, address, city, state, pincode, created_at FROM users WHERE id = ?', [decoded.id]);
    if (!userRow) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'User not found' }));
    }

    // Fetch user recent orders
    const orders = query('SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY id DESC', [userRow.id, userRow.email]);
    orders.forEach(o => {
      try { o.items = JSON.parse(o.items_json); } catch(e) { o.items = []; }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, user: userRow, orders }));
  }

  // PUT /api/auth/profile
  if (pathname === '/api/auth/profile' && req.method === 'PUT') {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    if (!decoded) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
    }

    const { name, phone, address, city, state, pincode } = body || {};
    run(`
      UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
      address = COALESCE(?, address), city = COALESCE(?, city),
      state = COALESCE(?, state), pincode = COALESCE(?, pincode)
      WHERE id = ?
    `, [name, phone, address, city, state, pincode, decoded.id]);

    const updated = get('SELECT id, name, email, phone, role, address, city, state, pincode FROM users WHERE id = ?', [decoded.id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Profile updated', user: updated }));
  }

  // POST /api/auth/change-password
  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    if (!decoded) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Unauthorized. Please login again.' }));
    }

    const { currentPassword, newPassword } = body || {};
    if (!newPassword || newPassword.length < 6) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'New password must be at least 6 characters' }));
    }

    const userRow = get('SELECT id, password_hash FROM users WHERE id = ?', [decoded.id]);
    if (!userRow) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'User not found' }));
    }

    if (currentPassword && !verifyPassword(currentPassword, userRow.password_hash)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Current password does not match' }));
    }

    const newHash = hashPassword(newPassword);
    run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, decoded.id]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Password changed successfully! Keep your new password safe.' }));
  }

  return false;
}

module.exports = { handleAuthRoute, extractToken, verifyToken };
