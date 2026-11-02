// A TO Z MOBILES - Client API Service
const API_BASE = '/api';

const api = {
  // Auth Token management
  getToken() {
    return localStorage.getItem('atoz_token');
  },
  setToken(token) {
    if (token) localStorage.setItem('atoz_token', token);
    else localStorage.removeItem('atoz_token');
  },

  // Headers helper
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Store Configuration
  async getConfig() {
    try {
      const res = await fetch(`${API_BASE}/config`);
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return await res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return await res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return await res.json();
  },

  // Coupons
  async applyCoupon(code, orderAmount) {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code, orderAmount })
    });
    return await res.json();
  },

  async getCoupons() {
    const res = await fetch(`${API_BASE}/coupons`);
    return await res.json();
  },

  // Reviews
  async submitReview(data) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // Payment & Orders
  async createOrder(payload) {
    const res = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async verifyPayment(verificationData) {
    const res = await fetch(`${API_BASE}/payment/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(verificationData)
    });
    return await res.json();
  },

  async getOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    return await res.json();
  },

  async trackOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/track/${orderId}`);
    return await res.json();
  },

  // Authentication
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      this.setToken(data.token);
      localStorage.setItem('atoz_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(payload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success && data.token) {
      this.setToken(data.token);
      localStorage.setItem('atoz_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders()
    });
    return await res.json();
  },

  async updateProfile(payload) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  logout() {
    this.setToken(null);
    localStorage.removeItem('atoz_user');
  },

  // Contact
  async submitContact(payload) {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};

window.api = api;
