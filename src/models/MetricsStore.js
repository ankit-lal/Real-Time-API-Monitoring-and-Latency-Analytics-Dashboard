const { v4: uuidv4 } = require('uuid');

class MetricsStore {
  constructor() {
    this.logs = [];
    this.alerts = [];
    this.thresholds = {
      latencyWarning: 500,
      latencyCritical: 1000,
      errorRateWarning: 5,
      errorRateCritical: 10
    };
    this.MAX_LOGS = 10000;
  }

  addLog(entry) {
    const log = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.logs.unshift(log);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
    this._checkAlerts(log);
    return log;
  }

  getLogs({ limit = 100, endpoint, statusCode, method } = {}) {
    let results = [...this.logs];
    if (endpoint) results = results.filter(l => l.endpoint.includes(endpoint));
    if (statusCode) results = results.filter(l => l.statusCode === parseInt(statusCode));
    if (method) results = results.filter(l => l.method === method.toUpperCase());
    return results.slice(0, limit);
  }

  getStats(windowMinutes = 60) {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recent = this.logs.filter(l => new Date(l.timestamp) >= cutoff);

    if (recent.length === 0) {
      return {
        totalRequests: 0, avgLatency: 0, p95Latency: 0,
        errorRate: 0, successRate: 100, requestsPerMinute: 0,
        endpointStats: [], statusCodeDistribution: {},
        methodDistribution: {}, timeSeriesData: [],
        thresholds: this.thresholds
      };
    }

    const latencies = recent.map(l => l.responseTime).sort((a, b) => a - b);
    const errors = recent.filter(l => l.statusCode >= 400);
    const p95Index = Math.floor(latencies.length * 0.95);

    const endpointMap = {};
    recent.forEach(l => {
      const ep = l.endpoint || 'unknown';
      if (!endpointMap[ep]) {
        endpointMap[ep] = { count: 0, errors: 0, totalLatency: 0 };
      }
      endpointMap[ep].count++;
      endpointMap[ep].totalLatency += l.responseTime || 0;
      if (l.statusCode >= 400) endpointMap[ep].errors++;
    });

    const endpointStats = Object.entries(endpointMap).map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgLatency: Math.round(data.totalLatency / data.count),
      errorRate: parseFloat(((data.errors / data.count) * 100).toFixed(2))
    })).sort((a, b) => b.count - a.count);

    const statusCodeDistribution = {};
    recent.forEach(l => {
      const bucket = `${Math.floor(l.statusCode / 100)}xx`;
      statusCodeDistribution[bucket] = (statusCodeDistribution[bucket] || 0) + 1;
    });

    const methodDistribution = {};
    recent.forEach(l => {
      const m = l.method || 'UNKNOWN';
      methodDistribution[m] = (methodDistribution[m] || 0) + 1;
    });

    const timeSeriesData = this._buildTimeSeries(recent, windowMinutes);

    return {
      totalRequests: recent.length,
      avgLatency: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
      p95Latency: latencies[p95Index] || 0,
      errorRate: parseFloat(((errors.length / recent.length) * 100).toFixed(2)),
      successRate: parseFloat((((recent.length - errors.length) / recent.length) * 100).toFixed(2)),
      requestsPerMinute: parseFloat((recent.length / windowMinutes).toFixed(2)),
      endpointStats,
      statusCodeDistribution,
      methodDistribution,
      timeSeriesData,
      thresholds: this.thresholds
    };
  }

  _buildTimeSeries(logs, windowMinutes) {
    const buckets = {};
    const bucketCount = Math.min(windowMinutes, 30);
    const bucketSizeMs = (windowMinutes * 60 * 1000) / bucketCount;
    const now = Date.now();

    for (let i = bucketCount - 1; i >= 0; i--) {
      const bucketTime = new Date(now - i * bucketSizeMs);
      const key = bucketTime.toISOString().substring(0, 16);
      buckets[key] = { time: key, requests: 0, errors: 0, avgLatency: 0, totalLatency: 0, errorRate: 0 };
    }

    logs.forEach(l => {
      const bucketIndex = Math.floor((now - new Date(l.timestamp)) / bucketSizeMs);
      if (bucketIndex >= 0 && bucketIndex < bucketCount) {
        const bucketTime = new Date(now - bucketIndex * bucketSizeMs);
        const key = bucketTime.toISOString().substring(0, 16);
        if (buckets[key]) {
          buckets[key].requests++;
          buckets[key].totalLatency += l.responseTime || 0;
          if (l.statusCode >= 400) buckets[key].errors++;
        }
      }
    });

    return Object.values(buckets).map(b => ({
      ...b,
      avgLatency: b.requests > 0 ? Math.round(b.totalLatency / b.requests) : 0,
      errorRate: b.requests > 0 ? parseFloat(((b.errors / b.requests) * 100).toFixed(2)) : 0
    }));
  }

  _checkAlerts(log) {
    if (!log || !log.responseTime) return;

    if (log.responseTime >= this.thresholds.latencyCritical) {
      this.alerts.unshift({
        id: uuidv4(), timestamp: new Date().toISOString(),
        type: 'LATENCY_CRITICAL',
        message: `Critical latency ${log.responseTime}ms on ${log.endpoint}`,
        log
      });
    } else if (log.responseTime >= this.thresholds.latencyWarning) {
      this.alerts.unshift({
        id: uuidv4(), timestamp: new Date().toISOString(),
        type: 'LATENCY_WARNING',
        message: `High latency ${log.responseTime}ms on ${log.endpoint}`,
        log
      });
    }
    if (log.statusCode >= 500) {
      this.alerts.unshift({
        id: uuidv4(), timestamp: new Date().toISOString(),
        type: 'SERVER_ERROR',
        message: `Server error ${log.statusCode} on ${log.endpoint}`,
        log
      });
    }
    if (this.alerts.length > 500) this.alerts = this.alerts.slice(0, 500);
  }

  getAlerts(limit = 50) {
    return this.alerts.slice(0, limit);
  }

  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    return this.thresholds;
  }

  clearLogs() {
    this.logs = [];
    this.alerts = [];
  }
}

module.exports = new MetricsStore();