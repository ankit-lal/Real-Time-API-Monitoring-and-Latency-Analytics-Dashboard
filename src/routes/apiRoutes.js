const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// ─── RATE LIMIT INFO HELPER ───────────────────────────
function rateLimitInfo(limit, windowHours = 1) {
  return {
    rateLimit: {
      limit: limit,
      windowHours: windowHours,
      info: `Max ${limit} requests per ${windowHours} hour(s)`
    }
  };
}

// ─── RATE LIMITERS ────────────────────────────────────
const usersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 75,
  message: {
    success: false,
    message: 'Too many requests to Users API. Limit: 75/hour',
    ...rateLimitInfo(75)
  }
});

const productsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests to Products API. Limit: 100/hour',
    ...rateLimitInfo(100)
  }
});

const ordersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many requests to Orders API. Limit: 60/hour',
    ...rateLimitInfo(60)
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many requests to Auth API. Limit: 50/hour',
    ...rateLimitInfo(50)
  }
});

const paymentsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many requests to Payments API. Limit: 50/hour',
    ...rateLimitInfo(50)
  }
});

const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 80,
  message: {
    success: false,
    message: 'Too many requests to Search API. Limit: 80/hour',
    ...rateLimitInfo(80)
  }
});

// ─── HELPER FUNCTIONS ─────────────────────────────────
function randomDelay(min, max) {
  if (Math.random() < 0.05) {
    return new Promise(resolve =>
      setTimeout(resolve, Math.floor(Math.random() * 3000) + 1500)
    );
  }
  if (Math.random() < 0.10) {
    return new Promise(resolve =>
      setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)
    );
  }
  return new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

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
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(75)
    });
  }
  res.status(200).json({
    success: true,
    data: generatePayload('user', Math.floor(Math.random() * 5) + 1),
    total: Math.floor(Math.random() * 100) + 10,
    page: 1,
    ...rateLimitInfo(75)
  });
});

router.post('/users', usersLimiter, async (req, res) => {
  await randomDelay(50, 400);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(75)
    });
  }
  res.status(201).json({
    success: true,
    data: { ...generatePayload('user', 1), ...req.body },
    ...rateLimitInfo(75)
  });
});

router.get('/users/:id', usersLimiter, async (req, res) => {
  await randomDelay(20, 250);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(75)
    });
  }
  res.status(200).json({
    success: true,
    data: { ...generatePayload('user', 1), id: parseInt(req.params.id) },
    ...rateLimitInfo(75)
  });
});

router.put('/users/:id', usersLimiter, async (req, res) => {
  await randomDelay(50, 350);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(75)
    });
  }
  res.status(200).json({
    success: true,
    data: { ...generatePayload('user', 1), id: parseInt(req.params.id), updatedAt: new Date().toISOString() },
    ...rateLimitInfo(75)
  });
});

router.delete('/users/:id', usersLimiter, async (req, res) => {
  await randomDelay(30, 250);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(75)
    });
  }
  res.status(200).json({
    success: true,
    message: `User ${req.params.id} deleted successfully`,
    ...rateLimitInfo(75)
  });
});

// ─── PRODUCTS ROUTES ──────────────────────────────────
router.get('/products', productsLimiter, async (req, res) => {
  await randomDelay(20, 280);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(100)
    });
  }
  res.status(200).json({
    success: true,
    data: generatePayload('product', Math.floor(Math.random() * 5) + 1),
    total: Math.floor(Math.random() * 200) + 20,
    ...rateLimitInfo(100)
  });
});

router.post('/products', productsLimiter, async (req, res) => {
  await randomDelay(60, 400);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(100)
    });
  }
  res.status(201).json({
    success: true,
    data: { ...generatePayload('product', 1), ...req.body },
    ...rateLimitInfo(100)
  });
});

router.get('/products/:id', productsLimiter, async (req, res) => {
  await randomDelay(20, 200);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(100)
    });
  }
  res.status(200).json({
    success: true,
    data: { ...generatePayload('product', 1), id: parseInt(req.params.id) },
    ...rateLimitInfo(100)
  });
});

// ─── ORDERS ROUTES ────────────────────────────────────
router.get('/orders', ordersLimiter, async (req, res) => {
  await randomDelay(30, 350);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(60)
    });
  }
  res.status(200).json({
    success: true,
    data: generatePayload('order', Math.floor(Math.random() * 5) + 1),
    total: Math.floor(Math.random() * 500) + 50,
    ...rateLimitInfo(60)
  });
});

router.post('/orders', ordersLimiter, async (req, res) => {
  await randomDelay(80, 500);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(60)
    });
  }
  res.status(201).json({
    success: true,
    data: { ...generatePayload('order', 1), ...req.body, status: 'pending' },
    ...rateLimitInfo(60)
  });
});

router.get('/orders/:id', ordersLimiter, async (req, res) => {
  await randomDelay(20, 250);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(60)
    });
  }
  res.status(200).json({
    success: true,
    data: { ...generatePayload('order', 1), id: parseInt(req.params.id) },
    ...rateLimitInfo(60)
  });
});

// ─── AUTH ROUTES ──────────────────────────────────────
router.post('/auth/login', authLimiter, async (req, res) => {
  await randomDelay(100, 600);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      ...rateLimitInfo(50)
    });
  }
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(50)
    });
  }
  res.status(200).json({
    success: true,
    data: {
      token: `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(email).toString('base64')}.signature`,
      expiresIn: 3600,
      user: generatePayload('user', 1)
    },
    ...rateLimitInfo(50)
  });
});

router.post('/auth/logout', authLimiter, async (req, res) => {
  await randomDelay(20, 150);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    ...rateLimitInfo(50)
  });
});

// ─── SEARCH ROUTE ─────────────────────────────────────
router.get('/search', searchLimiter, async (req, res) => {
  await randomDelay(50, 400);
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter q is required',
      ...rateLimitInfo(80)
    });
  }
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(80)
    });
  }
  const resultCount = Math.floor(Math.random() * 10);
  res.status(200).json({
    success: true,
    data: {
      query: q,
      results: generatePayload('product', resultCount || 1),
      total: resultCount,
      took: Math.floor(Math.random() * 100) + 10
    },
    ...rateLimitInfo(80)
  });
});

// ─── PAYMENTS ROUTE ───────────────────────────────────
router.post('/payments', paymentsLimiter, async (req, res) => {
  await randomDelay(200, 800);
  const outcome = randomOutcome();
  if (!outcome.success) {
    return res.status(outcome.status).json({
      success: false,
      message: outcome.message,
      ...rateLimitInfo(50)
    });
  }
  res.status(200).json({
    success: true,
    data: {
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      status: 'completed',
      amount: req.body.amount || parseFloat((Math.random() * 999 + 1).toFixed(2)),
      currency: 'USD',
      processedAt: new Date().toISOString()
    },
    ...rateLimitInfo(50)
  });
});

module.exports = router;