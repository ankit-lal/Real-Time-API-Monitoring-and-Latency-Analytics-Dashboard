import React from 'react';

function getAlertColor(type) {
  if (type === 'LATENCY_CRITICAL') return '#ef4444';
  if (type === 'LATENCY_WARNING') return '#f59e0b';
  if (type === 'SERVER_ERROR') return '#ef4444';
  return '#9ca3af';
}

function getAlertIcon(type) {
  if (type === 'LATENCY_CRITICAL') return '🔴';
  if (type === 'LATENCY_WARNING') return '🟡';
  if (type === 'SERVER_ERROR') return '💥';
  return '⚪';
}

function AlertsPanel({ alerts }) {
  return (
    <div className="alerts-card">
      <h3>Alerts <span className="alert-count">{alerts.length}</span></h3>
      <div className="alerts-list">
        {alerts.length === 0 && (
          <div className="no-data">No alerts triggered yet</div>
        )}
        {alerts.slice(0, 15).map(alert => (
          <div className="alert-item" key={alert.id}>
            <span className="alert-icon">{getAlertIcon(alert.type)}</span>
            <div className="alert-body">
              <div
                className="alert-message"
                style={{ color: getAlertColor(alert.type) }}
              >
                {alert.message}
              </div>
              <div className="alert-time">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsPanel;