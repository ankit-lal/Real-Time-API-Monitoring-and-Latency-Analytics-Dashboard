import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import StatsCards from './components/StatsCards';
import LatencyChart from './components/LatencyChart';
import StatusCodeChart from './components/StatusCodeChart';
import RequestLogsTable from './components/RequestLogsTable';
import AlertsPanel from './components/AlertsPanel';
import SimulatorControls from './components/SimulatorControls';
import './App.css';

const BACKEND_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000';

function App() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [simStatus, setSimStatus] = useState({ running: false });
  const wsRef = useRef(null);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes, alertsRes, simRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/monitor/stats`),
        axios.get(`${BACKEND_URL}/api/monitor/logs?limit=50`),
        axios.get(`${BACKEND_URL}/api/monitor/alerts`),
        axios.get(`${BACKEND_URL}/api/monitor/simulate/status`)
      ]);
      setStats(statsRes.data.data);
      setLogs(logsRes.data.data);
      setAlerts(alertsRes.data.data);
      setSimStatus(simRes.data.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'NEW_REQUEST') {
        setLogs(prev => [msg.data, ...prev].slice(0, 50));
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  const handleSimAction = async (action, params = {}) => {
    try {
      await axios.post(`${BACKEND_URL}/api/monitor/simulate/${action}`, params);
      const res = await axios.get(`${BACKEND_URL}/api/monitor/simulate/status`);
      setSimStatus(res.data.data);
      fetchData();
    } catch (err) {
      console.error('Sim action error:', err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>API Monitor Dashboard</h1>
          <span className="subtitle">Real-Time Latency & Analytics</span>
        </div>
        <div className="header-right">
          <span className={`ws-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '● Live' : '○ Offline'}
          </span>
        </div>
      </header>

      <main className="main">
        <StatsCards stats={stats} />
        <div className="charts-row">
          <LatencyChart data={stats?.timeSeriesData || []} />
          <StatusCodeChart data={stats?.statusCodeDistribution || {}} />
        </div>
        <div className="bottom-row">
          <RequestLogsTable logs={logs} />
          <div className="right-column">
            <AlertsPanel alerts={alerts} />
            <SimulatorControls
              status={simStatus}
              onAction={handleSimAction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;