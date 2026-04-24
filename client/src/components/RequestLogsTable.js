import React, { useState } from 'react';

function getStatusColor(code) {
  if (code >= 500) return '#ef4444';
  if (code >= 400) return '#f59e0b';
  if (code >= 200) return '#10b981';
  return '#9ca3af';
}

function getLatencyColor(ms) {
  if (ms >= 1000) return '#ef4444';
  if (ms >= 500) return '#f59e0b';
  return '#10b981';
}

function RequestLogsTable({ logs }) {
  const [filter, setFilter] = useState({ endpoint: '', method: '', status: '' });

  const filtered = logs.filter(log => {
    return (
      (filter.endpoint === '' || log.endpoint.includes(filter.endpoint)) &&
      (filter.method === '' || log.method === filter.method) &&
      (filter.status === '' || String(log.statusCode).startsWith(filter.status))
    );
  });

  return (
    <div className="logs-card">
      <h3>Recent Requests</h3>

      <div className="filters">
        <input
          placeholder="Filter endpoint..."
          value={filter.endpoint}
          onChange={e => setFilter({ ...filter, endpoint: e.target.value })}
          className="filter-input"
        />
        <select
          value={filter.method}
          onChange={e => setFilter({ ...filter, method: e.target.value })}
          className="filter-select"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="2">2xx Success</option>
          <option value="4">4xx Client Error</option>
          <option value="5">5xx Server Error</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Latency</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>
                  <span className={`method-badge method-${log.method}`}>
                    {log.method}
                  </span>
                </td>
                <td className="endpoint-cell">{log.endpoint}</td>
                <td style={{ color: getStatusColor(log.statusCode), fontWeight: 600 }}>
                  {log.statusCode}
                </td>
                <td style={{ color: getLatencyColor(log.responseTime), fontWeight: 600 }}>
                  {log.responseTime}ms
                </td>
                <td className="ip-cell">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="no-data">No requests match your filters</div>
        )}
      </div>
    </div>
  );
}

export default RequestLogsTable;