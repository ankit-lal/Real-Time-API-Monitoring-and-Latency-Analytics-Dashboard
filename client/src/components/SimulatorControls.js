import React, { useState } from 'react';

function SimulatorControls({ status, onAction }) {
  const [profile, setProfile] = useState('normal');
  const [rps, setRps] = useState(2);

  return (
    <div className="simulator-card">
      <h3>Traffic Simulator</h3>

      <div className="sim-status">
        <span className={`sim-indicator ${status.running ? 'running' : 'stopped'}`}>
          {status.running ? '● Running' : '○ Stopped'}
        </span>
        {status.running && (
          <span className="sim-info">
            {status.profile} · {status.requestsPerSecond} req/s
          </span>
        )}
      </div>

      <div className="sim-controls">
        <div className="control-group">
          <label>Profile</label>
          <select
            value={profile}
            onChange={e => setProfile(e.target.value)}
            className="filter-select"
            disabled={status.running}
          >
            <option value="normal">Normal</option>
            <option value="degraded">Degraded</option>
            <option value="spike">Spike</option>
          </select>
        </div>

        <div className="control-group">
          <label>Req/sec</label>
          <input
            type="number"
            min="1"
            max="20"
            value={rps}
            onChange={e => setRps(parseInt(e.target.value))}
            className="filter-input rps-input"
            disabled={status.running}
          />
        </div>
      </div>

      <div className="sim-buttons">
        {!status.running ? (
          <button
            className="sim-btn start-btn"
            onClick={() => onAction('start', { profile, rps })}
          >
            ▶ Start
          </button>
        ) : (
          <button
            className="sim-btn stop-btn"
            onClick={() => onAction('stop')}
          >
            ■ Stop
          </button>
        )}
        <button
          className="sim-btn burst-btn"
          onClick={() => onAction('burst', { count: 100, profile: 'spike' })}
        >
          ⚡ Burst
        </button>
      </div>

      <div className="sim-total">
        Total Generated: <strong>{status.totalGenerated?.toLocaleString() || 0}</strong>
      </div>
    </div>
  );
}

export default SimulatorControls;
