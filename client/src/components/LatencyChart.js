import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function LatencyChart({ data }) {
  const formatted = data.map(d => ({
    ...d,
    time: d.time.substring(11, 16)
  }));

  return (
    <div className="chart-card">
      <h3>Response Time Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formatted}>
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
