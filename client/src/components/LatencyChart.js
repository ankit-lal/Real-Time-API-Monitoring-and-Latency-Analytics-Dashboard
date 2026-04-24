import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const BACKEND_URL = 'http://localhost:5000';

function toIST(timestamp) {
  const date = new Date(timestamp.includes('Z') ? timestamp : timestamp + 'Z');
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  });
}


function LatencyChart({ data, selectedEndpoint, onEndpointChange }) {
  const [endpoints, setEndpoints] = useState([]);
  const [endpointData, setEndpointData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available endpoints from stats
  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/monitor/stats`);
        const epStats = res.data.data.endpointStats || [];
        const filtered = epStats
          .map(e => e.endpoint)
          .filter(ep =>
            !ep.includes('/favicon') &&
            !ep.match(/\/\d+$/) &&
            !ep.match(/\/\d+\//) &&
            ep !== 'unknown'
          );
        setEndpoints(filtered);
      } catch (err) {
        console.error('Failed to fetch endpoints:', err);
      }
    };
    fetchEndpoints();
    const interval = setInterval(fetchEndpoints, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch per-endpoint logs when a specific endpoint is selected
  useEffect(() => {
    if (selectedEndpoint === 'all') {
      setEndpointData([]);
      return;
    }
    const fetchEndpointLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/monitor/logs?limit=200&endpoint=${encodeURIComponent(selectedEndpoint)}`
        );
        const logs = res.data.data;

        // Build time buckets from logs
        const buckets = {};
        logs.forEach(log => {
          const time = toIST(log.timestamp);
          if (!buckets[time]) {
            buckets[time] = { time, totalLatency: 0, count: 0, errors: 0 };
          }
          buckets[time].totalLatency += log.responseTime;
          buckets[time].count++;
          if (log.statusCode >= 400) buckets[time].errors++;
        });

        const chartData = Object.values(buckets)
          .map(b => ({
            time: b.time,
            avgLatency: Math.round(b.totalLatency / b.count),
            errorRate: parseFloat(((b.errors / b.count) * 100).toFixed(2))
          }))
          .sort((a, b) => a.time.localeCompare(b.time))
          .slice(-30);

        setEndpointData(chartData);
      } catch (err) {
        console.error('Failed to fetch endpoint logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpointLogs();
    const interval = setInterval(fetchEndpointLogs, 5000);
    return () => clearInterval(interval);
  }, [selectedEndpoint]);

  const displayData = selectedEndpoint === 'all'
    ? data.map(d => ({ ...d, time: toIST(d.time) }))
    : endpointData;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Response Time Over Time</h3>
        <select
          className="filter-select"
          value={selectedEndpoint}
          onChange={e => onEndpointChange(e.target.value)}
        >
          <option value="all">All Endpoints</option>
          {endpoints.map(ep => (
            <option key={ep} value={ep}>{ep}</option>
          ))}
        </select>
      </div>

      {loading && <div className="chart-loading">Loading...</div>}

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            unit="ms"
          />
          <Tooltip
            contentStyle={{ background: '#1e1e2e', border: '1px solid #3a3a5c', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgLatency"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
            name="Avg Latency"
          />
          <Line
            type="monotone"
            dataKey="errorRate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="Error Rate %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LatencyChart;