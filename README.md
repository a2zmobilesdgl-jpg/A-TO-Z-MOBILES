# A TO Z MOBILES 📱
### Premium Certified Refurbished & Second-Hand Smart Phone Store

A modern, full-stack, production-ready e-commerce platform specifically engineered for refurbished and pre-owned smartphones. Built with a sleek design system in professional Black, Crisp White, and Royal Blue, full responsive mobile support, 32-point diagnostic condition scoring, Razorpay Indian payment gateway integration, secure customer portal, and an integrated Admin control panel.

---

## 🌟 Key Features

### 1. Website Design & Branding
- **Custom Brand Identity**: Sleek vector SVG logo and favicon for **A TO Z MOBILES** with certified pre-owned shield badge.
- **Color Palette**: Midnight Black (`#0B0F19`, `#0F172A`), Crisp White (`#FFFFFF`), Electric Royal Blue (`#2563EB`, `#38BDF8`), and Verified Emerald Green (`#10B981`).
- **Mobile Responsive**: 100% fluid layout optimized for smartphones, tablets, and desktops with sticky navigation and instant live search.

### 2. Homepage Experience
- **Refurbished Trust Strip**: 32-Point Quality Testing, 6-Month Store Warranty, 7-Day Replacement, and Free Insured Express Delivery.
- **Hero Showcase**: High-impact banner highlighting discounts up to 60% with spotlight flagship deals.
- **Brand Categories**: Fast navigation for **Apple, Samsung, OnePlus, Redmi, Vivo, Oppo, and Realme**.
- **Special Deal Sections**: Featured Refurbished Deals, Latest Arrivals, and budget filters (e.g. Under ₹15,000).
- **Quality Grading Guide**: Transparent Grade A+ (Superb), Grade A (Good), and Grade B (Fair) condition breakdowns.
- **Customer Testimonials**: Real verified buyer reviews with star ratings and city tags.
- **WhatsApp Support Banner**: Instant WhatsApp consultation widget with pre-filled inquiries.

### 3. Mobile Products & Diagnostic Scorecard
Every smartphone listing contains complete refurbished parameters:
- **Multiple High-Res Photos**: Interactive gallery with thumbnail carousel and zoom preview.
- **Pricing & Savings**: Original MRP, Refurbished Selling Price, and calculated Discount Percentage badge.
- **Battery Health Meter**: Visual battery percentage indicator (e.g. 96% tested battery).
- **Condition Checklist**:
  - **Display Condition**: e.g., *Flawless (Zero scratches, original OLED display)*
  - **Camera Condition**: e.g., *100% Tested (All lenses clean and autofocus functional)*
  - **Body Frame Condition**: e.g., *Mint surgical-grade frame, zero scuffs*
- **Accessories Included**: Checkbox list (Original/Fast Adapter, Cable, Box, Warranty Card).
- **Warranty Declaration**: 6 Months Comprehensive Store Warranty + 7 Days Free Replacement.
- **Live Stock Counter**: Real-time inventory tracking with urgency indicators.
- **Action Buttons**: Instant **Buy Now**, **Add to Cart**, **Add to Wishlist**, and **Enquire on WhatsApp**.
- **Customer Reviews**: Star ratings, buyer feedback, and interactive "Write a Review" submission form.

### 4. Indian Payment Gateway & Verification
- **Integrated Options**:
  - **UPI**: Google Pay, PhonePe, Paytm, BHIM UPI
  - **Debit / Credit Cards**: Visa, Mastercard, RuPay
  - **Net Banking**: All major Indian banks
  - **Cash on Delivery (COD)**: Doorstep cash/UPI verification upon delivery
- **Razorpay Integration**:
  - Secure backend order creation via `/api/payment/create-order`
  - Cryptographic HMAC-SHA256 digital signature verification via `/api/payment/verify`
  - Zero storage of customer card credentials (RBI compliant)
  - Built-in interactive test checkout simulator for instant offline/sandbox testing without external API friction!
- **Order Confirmation & Tax Invoice**:
  - Generates unique reference Order ID (e.g., `AZM-2026-87421`)
  - Live fulfillment tracker with 5-stage progress (Placed &rarr; 32-Point Check &rarr; Packed &rarr; Dispatched &rarr; Delivered)
  - Printable/Downloadable GST Tax Invoice Receipt (`33AAICA2026M1Z8`) with itemized details and official warranty certificate.

### 5. Customer Portal
- User Registration & Login with secure PBKDF2 password hashing and JWT session tokens.
- Order History with live tracking status and one-click receipt view.
- Saved Shipping Address management (House, City, State, PIN code).
- Interactive Wishlist with one-click transfer to cart.

### 6. Admin Dashboard (`/admin`)
Separate control center accessible via `/admin`:
- **Real-Time Analytics**: Total Revenue (₹), Total Orders, In-Stock Mobile Count, Total Customers, Low Stock Alerts.
- **Product Management**: Add new refurbished phone, upload images (local upload or image URLs), edit prices/specs, adjust stock, and delete.
- **Order Fulfillment**: Filter orders, update status (Placed, 32-Point Inspected, Dispatched, Delivered), update courier partner and AWB tracking numbers, confirm payments.
- **Customer Manager**: View user directory and lifetime order values.
- **Coupons & Discounts**: Create percentage or flat cash promo codes (e.g., `WELCOME500`, `ATOZ10`) with minimum cart thresholds.
- **Store & Razorpay Settings**: Configure store contact, WhatsApp support number, UPI ID, and switch between Razorpay **Test Mode** and **Live Mode**.

---

## 🛠️ Tech Stack

- **Backend**: Node.js v24 (Native HTTP Server, REST API Router, Native Crypto)
- **Database**: SQLite via Node.js native `node:sqlite` (`DatabaseSync` with Write-Ahead Logging for high concurrency)
- **Frontend**: Clean Modern Responsive UI, CSS3 Design System with Variables, Vanilla JS ES6+ (Zero external frontend framework bloatware, instant sub-50ms page loads!)
- **Payment Gateway**: Razorpay Indian Gateway SDK + Cryptographic HMAC verification
- **Font & Icons**: Google Fonts (Inter) & Font Awesome 6.5

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18, v20, v22, or v24)

### 1. Clone & Enter Directory
```bash
cd "d:\A TO Z MOBILE"
```

### 2. Initialize / Seed Database
Populates 16 realistic refurbished smartphones across Apple, Samsung, OnePlus, Redmi, Vivo, Oppo, coupons, and demo accounts:
```bash
npm run seed
# or: node server/seed.js
```

### 3. Start the Web Server
```bash
npm start
# or: node server/index.js
```

Open your browser:
- **Online Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Store Admin** | `admin@atozmobiles.in` | `admin123` | Full Admin Dashboard (`/admin`) |
| **Customer** | `customer@atozmobiles.in` | `customer123` | Store, Orders, Wishlist, Tracking |

*(Both accounts feature a 1-click **"Fill Demo Credentials"** button on their respective login screens for testing!)*

---

## 💳 Razorpay Configuration Guide

### How to Get Your Razorpay Keys:
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** &rarr; **API Keys**.
3. Click **Generate Test Key** (or Live Key when ready for production).
4. Copy your **Key ID** (`rzp_test_...`) and **Key Secret**.

### How to Set Up Keys in A TO Z MOBILES:
You have two easy options:

#### Option A: Via the Admin Panel (No restart required!)
1. Log in at `http://localhost:3000/admin`.
2. Navigate to **Store & Gateway Settings**.
3. Enter your **Razorpay Key ID** and **Key Secret**.
4. Select **Test Mode** (or **Live Mode**) and click **Save All Settings**.

#### Option B: Via Environment File (`.env`)
Edit your `.env` file in the root folder:
```env
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_secret_key
RAZORPAY_MODE=test
```

> **Testing Mode Note**: The system includes a built-in Razorpay Test Simulator. Even without an active Razorpay account, clicking "Authorize & Complete Payment" in the checkout modal will generate verified transaction tokens, decrement stock, and produce tax invoices!

---

## 🌐 Production Deployment Guide

### Deploy to Render / Railway / Heroku
1. Push the repository to GitHub.
2. In your cloud provider (e.g. [Render.com](https://render.com)):
   - **Environment**: Node
   - **Build Command**: `npm run seed` (seeds database on first launch)
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `PORT`: `3000` (or leave default assigned by host)
   - `JWT_SECRET`: `your_random_secure_secret_string`
   - `RAZORPAY_KEY_ID`: `rzp_live_...`
   - `RAZORPAY_KEY_SECRET`: `...`
   - `RAZORPAY_MODE`: `live`
4. Deploy! Your store is live with HTTPS and full payment capabilities.

### Deploy to Ubuntu VPS (DigitalOcean / AWS / Linode)
```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone repository & seed
git clone <repo_url> atoz-mobiles
cd atoz-mobiles
npm run seed

# 3. Run with PM2 Process Manager
sudo npm install -g pm2
pm2 start server/index.js --name "atoz-mobiles"
pm2 startup
pm2 save
```

---

## 📁 Directory Structure

```
d:\A TO Z MOBILE\
├── public/                     # Static frontend client assets
│   ├── index.html              # Homepage (Hero, Brands, Featured Deals, Reviews)
│   ├── shop.html               # Catalog & Filter Drawer (Brand, Price, RAM, Battery)
│   ├── product.html            # Product Details, Diagnostics Scorecard, Specs & Reviews
│   ├── cart.html               # Shopping Cart, Promo Coupons & Order Summary
│   ├── checkout.html           # Multi-step Checkout with Razorpay & COD
│   ├── order-success.html      # Confirmation, Live Fulfillment Tracking & Tax Invoice
│   ├── account.html            # Customer Dashboard, Order History & Wishlist
│   ├── about.html              # 32-Point Quality Lab & Refurbished Mission
│   ├── contact.html            # Inquiries, WhatsApp Support & Google Maps
│   ├── policy.html             # 6-Month Warranty, 7-Day Replacement & Privacy Policies
│   ├── 404.html                # Custom Not Found Page
│   ├── css/
│   │   └── style.css           # Modern Tailwind-compatible design system
│   ├── js/
│   │   ├── api.js              # Client REST API service
│   │   ├── app.js              # Core State, Cart, Wishlist & Search Dropdown
│   │   └── admin.js            # Admin Dashboard controller
│   └── images/
│       ├── logo.svg            # Primary A TO Z MOBILES SVG Vector Logo
│       ├── logo-dark.svg       # Dark theme brand logo
│       └── favicon.svg         # High-resolution browser favicon
├── server/                     # Backend API & Database
│   ├── index.js                # Main HTTP Server & REST Router
│   ├── db.js                   # SQLite Database with automated schema initialization
│   ├── auth-util.js            # PBKDF2 Password Hashing & JWT Signature helpers
│   ├── seed.js                 # Seed data with 16 realistic refurbished smartphones
│   ├── data/
│   │   └── atoz_mobiles.db     # High-performance persistent SQLite database
│   └── routes/
│       ├── products.js         # Products catalog & filter query engine
│       ├── auth.js             # Customer registration, login & profile
│       ├── payment.js          # Razorpay order generation & HMAC SHA256 verification
│       ├── coupons.js          # Promo voucher calculation
│       ├── reviews.js          # Customer review submission & star ratings
│       └── admin.js            # Protected admin operations, stock & analytics
├── .env                        # Local environment settings
├── .env.example                # Template for environment configuration
├── package.json                # Project manifest & npm scripts
└── README.md                   # Complete documentation & deployment guide
```

---

## 📞 Support & Store Inquiries

- **Store Address**: #42, 1st Cross, Anna Nagar Commercial Complex, 2nd Avenue, Anna Nagar, Chennai, Tamil Nadu - 600040
- **Phone**: +91 98765 43210 / +91 98401 23456
- **WhatsApp**: +91 98765 43210
- **Email**: support@atozmobiles.in
- **Website**: [http://localhost:3000](http://localhost:3000)

&copy; 2026 **A TO Z MOBILES**. Certified Pre-Owned Smart Phones.
