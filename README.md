# 📊 Real-Time API Monitoring and Latency Analytics Dashboard

A full-stack web application that tracks API request frequency, error rates, and response times in real time — built as an MCA Final Year Project at Chandigarh University.

🔗 **Live Demo**: [https://real-time-api-monitoring-and-latenc.vercel.app](https://real-time-api-monitoring-and-latenc.vercel.app)  
🖥️ **Backend API**: [https://api-monitor-backend-mrkz.onrender.com](https://api-monitor-backend-mrkz.onrender.com)

---

## 📌 Project Overview

This dashboard monitors a set of simulated RESTful APIs and visualizes their performance metrics in real time. It helps identify latency spikes, error trends, and rate-limit breaches — ensuring performance reliability and proactive troubleshooting in cloud-based APIs.

---

## ✨ Features

- 📡 **Real-Time Updates** via WebSocket — no page refresh needed
- 📈 **Response Time Chart** with per-endpoint filter and IST timezone
- 🥧 **Status Code Distribution** donut chart (2xx, 4xx, 5xx)
- 🃏 **Live Stats Cards** — Total Requests, Avg Latency, Error Rate, Success Rate, Requests/min
- 📋 **Request Logs Table** with filters for endpoint, method, and status code
- 🚨 **Alerts Panel** with color-coded severity (warning, critical, server error)
- ⚙️ **Traffic Simulator** with Normal, Degraded, and Spike profiles
- 🔒 **Rate Limiting** on all API endpoints
- 🌐 **IST Timezone** support on all charts

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js v24 | Runtime environment |
| Express.js | Web framework |
| ws | WebSocket real-time communication |
| express-rate-limit | Rate limiting |
| helmet | Security headers |
| morgan | Request logging |
| cors | Cross-origin resource sharing |
| dotenv | Environment variables |
| uuid | Unique ID generation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js | UI framework |
| Recharts | Charts and graphs |
| Axios | HTTP requests |
| WebSocket API | Real-time updates |
| CSS3 | Custom dark theme styling |

### Deployment
| Service | Purpose |
|---------|---------|
| GitHub | Code repository |
| Render.com | Backend hosting |
| Vercel | Frontend hosting |

---

## 📁 Project Structure

```
api-monitor/
│
├── src/
│   ├── index.js                  # Main server entry point
│   ├── models/
│   │   └── MetricsStore.js       # In-memory data store for all metrics
│   ├── middleware/
│   │   └── requestTracker.js     # Tracks every API request automatically
│   ├── services/
│   │   └── trafficSimulator.js   # Simulates fake API traffic
│   └── routes/
│       ├── monitorRoutes.js      # Dashboard data API
│       └── apiRoutes.js          # Sample APIs being monitored
│
├── client/                       # React frontend
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── App.css
│       └── components/
│           ├── StatsCards.js
│           ├── LatencyChart.js
│           ├── StatusCodeChart.js
│           ├── RequestLogsTable.js
│           ├── AlertsPanel.js
│           └── SimulatorControls.js
│
├── .env
└── package.json
```

---

## 🔗 API Endpoints

### Monitored Sample APIs
| Method | Endpoint | Rate Limit |
|--------|----------|------------|
| GET/POST | /api/users | 75/hour |
| GET/PUT/DELETE | /api/users/:id | 75/hour |
| GET/POST | /api/products | 100/hour |
| GET | /api/products/:id | 100/hour |
| GET/POST | /api/orders | 60/hour |
| GET | /api/orders/:id | 60/hour |
| POST | /api/auth/login | 50/hour |
| POST | /api/auth/logout | 50/hour |
| GET | /api/search | 80/hour |
| POST | /api/payments | 50/hour |
| GET/PUT/POST | /api/inventory | 90/hour |
| GET/PUT/DELETE | /api/notifications | 120/hour |

### Monitor APIs (Dashboard Data)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/monitor/stats | Aggregated statistics |
| GET | /api/monitor/logs | Raw request logs |
| GET | /api/monitor/alerts | Triggered alerts |
| GET/PUT | /api/monitor/thresholds | Latency/error thresholds |
| POST | /api/monitor/simulate/start | Start traffic simulation |
| POST | /api/monitor/simulate/stop | Stop traffic simulation |
| POST | /api/monitor/simulate/burst | Fire burst of requests |
| GET | /api/monitor/simulate/status | Simulation status |
| GET | /health | Server health check |

---

## 🚨 Alert Thresholds

| Alert Type | Threshold |
|------------|-----------|
| Latency Warning | 500ms |
| Latency Critical | 1000ms |
| Error Rate Warning | 5% |
| Error Rate Critical | 10% |

---

## 🚀 Local Setup

### Prerequisites
- Node.js installed
- Git installed
- VS Code (recommended)

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/api-monitor.git

# Navigate to project folder
cd api-monitor

# Install dependencies
npm install

# Start the server
node src/index.js
```

Server will run on `http://localhost:5000`

### Frontend Setup
```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start React app
npm start
```

Frontend will run on `http://localhost:3000`

---

## 📊 Dashboard Preview

The dashboard includes:
- **Top row** — 5 live stats cards
- **Middle row** — Response time line chart + Status code donut chart
- **Bottom row** — Request logs table + Alerts panel + Simulator controls

---

## 👨‍🎓 Project Info

- **Program**: MCA (Master of Computer Applications)
- **University**: Chandigarh University (CU Online)
- **Platform**: Qollabb
- **Type**: Final Year Project
