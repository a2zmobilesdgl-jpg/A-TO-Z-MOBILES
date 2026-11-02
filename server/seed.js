const { db, query, run } = require('./db.js');
const { hashPassword } = require('./auth-util.js');

console.log('Seeding A TO Z MOBILES database...');

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

// 2. Products
const products = [
  {
    name: 'Apple iPhone 14 Pro (Deep Purple, 128 GB)',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    original_price: 129900,
    selling_price: 68999,
    discount_percent: 47,
    ram: '6 GB',
    storage: '128 GB',
    color: 'Deep Purple',
    grade: 'Superb (Like New)',
    battery_health: 96,
    display_condition: 'Flawless (Zero scratches, Original Super Retina XDR OLED)',
    camera_condition: '100% Tested (48MP Triple Lens with Photonic Engine pristine)',
    body_condition: 'Mint (Surgical-grade stainless steel frame, zero scuffs)',
    accessories_included: JSON.stringify(['Original 20W Fast Adapter', 'Original Braided Lightning Cable', 'A TO Z Mobiles Certified Box', 'Warranty Card & Bill']),
    warranty: '6 Months Comprehensive Store Warranty + 7 Days Replacement',
    stock: 4,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1695048065053-cfad5206f654?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Refurbished Apple iPhone 14 Pro in pristine Deep Purple. Features the groundbreaking Dynamic Island, Always-On ProMotion 120Hz display, and the blazingly fast A16 Bionic chip. 32-point diagnostics passed with flying colors.',
    specs: JSON.stringify({
      display: '6.1-inch Super Retina XDR OLED, 120Hz ProMotion',
      processor: 'A16 Bionic Chip (6-Core CPU, 5-Core GPU)',
      camera: '48MP Main + 12MP Ultra-Wide + 12MP 3x Telephoto',
      selfie: '12MP TrueDepth Camera with Autofocus',
      battery: '3200 mAh, All-day battery life, 20W fast charging',
      network: '5G Dual SIM (nano-SIM + eSIM)'
    }),
    is_featured: 1,
    is_latest: 1,
    is_special_offer: 1,
    rating: 4.9,
    reviews_count: 38
  },
  {
    name: 'Apple iPhone 13 (Midnight, 128 GB)',
    brand: 'Apple',
    model: 'iPhone 13',
    original_price: 69900,
    selling_price: 39499,
    discount_percent: 44,
    ram: '4 GB',
    storage: '128 GB',
    color: 'Midnight Black',
    grade: 'Superb (Like New)',
    battery_health: 93,
    display_condition: 'Flawless (Ceramic Shield crystal clear, zero dead pixels)',
    camera_condition: '100% Tested (12MP Dual camera with sensor-shift OIS)',
    body_condition: 'Excellent (Aerospace-grade aluminum frame, near pristine)',
    accessories_included: JSON.stringify(['Fast 20W USB-C Adapter', 'Lightning Cable', 'A TO Z Mobiles Eco Box', 'Warranty Certificate']),
    warranty: '6 Months Comprehensive Store Warranty + 7 Days Replacement',
    stock: 6,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Certified pre-owned iPhone 13 in sleek Midnight. Equipped with Cinematic Mode, A15 Bionic performance, and extended battery life. Thoroughly sanitized and bench-tested.',
    specs: JSON.stringify({
      display: '6.1-inch Super Retina XDR OLED',
      processor: 'A15 Bionic chip with 4-core GPU',
      camera: 'Dual 12MP (Wide + Ultra-Wide) with Sensor-shift OIS',
      selfie: '12MP TrueDepth front camera',
      battery: '3240 mAh with 20W fast charging',
      network: '5G Enabled, IP68 Water Resistant'
    }),
    is_featured: 1,
    is_latest: 0,
    is_special_offer: 1,
    rating: 4.8,
    reviews_count: 52
  },
  {
    name: 'Apple iPhone 15 (Blue, 128 GB) - USB-C',
    brand: 'Apple',
    model: 'iPhone 15',
    original_price: 79900,
    selling_price: 54999,
    discount_percent: 31,
    ram: '6 GB',
    storage: '128 GB',
    color: 'Pastel Blue',
    grade: 'Superb (Like New)',
    battery_health: 98,
    display_condition: 'Pristine (Dynamic Island OLED display, zero micro-scratches)',
    camera_condition: '100% Tested (48MP Main Camera + 2x Telephoto optical zoom)',
    body_condition: 'Mint (Color-infused glass back, matte contoured edges)',
    accessories_included: JSON.stringify(['Original Braided Type-C Cable', '20W Fast Charger', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 3,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Barely used iPhone 15 with universal USB-C charging, Dynamic Island, and vivid 48MP camera system. Comes in immaculate pastel blue finish.',
    specs: JSON.stringify({
      display: '6.1-inch Super Retina XDR OLED, 2000 nits peak',
      processor: 'A16 Bionic Chip',
      camera: '48MP Main + 12MP Ultra-Wide with 2x Telephoto',
      selfie: '12MP TrueDepth Camera',
      battery: '3349 mAh, USB-C Port, MagSafe supported',
      network: '5G Global, Roadside Assistance via Satellite'
    }),
    is_featured: 1,
    is_latest: 1,
    is_special_offer: 0,
    rating: 5.0,
    reviews_count: 19
  },
  {
    name: 'Samsung Galaxy S23 Ultra 5G (Phantom Black, 256 GB)',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    original_price: 124999,
    selling_price: 64999,
    discount_percent: 48,
    ram: '12 GB',
    storage: '256 GB',
    color: 'Phantom Black',
    grade: 'Superb (Like New)',
    battery_health: 95,
    display_condition: 'Flawless (Dynamic AMOLED 2X 120Hz, S-Pen slot tested)',
    camera_condition: '100% Inspected (200MP Quad Camera with 100x Space Zoom)',
    body_condition: 'Mint (Armor Aluminum frame with zero dings)',
    accessories_included: JSON.stringify(['Original S-Pen Included', '45W Fast Charger', 'Type-C to C Braided Cable', 'A TO Z Mobiles Certified Packaging', 'Warranty Invoice']),
    warranty: '6 Months Comprehensive Store Warranty + 7 Days Replacement',
    stock: 3,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Refurbished flagship powerhouse Samsung Galaxy S23 Ultra. Features integrated S-Pen, jaw-dropping 200MP Nightography camera, Snapdragon 8 Gen 2 processor, and 5000mAh battery.',
    specs: JSON.stringify({
      display: '6.8-inch QHD+ Dynamic AMOLED 2X, 1-120Hz Adaptive',
      processor: 'Snapdragon 8 Gen 2 for Galaxy (4nm)',
      camera: '200MP Main + 12MP Ultra-Wide + 10MP (3x) + 10MP (10x Periscope)',
      selfie: '12MP Dual Pixel AF',
      battery: '5000 mAh, 45W wired charging, Wireless PowerShare',
      network: '5G Dual SIM, Wi-Fi 6E, S-Pen Stylus integrated'
    }),
    is_featured: 1,
    is_latest: 1,
    is_special_offer: 1,
    rating: 4.9,
    reviews_count: 44
  },
  {
    name: 'Samsung Galaxy S22 5G (Green, 128 GB)',
    brand: 'Samsung',
    model: 'Galaxy S22',
    original_price: 72999,
    selling_price: 27999,
    discount_percent: 62,
    ram: '8 GB',
    storage: '128 GB',
    color: 'Forest Green',
    grade: 'Good (Very Minor signs of wear)',
    battery_health: 90,
    display_condition: 'Minor micro-scratches on glass (invisible when screen is on)',
    camera_condition: '100% Tested (50MP Triple Camera with OIS)',
    body_condition: 'Good (Tiny mark on bottom edge bezel, 100% structurally sound)',
    accessories_included: JSON.stringify(['25W Fast Adapter', 'Type-C Cable', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 5,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Compact flagship smartphone with premium build, vibrant 120Hz AMOLED display, and reliable Snapdragon 8 Gen 1 performance. Great value deal.',
    specs: JSON.stringify({
      display: '6.1-inch Dynamic AMOLED 2X, 120Hz',
      processor: 'Snapdragon 8 Gen 1 (4nm)',
      camera: '50MP + 10MP (3x) + 12MP Ultra-wide',
      selfie: '10MP Front Camera',
      battery: '3700 mAh, 25W Fast Charge',
      network: '5G Dual SIM, IP68'
    }),
    is_featured: 0,
    is_latest: 0,
    is_special_offer: 1,
    rating: 4.7,
    reviews_count: 28
  },
  {
    name: 'OnePlus 11 5G (Titan Black, 256 GB)',
    brand: 'OnePlus',
    model: 'OnePlus 11',
    original_price: 61999,
    selling_price: 36499,
    discount_percent: 41,
    ram: '16 GB',
    storage: '256 GB',
    color: 'Titan Black',
    grade: 'Superb (Like New)',
    battery_health: 94,
    display_condition: 'Flawless (2K 120Hz AMOLED, Dolby Vision)',
    camera_condition: '100% Inspected (50MP Hasselblad Camera System)',
    body_condition: 'Mint (Matte black finish, zero scratches)',
    accessories_included: JSON.stringify(['Original 100W SUPERVOOC Charger', 'Red Cable USB-C', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Comprehensive Store Warranty + 7 Days Replacement',
    stock: 4,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Experience lightning-fast multitasking with 16GB RAM and Snapdragon 8 Gen 2 processor. 100W SUPERVOOC recharges the battery from 1% to 100% in 25 minutes.',
    specs: JSON.stringify({
      display: '6.7-inch QHD+ 120Hz Fluid AMOLED LTPO3',
      processor: 'Qualcomm Snapdragon 8 Gen 2',
      camera: '50MP (Sony IMX890) + 48MP Ultra-Wide + 32MP Teleportrait Hasselblad',
      selfie: '16MP Front Camera',
      battery: '5000 mAh with 100W SuperVOOC charger',
      network: '5G Dual SIM, Alert Slider included'
    }),
    is_featured: 1,
    is_latest: 1,
    is_special_offer: 1,
    rating: 4.8,
    reviews_count: 31
  },
  {
    name: 'OnePlus Nord CE 3 5G (Aqua Surge, 128 GB)',
    brand: 'OnePlus',
    model: 'Nord CE 3',
    original_price: 26999,
    selling_price: 15499,
    discount_percent: 43,
    ram: '8 GB',
    storage: '128 GB',
    color: 'Aqua Surge',
    grade: 'Superb (Like New)',
    battery_health: 97,
    display_condition: 'Flawless (120Hz Fluid AMOLED)',
    camera_condition: '100% Tested (50MP Sony IMX890 Main with OIS)',
    body_condition: 'Pristine (Glossy cyan finish, spotless)',
    accessories_included: JSON.stringify(['80W SUPERVOOC Charger', 'OnePlus Red Cable', 'A TO Z Mobiles Eco Box', 'Warranty Slip']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 7,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'The sweet spot for budget 5G smartphones. Powered by Snapdragon 782G with Sony IMX890 flagship sensor and 80W lightning charge.',
    specs: JSON.stringify({
      display: '6.7-inch FHD+ AMOLED 120Hz HDR10+',
      processor: 'Snapdragon 782G (6nm)',
      camera: '50MP IMX890 OIS + 8MP Ultra-wide + 2MP Macro',
      selfie: '16MP Front Camera',
      battery: '5000 mAh, 80W Fast Charging',
      network: '5G Dual SIM, IR Blaster'
    }),
    is_featured: 0,
    is_latest: 1,
    is_special_offer: 1,
    rating: 4.7,
    reviews_count: 22
  },
  {
    name: 'Redmi Note 13 Pro+ 5G (Fusion Purple, 256 GB)',
    brand: 'Redmi',
    model: 'Note 13 Pro+',
    original_price: 33999,
    selling_price: 19999,
    discount_percent: 41,
    ram: '8 GB',
    storage: '256 GB',
    color: 'Fusion Purple Vegan Leather',
    grade: 'Superb (Like New)',
    battery_health: 98,
    display_condition: 'Flawless (Curved 1.5K AMOLED, 120Hz Gorilla Glass Victus)',
    camera_condition: '100% Tested (200MP OIS Ultra-Clear Camera)',
    body_condition: 'Pristine (Vegan leather back in mint condition)',
    accessories_included: JSON.stringify(['120W HyperCharge Adapter', 'Type-C Cable', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 5,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Refurbished Redmi Note 13 Pro+ with IP68 water resistance, curved 1.5K display, 200MP camera with OIS, and jaw-dropping 120W charging (0-100% in 19 mins).',
    specs: JSON.stringify({
      display: '6.67-inch Curved 1.5K AMOLED, 120Hz, 1800 nits peak',
      processor: 'MediaTek Dimensity 7200 Ultra (4nm)',
      camera: '200MP Samsung ISOCELL HP3 (OIS) + 8MP + 2MP',
      selfie: '16MP front shooter',
      battery: '5000 mAh, 120W HyperCharge',
      network: '5G Dual SIM, IP68 Dust/Water Resistant'
    }),
    is_featured: 1,
    is_latest: 1,
    is_special_offer: 1,
    rating: 4.8,
    reviews_count: 26
  },
  {
    name: 'Redmi Note 12 Pro 5G (Onyx Black, 128 GB)',
    brand: 'Redmi',
    model: 'Note 12 Pro',
    original_price: 27999,
    selling_price: 13999,
    discount_percent: 50,
    ram: '6 GB',
    storage: '128 GB',
    color: 'Onyx Black',
    grade: 'Good (Very Minor signs of use)',
    battery_health: 91,
    display_condition: 'Good (Screen protector applied, crisp 120Hz display)',
    camera_condition: '100% Tested (50MP Sony IMX766 OIS camera)',
    body_condition: 'Clean (Slight pocket marks on plastic frame, 100% fine)',
    accessories_included: JSON.stringify(['67W Turbo Charger', 'USB-C Cable', 'A TO Z Mobiles Eco Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 8,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Amazing value 5G phone under ₹15,000. Features the flagship Sony IMX766 camera sensor with OIS, 67W turbo charging, and smooth 120Hz AMOLED.',
    specs: JSON.stringify({
      display: '6.67-inch FHD+ AMOLED, 120Hz, Dolby Vision',
      processor: 'MediaTek Dimensity 1080 (6nm)',
      camera: '50MP (Sony IMX766 OIS) + 8MP + 2MP',
      selfie: '16MP Selfie Camera',
      battery: '5000 mAh with 67W Turbo Charger',
      network: '5G Dual SIM, 3.5mm Headphone Jack'
    }),
    is_featured: 0,
    is_latest: 0,
    is_special_offer: 1,
    rating: 4.6,
    reviews_count: 41
  },
  {
    name: 'Vivo V29 Pro 5G (Himalayan Blue, 256 GB)',
    brand: 'Vivo',
    model: 'V29 Pro',
    original_price: 42999,
    selling_price: 24999,
    discount_percent: 42,
    ram: '8 GB',
    storage: '256 GB',
    color: 'Himalayan Blue 3D Particle',
    grade: 'Superb (Like New)',
    battery_health: 96,
    display_condition: 'Flawless (3D Curved AMOLED 120Hz, 1.5K Resolution)',
    camera_condition: '100% Tested (50MP Sony IMX766V OIS + Smart Aura Light)',
    body_condition: 'Mint (Glittering magnetic particle glass back)',
    accessories_included: JSON.stringify(['Original 80W FlashCharge Adapter', 'Type-C Cable', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 3,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Portrait camera master with unique Smart Aura Light temperature control, 50MP Eye-AF selfie camera, and 80W FlashCharge. In pristine refurbished condition.',
    specs: JSON.stringify({
      display: '6.78-inch 1.5K 3D Curved AMOLED 120Hz',
      processor: 'MediaTek Dimensity 8200 (4nm)',
      camera: '50MP OIS + 12MP Portrait (2x) + 8MP Ultra-wide with Smart Aura Light',
      selfie: '50MP Eye-AF Front Camera with Dual Soft LED',
      battery: '4600 mAh, 80W FlashCharge',
      network: '5G Dual SIM'
    }),
    is_featured: 1,
    is_latest: 1,
    is_special_offer: 0,
    rating: 4.8,
    reviews_count: 18
  },
  {
    name: 'Oppo Reno 10 Pro+ 5G (Silvery Grey, 256 GB)',
    brand: 'Oppo',
    model: 'Reno 10 Pro+',
    original_price: 59999,
    selling_price: 31999,
    discount_percent: 47,
    ram: '12 GB',
    storage: '256 GB',
    color: 'Silvery Grey',
    grade: 'Superb (Like New)',
    battery_health: 94,
    display_condition: 'Flawless (Curved 1.5K 120Hz AMOLED)',
    camera_condition: '100% Tested (64MP Periscope Telephoto with 3x optical & 120x zoom)',
    body_condition: 'Mint (Matte frosted glass, zero blemishes)',
    accessories_included: JSON.stringify(['Original 100W SUPERVOOC Charger', 'Type-C Cable', 'A TO Z Mobiles Certified Box', 'Warranty Invoice']),
    warranty: '6 Months Comprehensive Store Warranty + 7 Days Replacement',
    stock: 3,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Pro portrait powerhouse with flagship 64MP periscope telephoto lens, Snapdragon 8+ Gen 1 chip, and 100W SUPERVOOC.',
    specs: JSON.stringify({
      display: '6.74-inch 1.5K Curved AMOLED, 120Hz, 1400 nits',
      processor: 'Qualcomm Snapdragon 8+ Gen 1 (4nm)',
      camera: '50MP Sony IMX890 (OIS) + 64MP Periscope Telephoto + 8MP Ultra-Wide',
      selfie: '32MP Front Camera AF',
      battery: '4700 mAh, 100W SUPERVOOC charging',
      network: '5G Dual SIM, ColorOS 14 updated'
    }),
    is_featured: 0,
    is_latest: 1,
    is_special_offer: 1,
    rating: 4.7,
    reviews_count: 15
  },
  {
    name: 'Realme 11 Pro+ 5G (Sunrise Beige, 256 GB)',
    brand: 'Realme',
    model: '11 Pro+',
    original_price: 31999,
    selling_price: 17999,
    discount_percent: 44,
    ram: '12 GB',
    storage: '256 GB',
    color: 'Sunrise Beige (Gucci Designer Edition)',
    grade: 'Superb (Like New)',
    battery_health: 97,
    display_condition: 'Flawless (Curved Vision 120Hz AMOLED)',
    camera_condition: '100% Tested (200MP OIS SuperZoom Camera with 4x lossless zoom)',
    body_condition: 'Mint (Lychee pattern vegan leather with woven 3D seam)',
    accessories_included: JSON.stringify(['100W SuperDart Charger', 'USB-C Cable', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 6,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Co-designed with former Gucci prints designer Matteo Menotto. Featuring 200MP camera, 100W charging, and 12GB RAM for ultra-smooth performance.',
    specs: JSON.stringify({
      display: '6.7-inch Curved AMOLED 120Hz, 2160Hz PWM Dimming',
      processor: 'Dimensity 7050 5G (6nm)',
      camera: '200MP Samsung HP3 OIS + 8MP Ultra-wide + 2MP Macro',
      selfie: '32MP Sony Selfie camera',
      battery: '5000 mAh, 100W Charge',
      network: '5G Dual SIM'
    }),
    is_featured: 1,
    is_latest: 1,
    is_special_offer: 1,
    rating: 4.8,
    reviews_count: 27
  },
  {
    name: 'Apple iPhone 12 (White, 64 GB)',
    brand: 'Apple',
    model: 'iPhone 12',
    original_price: 54900,
    selling_price: 26999,
    discount_percent: 51,
    ram: '4 GB',
    storage: '64 GB',
    color: 'Clean White',
    grade: 'Good (Very Minor signs of wear)',
    battery_health: 89,
    display_condition: 'Minor micro-scratches (screen protector installed, clean view)',
    camera_condition: '100% Tested (Dual 12MP Night Mode on all cameras)',
    body_condition: 'Good (Light scuffs on aluminum edge, overall solid)',
    accessories_included: JSON.stringify(['20W Fast Charger', 'Lightning Cable', 'A TO Z Mobiles Eco Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 5,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Best entry into the 5G iPhone ecosystem. Super Retina XDR OLED, A14 Bionic processor, and MagSafe wireless charging support.',
    specs: JSON.stringify({
      display: '6.1-inch Super Retina XDR OLED, HDR',
      processor: 'Apple A14 Bionic (5nm)',
      camera: '12MP Main + 12MP Ultra-Wide with Night Mode',
      selfie: '12MP TrueDepth front camera',
      battery: '2815 mAh with 20W fast charging',
      network: '5G Enabled, IP68 Water Resistant'
    }),
    is_featured: 0,
    is_latest: 0,
    is_special_offer: 1,
    rating: 4.7,
    reviews_count: 64
  },
  {
    name: 'Apple iPhone 11 (Black, 64 GB)',
    brand: 'Apple',
    model: 'iPhone 11',
    original_price: 43900,
    selling_price: 18499,
    discount_percent: 58,
    ram: '4 GB',
    storage: '64 GB',
    color: 'Classic Black',
    grade: 'Good (Tested Certified)',
    battery_health: 88,
    display_condition: 'Liquid Retina HD display in clean tested condition',
    camera_condition: '100% Tested (Dual 12MP 4K60fps video recording)',
    body_condition: 'Good (Mild cosmetic signs of previous use, fully sanitized)',
    accessories_included: JSON.stringify(['Fast Charger', 'Lightning Cable', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 8,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'Most popular refurbished iPhone in India under ₹20,000! Dual cameras, all-day battery life, Face ID, and A13 Bionic chip.',
    specs: JSON.stringify({
      display: '6.1-inch Liquid Retina IPS LCD',
      processor: 'A13 Bionic chip with Neural Engine',
      camera: '12MP Dual Cameras (Wide + Ultra-Wide) with 4K video',
      selfie: '12MP TrueDepth Camera',
      battery: '3110 mAh',
      network: '4G LTE Dual SIM, IP68'
    }),
    is_featured: 0,
    is_latest: 0,
    is_special_offer: 1,
    rating: 4.6,
    reviews_count: 85
  },
  {
    name: 'Samsung Galaxy Note 20 Ultra 5G (Mystic Bronze, 256 GB)',
    brand: 'Samsung',
    model: 'Galaxy Note 20 Ultra',
    original_price: 104999,
    selling_price: 33999,
    discount_percent: 68,
    ram: '12 GB',
    storage: '256 GB',
    color: 'Mystic Bronze',
    grade: 'Superb (Like New)',
    battery_health: 91,
    display_condition: 'Flawless (6.9-inch Dynamic AMOLED 2X 120Hz)',
    camera_condition: '100% Tested (108MP Pro Grade Camera with Laser AF)',
    body_condition: 'Mint (Signature frosted bronze glass, pristine condition)',
    accessories_included: JSON.stringify(['Original S-Pen Stylus', '25W Fast Adapter', 'Type-C Cable', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 2,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'The legendary Note series flagship with iconic S-Pen, huge 6.9-inch 120Hz display, and 108MP pro camera. Collector favorite.',
    specs: JSON.stringify({
      display: '6.9-inch Dynamic AMOLED 2X, 120Hz, HDR10+',
      processor: 'Exynos 990 / Snapdragon 865+ 5G',
      camera: '108MP + 12MP Periscope (5x optical) + 12MP Ultra-wide',
      selfie: '10MP Front Camera',
      battery: '4500 mAh, 25W Fast Charging',
      network: '5G Dual SIM + MicroSD slot up to 1TB'
    }),
    is_featured: 1,
    is_latest: 0,
    is_special_offer: 1,
    rating: 4.9,
    reviews_count: 34
  },
  {
    name: 'OnePlus 10R 5G (Sierra Black, 128 GB)',
    brand: 'OnePlus',
    model: 'OnePlus 10R',
    original_price: 38999,
    selling_price: 18999,
    discount_percent: 51,
    ram: '8 GB',
    storage: '128 GB',
    color: 'Sierra Black',
    grade: 'Superb (Like New)',
    battery_health: 93,
    display_condition: 'Flawless (120Hz Fluid AMOLED display)',
    camera_condition: '100% Tested (50MP Sony IMX766 with OIS)',
    body_condition: 'Mint (Textured back, completely clean)',
    accessories_included: JSON.stringify(['80W SUPERVOOC Charger', 'Red Cable', 'A TO Z Mobiles Box', 'Warranty Card']),
    warranty: '6 Months Store Warranty + 7 Days Replacement',
    stock: 5,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80'
    ]),
    description: 'High-speed performer with Dimensity 8100-MAX chipset, 80W rapid charging, and 50MP Sony IMX766 camera with OIS.',
    specs: JSON.stringify({
      display: '6.7-inch 120Hz Fluid AMOLED, 10-bit Color',
      processor: 'MediaTek Dimensity 8100-MAX (5nm)',
      camera: '50MP (Sony IMX766 OIS) + 8MP Ultra-wide + 2MP Macro',
      selfie: '16MP Front camera',
      battery: '5000 mAh, 80W SUPERVOOC',
      network: '5G Dual SIM, OxygenOS 14'
    }),
    is_featured: 0,
    is_latest: 0,
    is_special_offer: 1,
    rating: 4.7,
    reviews_count: 24
  }
];

run('DELETE FROM products');
for (const p of products) {
  run(`
    INSERT INTO products (
      name, brand, model, original_price, selling_price, discount_percent,
      ram, storage, color, grade, battery_health, display_condition,
      camera_condition, body_condition, accessories_included, warranty,
      stock, images, description, specs, is_featured, is_latest,
      is_special_offer, rating, reviews_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `, [
    p.name, p.brand, p.model, p.original_price, p.selling_price, p.discount_percent,
    p.ram, p.storage, p.color, p.grade, p.battery_health, p.display_condition,
    p.camera_condition, p.body_condition, p.accessories_included, p.warranty,
    p.stock, p.images, p.description, p.specs, p.is_featured, p.is_latest,
    p.is_special_offer, p.rating, p.reviews_count
  ]);
}

// 3. Initial Users (Admin & Customer)
run('DELETE FROM users');
const adminHash = hashPassword('admin123');
run(`
  INSERT INTO users (name, email, phone, password_hash, role, address, city, state, pincode)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`, ['A TO Z Admin', 'admin@atozmobiles.in', '+919876543210', adminHash, 'admin', 'Shop #42, Commercial Complex', 'Chennai', 'Tamil Nadu', '600040']);

const customerHash = hashPassword('customer123');
run(`
  INSERT INTO users (name, email, phone, password_hash, role, address, city, state, pincode)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`, ['Rahul Sharma', 'customer@atozmobiles.in', '+919840123456', customerHash, 'customer', 'Flat 4B, Green Meadows, T. Nagar', 'Chennai', 'Tamil Nadu', '600017']);

// 4. Coupons
run('DELETE FROM coupons');
const coupons = [
  { code: 'WELCOME500', type: 'flat', value: 500, min_order_amount: 9999 },
  { code: 'ATOZ10', type: 'percentage', value: 10, min_order_amount: 15000 },
  { code: 'FESTIVE1500', type: 'flat', value: 1500, min_order_amount: 25000 },
  { code: 'FREESHIP', type: 'flat', value: 200, min_order_amount: 499 }
];
for (const c of coupons) {
  run('INSERT INTO coupons (code, type, value, min_order_amount, is_active) VALUES (?, ?, ?, ?, 1)', [c.code, c.type, c.value, c.min_order_amount]);
}

// 5. Reviews
run('DELETE FROM reviews');
const seedReviews = [
  { product_id: 1, user_name: 'Venkatesh K.', rating: 5, title: 'Unbelievable Condition - Battery 97%!', comment: 'Received my iPhone 14 Pro Deep Purple in 3 days. Not even a single micro scratch anywhere. Battery health was actually 97% on diagnostics. Highly recommend A TO Z MOBILES!', verified_purchase: 1 },
  { product_id: 1, user_name: 'Ananya S.', rating: 5, title: 'Better than buying brand new', comment: 'Saved almost ₹60,000 compared to new. The packaging was super premium, charger and cable worked flawlessly. 6-month warranty gives great peace of mind.', verified_purchase: 1 },
  { product_id: 4, user_name: 'Manoj Kumar', rating: 5, title: 'S23 Ultra 200MP camera is insane', comment: 'Phone came with original S-Pen and 45W charger. Camera quality is 100% original. 32-point inspection certificate was attached in the box.', verified_purchase: 1 },
  { product_id: 6, user_name: 'Praveen R.', rating: 5, title: 'OnePlus 11 Super fast delivery', comment: '100W SUPERVOOC is real and included in the box! Charged from 10% to 100% in 22 minutes. Very satisfied with customer service.', verified_purchase: 1 },
  { product_id: 8, user_name: 'Dinesh B.', rating: 5, title: 'Best budget deal for Note 13 Pro+', comment: 'Curved display is so smooth. Vegan leather back looks brand new. Great value for money under 20k.', verified_purchase: 1 }
];
for (const r of seedReviews) {
  run('INSERT INTO reviews (product_id, user_name, rating, title, comment, verified_purchase) VALUES (?, ?, ?, ?, ?, ?)', [r.product_id, r.user_name, r.rating, r.title, r.comment, r.verified_purchase]);
}

// 6. Settings
run('DELETE FROM settings');
const settings = [
  { key: 'shop_name', value: 'A TO Z MOBILES' },
  { key: 'tagline', value: 'Certified Pre-Owned & Refurbished Smart Phones' },
  { key: 'phone', value: '+91 98765 43210' },
  { key: 'whatsapp', value: '+919876543210' },
  { key: 'email', value: 'support@atozmobiles.in' },
  { key: 'address', value: '#42, 1st Cross, Anna Nagar Commercial Complex, 2nd Avenue, Chennai, Tamil Nadu - 600040' },
  { key: 'upi_id', value: 'atozmobiles@okaxis' },
  { key: 'razorpay_key_id', value: 'rzp_test_atozmobiles_demo' },
  { key: 'razorpay_key_secret', value: 'demo_secret_key_atoz' },
  { key: 'razorpay_mode', value: 'test' }, // 'test' or 'live'
  { key: 'shipping_fee', value: '0' }, // Free insured shipping
  { key: 'warranty_period', value: '6 Months Comprehensive Store Warranty' },
  { key: 'replacement_days', value: '7 Days Hassle-Free Replacement' }
];
for (const s of settings) {
  run('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
}

// 7. Seed sample orders for demo tracking
run('DELETE FROM orders');
const sampleOrders = [
  {
    order_id: 'AZM-2026-87421',
    user_id: 2,
    customer_name: 'Rahul Sharma',
    customer_email: 'customer@atozmobiles.in',
    customer_phone: '+919840123456',
    shipping_address: 'Flat 4B, Green Meadows, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    total_amount: 38999,
    discount_amount: 500,
    coupon_code: 'WELCOME500',
    payment_method: 'razorpay',
    payment_status: 'paid',
    razorpay_order_id: 'order_test_98317264',
    razorpay_payment_id: 'pay_test_887162534',
    razorpay_signature: 'sig_verified_demo_87421',
    order_status: 'Dispatched',
    tracking_number: 'BLUEDART-IND-7782194',
    courier_partner: 'Blue Dart Express',
    items_json: JSON.stringify([
      {
        product_id: 2,
        name: 'Apple iPhone 13 (Midnight, 128 GB)',
        price: 39499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&auto=format&fit=crop&q=80',
        ram: '4 GB',
        storage: '128 GB',
        grade: 'Superb (Like New)',
        battery_health: 93
      }
    ])
  },
  {
    order_id: 'AZM-2026-90514',
    user_id: 2,
    customer_name: 'Rahul Sharma',
    customer_email: 'customer@atozmobiles.in',
    customer_phone: '+919840123456',
    shipping_address: 'Flat 4B, Green Meadows, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    total_amount: 19999,
    discount_amount: 0,
    coupon_code: '',
    payment_method: 'cod',
    payment_status: 'pending',
    razorpay_order_id: '',
    razorpay_payment_id: '',
    razorpay_signature: '',
    order_status: 'Processing',
    tracking_number: 'DELHIVERY-AWB-998124',
    courier_partner: 'Delhivery Surface',
    items_json: JSON.stringify([
      {
        product_id: 8,
        name: 'Redmi Note 13 Pro+ 5G (Fusion Purple, 256 GB)',
        price: 19999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&auto=format&fit=crop&q=80',
        ram: '8 GB',
        storage: '256 GB',
        grade: 'Superb (Like New)',
        battery_health: 98
      }
    ])
  }
];

for (const o of sampleOrders) {
  run(`
    INSERT INTO orders (
      order_id, user_id, customer_name, customer_email, customer_phone,
      shipping_address, city, state, pincode, total_amount, discount_amount,
      coupon_code, payment_method, payment_status, razorpay_order_id,
      razorpay_payment_id, razorpay_signature, order_status, tracking_number,
      courier_partner, items_json
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?
    )
  `, [
    o.order_id, o.user_id, o.customer_name, o.customer_email, o.customer_phone,
    o.shipping_address, o.city, o.state, o.pincode, o.total_amount, o.discount_amount,
    o.coupon_code, o.payment_method, o.payment_status, o.razorpay_order_id,
    o.razorpay_payment_id, o.razorpay_signature, o.order_status, o.tracking_number,
    o.courier_partner, o.items_json
  ]);
}

console.log('Seeding completed successfully!');
