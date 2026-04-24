import React from 'react';

function StatsCards({ stats, selectedEndpoint }) {
  if (!stats) return <div className="stats-grid loading">Loading stats...</div>;

  const cards = [
    {
      label: 'Total Requests',
      value: stats.totalRequests.toLocaleString(),
      icon: '📊',
      color: '#4f46e5'
    },
    {
      label: 'Avg Latency',
      value: `${stats.avgLatency}ms`,
      icon: '⚡',
      color: stats.avgLatency > 500 ? '#ef4444' : stats.avgLatency > 200 ? '#f59e0b' : '#10b981'
    },
   
    {
      label: 'Error Rate',
      value: `${stats.errorRate}%`,
      icon: '🚨',
      color: stats.errorRate > 10 ? '#ef4444' : stats.errorRate > 5 ? '#f59e0b' : '#10b981'
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: '✅',
      color: stats.successRate > 90 ? '#10b981' : stats.successRate > 70 ? '#f59e0b' : '#ef4444'
    },
    {
      label: 'Requests/min',
      value: stats.requestsPerMinute,
      icon: '🔄',
      color: '#4f46e5'
    }
  ];

  return (
    <div>
      {selectedEndpoint !== 'all' && (
        <div className="endpoint-banner">
          Showing stats for: <strong>{selectedEndpoint}</strong>
        </div>
      )}
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsCards;