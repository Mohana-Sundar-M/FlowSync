import React from 'react';
import OpenMap from '../components/OpenMap';

function Dashboard({ data }) {
  if (!data) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Connecting to traffic feed...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="header-section">
        <h2>Bengaluru Metro Traffic</h2>
        <p className="tagline" style={{ marginTop: '0.5rem' }}>Real-time predictions via FlowSync AI models.</p>
      </div>
      
      <div className="dashboard-grid">
        {/* Metric Cards Loop */}
        {Object.entries(data).map(([key, details]) => (
          <div key={key} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Junction {key}</h3>
              <span className={`status-badge ${
                details.predicted === 'LOW' ? 'status-low' : 
                details.predicted === 'MEDIUM' ? 'status-med' : 'status-high'
              }`}>
                {details.predicted}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Vehicles</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{details.vehicle_count}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current</p>
                <p style={{ fontWeight: 500 }}>{details.current}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 2rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '450px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Live Congestion Map</h3>
          <OpenMap data={data} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
