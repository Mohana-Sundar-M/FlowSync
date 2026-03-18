import React from 'react';

function Management({ data }) {
  if (!data) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Connecting admin feed...</p>
    </div>
  );

  return (
    <div className="animate-fade-in dashboard-grid" style={{ paddingTop: '2rem' }}>
      
      {/* Control Panel View */}
      <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
        <h2 style={{ marginBottom: '1rem' }}>Signal Controller Unit</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Live view of FlowSync backend optimization heuristics.
        </p>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {Object.entries(data).map(([key, details]) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="signal-box">
                <div className={`signal-light ${details.signal === 'RED' ? 'light-red' : ''}`}></div>
                <div className={`signal-light ${details.signal === 'GREEN' ? 'light-green' : ''}`}></div>
              </div>
              <div className="glass-panel" style={{ padding: '0.5rem 1.5rem', textAlign: 'center' }}>
                <h3 style={{ margin: 0 }}>Jnc {key}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Vol: {details.vehicle_count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Data feed */}
      <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Raw Stream Analyzer</h3>
          <button className="btn-secondary" onClick={() => alert('Manual Override trigger would be wired to a POST /override here')}>Manual Override</button>
        </div>
        <pre style={{ 
          background: 'rgba(0,0,0,0.5)', 
          padding: '1rem', 
          borderRadius: '8px',
          color: '#a78bfa',
          overflowX: 'auto',
          margin: 0
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

    </div>
  );
}

export default Management;
