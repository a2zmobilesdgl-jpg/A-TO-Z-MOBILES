const http = require('node:http');
const url = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

const { handleProductsRoute } = require('./routes/products.js');
const { handleAuthRoute } = require('./routes/auth.js');
const { handleCouponsRoute } = require('./routes/coupons.js');
const { handleReviewsRoute } = require('./routes/reviews.js');
const { handlePaymentRoute } = require('./routes/payment.js');
const { handleAdminRoute } = require('./routes/admin.js');
const { get, query, run } = require('./db.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) { // 25MB max
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const queryParams = parsedUrl.query;

  let body = {};
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      body = await parseBody(req);
    } catch (e) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Payload too large' }));
    }
  }

  // API Routes
  try {
    // Public Config
    if (pathname === '/api/config' && req.method === 'GET') {
      const rows = query("SELECT key, value FROM settings WHERE key IN ('shop_name', 'tagline', 'phone', 'whatsapp', 'email', 'address', 'upi_id', 'razorpay_key_id', 'razorpay_mode', 'warranty_period', 'replacement_days')");
      const config = {};
      rows.forEach(r => { config[r.key] = r.value; });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, config }));
    }

    // Contact Form submission
    if (pathname === '/api/contact' && req.method === 'POST') {
      const { name, email, phone, subject, message } = body;
      console.log('New Contact Message:', { name, email, phone, subject, message });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Thank you for contacting A TO Z MOBILES! Our specialist team will reach out to you within 2 hours.'
      }));
    }

    // Route dispatchers
    if (handleProductsRoute(req, res, pathname, queryParams)) return;
    if (handleAuthRoute(req, res, pathname, body)) return;
    if (handleCouponsRoute(req, res, pathname, body)) return;
    if (handleReviewsRoute(req, res, pathname, body)) return;
    if (handlePaymentRoute(req, res, pathname, body)) return;
    if (handleAdminRoute(req, res, pathname, queryParams, body)) return;

    if (pathname.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'API endpoint not found' }));
    }
  } catch (err) {
    console.error('Server API error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, message: 'Internal server error: ' + err.message }));
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // If path doesn't have an extension, try checking .html (e.g. /shop -> /shop.html)
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Normalize and prevent path traversal
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(PUBLIC_DIR))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Return 404 or index.html fallback
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(notFoundPath).pipe(res);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Page Not Found - A TO Z MOBILES');
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache static assets, but not HTML
    if (['.js', '.css', '.svg', '.png', '.jpg', '.webp'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(resolvedPath).pipe(res);
  });
});

function startServer(port, attemptsLeft = 5) {
  const onError = (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.log(`\n⚠️  Notice: Port ${port} is currently in use.`);
      const nextPort = Number(port) + 1;
      console.log(`🔄 Automatically trying port ${nextPort}...\n`);
      server.removeListener('error', onError);
      try {
        server.close(() => {
          startServer(nextPort, attemptsLeft - 1);
        });
      } catch (closeErr) {
        startServer(nextPort, attemptsLeft - 1);
      }
    } else {
      console.error('Server startup error:', err);
    }
  };

  server.once('error', onError);

  server.listen(port, () => {
    server.removeListener('error', onError);
    console.log(`====================================================`);
    console.log(`  🚀 A TO Z MOBILES Server running on port ${port}`);
    console.log(`  🌐 Website URL:    http://localhost:${port}`);
    console.log(`  ⚙️  Admin Panel:    http://localhost:${port}/admin`);
    console.log(`  📦 Database:       SQLite (native node:sqlite)`);
    console.log(`  📞 Order Flow:     Call-to-Confirm & COD / WhatsApp`);
    console.log(`====================================================`);
  });
}

startServer(PORT);

