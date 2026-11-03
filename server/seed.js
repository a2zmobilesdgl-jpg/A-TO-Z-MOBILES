const { db, get, query, run } = require('./db.js');
const { hashPassword } = require('./auth-util.js');

console.log('--- Initializing A TO Z MOBILES Database ---');

// 1. Categories
const categories = [
  { name: 'Apple', slug: 'apple', icon: 'fa-brands fa-apple', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80' },
  { name: 'Samsung', slug: 'samsung', icon: 'fa-solid fa-mobile-screen', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80' },
  { name: 'OnePlus', slug: 'oneplus', icon: 'fa-solid fa-mobile', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80' },
  { name: 'Redmi', slug: 'redmi', icon: 'fa-solid fa-mobile-screen-button', image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&auto=format&fit=crop&q=80' },
  { name: 'Vivo', slug: 'vivo', icon: 'fa-solid fa-mobile-retro', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80' },
  { name: 'Oppo', slug: 'oppo', icon: 'fa-solid fa-tablet-screen-button', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80' },
  { name: 'Realme', slug: 'realme', icon: 'fa-solid fa-bolt', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80' }
];

run('DELETE FROM categories');
for (const cat of categories) {
  run('INSERT INTO categories (name, slug, icon, image) VALUES (?, ?, ?, ?)', [cat.name, cat.slug, cat.icon, cat.image]);
}
console.log('Categories initialized.');

// 2. Products - ZERO Demo Mobiles
// Real inventory is added directly by the admin via /admin!
// Remove all demo products so inventory is 100% clean for your real phones.
run('DELETE FROM products');
console.log('All demo products removed. Inventory is 100% clean for your real phones.');

// 3. Admin Account (Permanent Phone: +91 82489 48451)
const existingAdmin = get("SELECT id FROM users WHERE role = 'admin'");
if (existingAdmin) {
  run("UPDATE users SET phone = '+918248948451' WHERE role = 'admin'");
  console.log('Admin user updated with permanent phone.');
} else {
  const adminHash = hashPassword('admin123');
  run(`
    INSERT INTO users (name, email, phone, password_hash, role, address, city, state, pincode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, ['A TO Z Admin', 'admin@atozmobiles.in', '+918248948451', adminHash, 'admin', 'Shop #42, Commercial Complex', 'Chennai', 'Tamil Nadu', '600040']);
  console.log('Admin account created: admin@atozmobiles.in');
}

// 4. Coupons
const existingCoupons = get('SELECT COUNT(*) as count FROM coupons');
if (!existingCoupons || existingCoupons.count === 0) {
  const coupons = [
    { code: 'WELCOME500', type: 'flat', value: 500, min_order_amount: 9999 },
    { code: 'ATOZ10', type: 'percentage', value: 10, min_order_amount: 15000 },
    { code: 'FESTIVE1500', type: 'flat', value: 1500, min_order_amount: 25000 },
    { code: 'FREESHIP', type: 'flat', value: 200, min_order_amount: 499 }
  ];
  for (const c of coupons) {
    run('INSERT INTO coupons (code, type, value, min_order_amount, is_active) VALUES (?, ?, ?, ?, 1)', [c.code, c.type, c.value, c.min_order_amount]);
  }
}

// 5. Clean Demo Reviews & Orders
run('DELETE FROM reviews');
run('DELETE FROM orders');

// 6. Settings (Permanent Phone & WhatsApp: +91 82489 48451)
const permanentSettings = [
  { key: 'shop_name', value: 'A TO Z MOBILES' },
  { key: 'tagline', value: 'Certified Pre-Owned & Refurbished Smart Phones' },
  { key: 'phone', value: '+91 82489 48451' },
  { key: 'whatsapp', value: '+918248948451' },
  { key: 'email', value: 'support@atozmobiles.in' },
  { key: 'address', value: '#42, 1st Cross, Anna Nagar Commercial Complex, 2nd Avenue, Chennai, Tamil Nadu - 600040' },
  { key: 'upi_id', value: 'atozmobiles@okaxis' },
  { key: 'razorpay_key_id', value: 'rzp_test_atozmobiles_demo' },
  { key: 'razorpay_key_secret', value: 'demo_secret_key_atoz' },
  { key: 'razorpay_mode', value: 'test' },
  { key: 'shipping_fee', value: '0' },
  { key: 'warranty_period', value: '6 Months Comprehensive Store Warranty' },
  { key: 'replacement_days', value: '7 Days Hassle-Free Replacement' }
];

for (const s of permanentSettings) {
  run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
}

console.log('--- Database Ready: Permanent Phone +91 82489 48451 Set ---');
