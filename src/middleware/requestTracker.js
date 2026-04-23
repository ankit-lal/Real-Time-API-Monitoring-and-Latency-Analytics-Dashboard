const store = require('../models/MetricsStore');

module.exports = function requestTracker(wss) {
  return function (req, res, next) {
    if (req.path.startsWith('/api/monitor') || req.path === '/health') {
      return next();
    }

    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const responseTimeMs = Math.round(Number(endTime - startTime) / 1_000_000);

      const logEntry = {
        method: req.method,
        endpoint: req.path,
        statusCode: res.statusCode,
        responseTime: responseTimeMs,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'unknown',
        contentLength: parseInt(res.get('Content-Length') || '0'),
      };

      const saved = store.addLog(logEntry);

      if (wss) {
        const payload = JSON.stringify({ type: 'NEW_REQUEST', data: saved });
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(payload);
          }
        });
      }
    });

    next();
  };
};