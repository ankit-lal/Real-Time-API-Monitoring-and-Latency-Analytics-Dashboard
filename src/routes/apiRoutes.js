const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// ─── RATE LIMITERS ────────────────────────────────────
const usersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 75,
  message: { success: false, message: 'Too many requests to Users API. Limit: 75/hour' }
});

const productsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests to Products API. Limit: 100/hour' }
});

const ordersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests to Orders API. Limit: 60/hour' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests to Auth API. Limit: 50/hour' }
});

const paymentsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests to Payments API. Limit: 50/hour' }
});

const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 80,
  message: { success: false, message: 'Too many requests to Search API. Limit: 80/hour' }
});

// ─── HELPER FUNCTIONS ─────────────────────────────────

// Realistic random delay with occasional slow responses
function randomDelay(min, max) {
  // 5% chance of very slow response (simulates real-world latency spikes)
  if (Math.random() < 0.05) {
    return new Promise(resolve =>
      setTimeout(resolve, Math.floor(Math.random() * 3000) + 1500)
    );
  }
  // 10% chance of moderately slow response
  if (Math.random() < 0.10) {
    return new Promise(resolve =>
      setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)
    );
  }
  return new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

// Random status code based on realistic probability weights
function randomOutcome() {
  const rand = Math.random() * 100;
  if (rand < 70) return { status: 200, success: true };
  if (rand < 80) return { status: 201, success: true };
  if (rand < 85) return { status: 400, success: false, message: 'Bad request - invalid parameters' };
  if (rand < 89) return { status: 401, success: false, message: 'Unauthorized - invalid token' };
  if (rand < 93) return { status: 404, success: false, message: 'Resource not found' };
  if (rand < 97) return { status: 500, success: false, message: 'Internal server error' };
  return { status: 503, success: false, message: 'Service temporarily unavailable' };
}

// Random payload size generator
function generatePayload(type, count = 3) {
  const payloads = {
    user: () => ({
      id: Math.floor(Math.random() * 1000),
      name: ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Eve Davis'][Math.floor(Math.random() * 5)],
      email: `user${Math.floor(Math.random() * 999)}@example.com`,
      role: ['admin', 'user', 'moderator'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      lastLogin: new Date(Date.now() - Math.random() * 1000000000).toISOString()
    }),
    product: () => ({
      id: Math.floor(Math.random() * 1000),
      name: ['Laptop Pro', 'Wireless Mouse', 'USB-C Hub', 'Mechanical Keyboard', 'Monitor 4K'][Math.floor(Math.random() * 5)],
      price: parseFloat((Math.random() * 999 + 1).toFixed(2)),
      stock: Math.floor(Math.random() * 500),
      category: ['Electronics', 'Accessories', 'Peripherals'][Math.floor(Math.random() * 3)],
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1))
    }),
    order: () => ({
      id: Math.floor(Math.random() * 10000),
      userId: Math.floor(Math.random() * 100),
      total: parseFloat((Math.random() * 999 + 10).toFixed(2)),
      status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
      items: Math.floor(Math.random() * 5) + 1,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    })
  };

  if (count === 1) return payloads[type]();
  return Array.from({ length: count }, () => payloads[type]());
}

// ─── USERS ROUTES ─────────────────────────────────────
router.get('/users', usersLimiter, async (req, res) => {
  await randomDelay(20, 300);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: generatePayload('user', Math.floor(Math.random() * 5) + 1),
    total: Math.floor(Math.random() * 100) + 10,
    page: 1
  });
});

router.post('/users', usersLimiter, async (req, res) => {
  await randomDelay(50, 400);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(201).json({
    success: true,
    data: { ...generatePayload('user', 1), ...req.body }
  });
});

router.get('/users/:id', usersLimiter, async (req, res) => {
  await randomDelay(20, 250);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: { ...generatePayload('user', 1), id: parseInt(req.params.id) }
  });
});

router.put('/users/:id', usersLimiter, async (req, res) => {
  await randomDelay(50, 350);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: { ...generatePayload('user', 1), id: parseInt(req.params.id), updatedAt: new Date().toISOString() }
  });
});

router.delete('/users/:id', usersLimiter, async (req, res) => {
  await randomDelay(30, 250);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({ success: true, message: `User ${req.params.id} deleted successfully` });
});

// ─── PRODUCTS ROUTES ──────────────────────────────────
router.get('/products', productsLimiter, async (req, res) => {
  await randomDelay(20, 280);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: generatePayload('product', Math.floor(Math.random() * 5) + 1),
    total: Math.floor(Math.random() * 200) + 20
  });
});

router.post('/products', productsLimiter, async (req, res) => {
  await randomDelay(60, 400);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(201).json({
    success: true,
    data: { ...generatePayload('product', 1), ...req.body }
  });
});

router.get('/products/:id', productsLimiter, async (req, res) => {
  await randomDelay(20, 200);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: { ...generatePayload('product', 1), id: parseInt(req.params.id) }
  });
});

// ─── ORDERS ROUTES ────────────────────────────────────
router.get('/orders', ordersLimiter, async (req, res) => {
  await randomDelay(30, 350);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: generatePayload('order', Math.floor(Math.random() * 5) + 1),
    total: Math.floor(Math.random() * 500) + 50
  });
});

router.post('/orders', ordersLimiter, async (req, res) => {
  await randomDelay(80, 500);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(201).json({
    success: true,
    data: { ...generatePayload('order', 1), ...req.body, status: 'pending' }
  });
});

router.get('/orders/:id', ordersLimiter, async (req, res) => {
  await randomDelay(20, 250);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: { ...generatePayload('order', 1), id: parseInt(req.params.id) }
  });
});

// ─── AUTH ROUTES ──────────────────────────────────────
router.post('/auth/login', authLimiter, async (req, res) => {
  await randomDelay(100, 600);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: {
      token: `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(email).toString('base64')}.signature`,
      expiresIn: 3600,
      user: generatePayload('user', 1)
    }
  });
});

router.post('/auth/logout', authLimiter, async (req, res) => {
  await randomDelay(20, 150);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─── SEARCH ROUTE ─────────────────────────────────────
router.get('/search', searchLimiter, async (req, res) => {
  await randomDelay(50, 400);
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  const resultCount = Math.floor(Math.random() * 10);
  res.status(200).json({
    success: true,
    data: {
      query: q,
      results: generatePayload('product', resultCount || 1),
      total: resultCount,
      took: Math.floor(Math.random() * 100) + 10
    }
  });
});

// ─── PAYMENTS ROUTE ───────────────────────────────────
router.post('/payments', paymentsLimiter, async (req, res) => {
  await randomDelay(200, 800);
  const outcome = randomOutcome();
  if (!outcome.success) return res.status(outcome.status).json({ success: false, message: outcome.message });
  res.status(200).json({
    success: true,
    data: {
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      status: 'completed',
      amount: req.body.amount || parseFloat((Math.random() * 999 + 1).toFixed(2)),
      currency: 'USD',
      processedAt: new Date().toISOString()
    }
  });
});

module.exports = router;