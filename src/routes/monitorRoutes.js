const express = require('express');
const router = express.Router();
const store = require('../models/MetricsStore');
const simulator = require('../services/trafficSimulator');

// GET /api/monitor/stats
router.get('/stats', (req, res) => {
  const { window = 60 } = req.query;
  const stats = store.getStats(parseInt(window));
  res.json({ success: true, data: stats, generatedAt: new Date().toISOString() });
});

// GET /api/monitor/logs
router.get('/logs', (req, res) => {
  const { limit, endpoint, statusCode, method } = req.query;
  const logs = store.getLogs({
    limit: parseInt(limit) || 100,
    endpoint,
    statusCode,
    method
  });
  res.json({ success: true, data: logs, count: logs.length });
});

// GET /api/monitor/alerts
router.get('/alerts', (req, res) => {
  const { limit } = req.query;
  const alerts = store.getAlerts(parseInt(limit) || 50);
  res.json({ success: true, data: alerts, count: alerts.length });
});

// PUT /api/monitor/thresholds
router.put('/thresholds', (req, res) => {
  const { latencyWarning, latencyCritical, errorRateWarning, errorRateCritical } = req.body;
  const updated = store.updateThresholds({
    latencyWarning: parseInt(latencyWarning),
    latencyCritical: parseInt(latencyCritical),
    errorRateWarning: parseFloat(errorRateWarning),
    errorRateCritical: parseFloat(errorRateCritical)
  });
  res.json({ success: true, data: updated });
});

// GET /api/monitor/thresholds
router.get('/thresholds', (req, res) => {
  res.json({ success: true, data: store.thresholds });
});

// DELETE /api/monitor/logs
router.delete('/logs', (req, res) => {
  store.clearLogs();
  res.json({ success: true, message: 'All logs and alerts cleared' });
});

// POST /api/monitor/simulate/start
router.post('/simulate/start', (req, res) => {
  const { profile = 'normal', rps = 2 } = req.body;
  const result = simulator.start(profile, parseInt(rps));
  res.json({ success: true, data: result });
});

// POST /api/monitor/simulate/stop
router.post('/simulate/stop', (req, res) => {
  const result = simulator.stop();
  res.json({ success: true, data: result });
});

// POST /api/monitor/simulate/burst
router.post('/simulate/burst', (req, res) => {
  const { count = 100, profile = 'spike' } = req.body;
  const result = simulator.burst(parseInt(count), profile);
  res.json({ success: true, data: result });
});

// GET /api/monitor/simulate/status
router.get('/simulate/status', (req, res) => {
  res.json({ success: true, data: simulator.getStatus() });
});

module.exports = router;