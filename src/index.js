const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const monitorRoutes = require('./routes/monitorRoutes');
const apiRoutes = require('./routes/apiRoutes');
const requestTracker = require('./middleware/requestTracker');
const simulator = require('./services/trafficSimulator');

const app = express();
const server = http.createServer(app);

// ─── WEBSOCKET SERVER ─────────────────────────────────
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Dashboard connected via WebSocket');
  ws.on('close', () => console.log('Dashboard disconnected'));
});

// Give simulator access to WebSocket
simulator.setWss(wss);

// ─── MIDDLEWARE ───────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use(limiter);

// Request tracking middleware
app.use(requestTracker(wss));

// ─── ROUTES ───────────────────────────────────────────
app.use('/api/monitor', monitorRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── START SERVER ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket ready on ws://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});