const express = require('express');
const router = express.Router();

// Simulate realistic API responses with random latency
function randomDelay(min, max) {
  return new Promise(resolve => 
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

function randomStatus(successWeight = 90) {
  return Math.random() * 100 < successWeight ? 200 : 
    [400, 401, 404, 500][Math.floor(Math.random() * 4)];
}

// ─── USERS ───────────────────────────────────────────
router.get('/users', async (req, res) => {
  await randomDelay(20, 300);
  res.status(200).json({
    success: true,
    data: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
      { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user' }
    ]
  });
});

router.post('/users', async (req, res) => {
  await randomDelay(50, 400);
  res.status(201).json({
    success: true,
    data: { id: Math.floor(Math.random() * 1000), ...req.body, createdAt: new Date().toISOString() }
  });
});

router.get('/users/:id', async (req, res) => {
  await randomDelay(20, 200);
  const id = parseInt(req.params.id);
  if (id > 900) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({
    success: true,
    data: { id, name: 'Sample User', email: 'user@example.com', role: 'user' }
  });
});

router.put('/users/:id', async (req, res) => {
  await randomDelay(50, 350);
  res.status(200).json({
    success: true,
    data: { id: req.params.id, ...req.body, updatedAt: new Date().toISOString() }
  });
});

router.delete('/users/:id', async (req, res) => {
  await randomDelay(30, 250);
  res.status(200).json({ success: true, message: `User ${req.params.id} deleted` });
});

// ─── PRODUCTS ─────────────────────────────────────────
router.get('/products', async (req, res) => {
  await randomDelay(20, 280);
  res.status(200).json({
    success: true,
    data: [
      { id: 1, name: 'Laptop Pro', price: 999.99, stock: 50 },
      { id: 2, name: 'Wireless Mouse', price: 29.99, stock: 200 },
      { id: 3, name: 'USB-C Hub', price: 49.99, stock: 150 }
    ]
  });
});

router.post('/products', async (req, res) => {
  await randomDelay(60, 400);
  res.status(201).json({
    success: true,
    data: { id: Math.floor(Math.random() * 1000), ...req.body, createdAt: new Date().toISOString() }
  });
});

router.get('/products/:id', async (req, res) => {
  await randomDelay(20, 200);
  const id = parseInt(req.params.id);
  if (id > 900) return res.status(404).json({ success: false, message: 'Product not found' });
  res.status(200).json({
    success: true,
    data: { id, name: 'Sample Product', price: 99.99, stock: 100 }
  });
});

// ─── ORDERS ───────────────────────────────────────────
router.get('/orders', async (req, res) => {
  await randomDelay(30, 350);
  res.status(200).json({
    success: true,
    data: [
      { id: 1, userId: 1, total: 1029.98, status: 'delivered' },
      { id: 2, userId: 2, total: 29.99, status: 'pending' },
      { id: 3, userId: 3, total: 149.97, status: 'processing' }
    ]
  });
});

router.post('/orders', async (req, res) => {
  await randomDelay(80, 500);
  res.status(201).json({
    success: true,
    data: { id: Math.floor(Math.random() * 1000), ...req.body, status: 'pending', createdAt: new Date().toISOString() }
  });
});

router.get('/orders/:id', async (req, res) => {
  await randomDelay(20, 250);
  const id = parseInt(req.params.id);
  if (id > 900) return res.status(404).json({ success: false, message: 'Order not found' });
  res.status(200).json({
    success: true,
    data: { id, userId: 1, total: 99.99, status: 'processing' }
  });
});

// ─── AUTH ─────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  await randomDelay(100, 600);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  res.status(200).json({
    success: true,
    data: { token: 'eyJhbGciOiJIUzI1NiJ9.sample', expiresIn: 3600 }
  });
});

router.post('/auth/logout', async (req, res) => {
  await randomDelay(20, 100);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─── SEARCH ───────────────────────────────────────────
router.get('/search', async (req, res) => {
  await randomDelay(50, 400);
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });
  res.status(200).json({
    success: true,
    data: { query: q, results: [], total: 0 }
  });
});

// ─── PAYMENTS ─────────────────────────────────────────
router.post('/payments', async (req, res) => {
  await randomDelay(200, 800);
  if (Math.random() < 0.1) {
    return res.status(500).json({ success: false, message: 'Payment gateway error' });
  }
  res.status(200).json({
    success: true,
    data: { transactionId: uuidv4(), status: 'completed', amount: req.body.amount }
  });
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

module.exports = router;