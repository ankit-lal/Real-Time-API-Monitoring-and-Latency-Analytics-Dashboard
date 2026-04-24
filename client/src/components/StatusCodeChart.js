import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const COLORS = {
  '2xx': '#10b981',
  '3xx': '#4f46e5',
  '4xx': '#f59e0b',
  '5xx': '#ef4444'
};

function StatusCodeChart({ data }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value
  }));

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Status Code Distribution</h3>
        <div className="no-data">No data yet — start the simulator!</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Status Code Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[entry.name] || '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e1e2e', border: '1px solid #3a3a5c', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatusCodeChart;