const store = require('../models/MetricsStore');

const ENDPOINTS = [
  { path: '/api/users', methods: ['GET', 'POST'], weight: 30 },
  { path: '/api/users/:id', methods: ['GET', 'PUT', 'DELETE'], weight: 20 },
  { path: '/api/products', methods: ['GET', 'POST'], weight: 25 },
  { path: '/api/products/:id', methods: ['GET'], weight: 15 },
  { path: '/api/orders', methods: ['GET', 'POST'], weight: 20 },
  { path: '/api/orders/:id', methods: ['GET', 'PATCH'], weight: 10 },
  { path: '/api/auth/login', methods: ['POST'], weight: 15 },
  { path: '/api/auth/logout', methods: ['POST'], weight: 8 },
  { path: '/api/payments', methods: ['POST'], weight: 12 },
  { path: '/api/search', methods: ['GET'], weight: 18 },
  { path: '/api/inventory', methods: ['GET', 'POST'], weight: 20 },
  { path: '/api/inventory/:id', methods: ['GET', 'PUT'], weight: 14 },
  { path: '/api/inventory/restock', methods: ['POST'], weight: 10 },
  { path: '/api/notifications', methods: ['GET'], weight: 22 },
  { path: '/api/notifications/unread', methods: ['GET'], weight: 18 },
  { path: '/api/notifications/:id/read', methods: ['PUT'], weight: 12 },
  { path: '/api/notifications/:id', methods: ['DELETE'], weight: 8 }
];

const STATUS_CODE_PROFILES = {
  normal: [
    { code: 200, weight: 65 }, { code: 201, weight: 15 },
    { code: 400, weight: 5 }, { code: 401, weight: 3 },
    { code: 404, weight: 7 }, { code: 500, weight: 5 }
  ],
  degraded: [
    { code: 200, weight: 40 }, { code: 201, weight: 5 },
    { code: 400, weight: 10 }, { code: 404, weight: 8 },
    { code: 500, weight: 20 }, { code: 503, weight: 17 }
  ],
  spike: [
    { code: 200, weight: 70 }, { code: 201, weight: 10 },
    { code: 429, weight: 15 }, { code: 503, weight: 5 }
  ]
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'PostmanRuntime/7.36.0',
  'axios/1.6.2',
  'curl/7.88.1',
  'python-requests/2.31.0'
];

const IPS = [
  '103.21.244.10', '185.199.108.5', '162.158.92.33',
  '172.68.141.20', '104.17.96.45', '192.168.1.100'
];

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

function generateLatency(statusCode, profile = 'normal') {
  if (profile === 'spike') {
    if (Math.random() < 0.3) return Math.floor(Math.random() * 3000) + 1000;
    return Math.floor(Math.random() * 800) + 100;
  }
  if (profile === 'degraded') {
    if (statusCode >= 500) return Math.floor(Math.random() * 5000) + 2000;
    if (statusCode >= 400) return Math.floor(Math.random() * 1000) + 300;
    return Math.floor(Math.random() * 600) + 80;
  }
  if (statusCode >= 500) return Math.floor(Math.random() * 2000) + 500;
  if (statusCode >= 400) return Math.floor(Math.random() * 400) + 100;
  if (Math.random() < 0.8) return Math.floor(Math.random() * 300) + 20;
  return Math.floor(Math.random() * 800) + 300;
}

function resolveEndpointPath(template) {
  return template.replace(':id', Math.floor(Math.random() * 1000) + 1);
}

class TrafficSimulator {
  constructor() {
    this.running = false;
    this.profile = 'normal';
    this.requestsPerSecond = 2;
    this.interval = null;
    this.wss = null;
    this.totalGenerated = 0;
  }

  setWss(wss) {
    this.wss = wss;
  }

  start(profile = 'normal', rps = 2) {
    if (this.running) this.stop();
    this.profile = profile;
    this.requestsPerSecond = Math.min(rps, 20);
    this.running = true;
    const intervalMs = Math.floor(1000 / this.requestsPerSecond);
    this.interval = setInterval(() => this._generateRequest(), intervalMs);
    return { started: true, profile, rps: this.requestsPerSecond };
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.running = false;
    this.interval = null;
    return { stopped: true, totalGenerated: this.totalGenerated };
  }

  burst(count = 100, profile = 'spike') {
    let i = 0;
    const burstTimer = setInterval(() => {
      this._generateRequest(profile);
      i++;
      if (i >= count) clearInterval(burstTimer);
    }, 50);
    return { burstStarted: true, count, profile };
  }

  _generateRequest(overrideProfile) {
    const profile = overrideProfile || this.profile;
    const endpointDef = weightedRandom(ENDPOINTS);
    const method = endpointDef.methods[Math.floor(Math.random() * endpointDef.methods.length)];
    const statusCodeDef = weightedRandom(STATUS_CODE_PROFILES[profile] || STATUS_CODE_PROFILES.normal);
    const statusCode = statusCodeDef.code;
    const responseTime = generateLatency(statusCode, profile);

    const logEntry = {
      method,
      endpoint: resolveEndpointPath(endpointDef.path),
      statusCode,
      responseTime,
      ip: IPS[Math.floor(Math.random() * IPS.length)],
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      contentLength: Math.floor(Math.random() * 5000),
      simulated: true
    };

    const saved = store.addLog(logEntry);
    this.totalGenerated++;

    if (this.wss) {
      const payload = JSON.stringify({ type: 'NEW_REQUEST', data: saved });
      this.wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(payload);
      });
    }

    return saved;
  }

  getStatus() {
    return {
      running: this.running,
      profile: this.profile,
      requestsPerSecond: this.requestsPerSecond,
      totalGenerated: this.totalGenerated
    };
  }
}

module.exports = new TrafficSimulator();