import React, { useState } from 'react';
import { Network, Search, ArrowRight, ShieldAlert } from 'lucide-react';

function SystemMenu({ data, onClose, onNodeSelect, isFullscreen = false }) {
  const [filter, setFilter] = useState('ALL');

  if (!data) return null;

  const nodes = Object.values(data);
  const totalAnomalies = nodes.filter(n => n.is_anomaly).length;

  return (
    <div style={{
      position: 'absolute',
      top: '4rem',
      right: '420px',
      bottom: '1rem',
      width: '400px',
      background: 'rgba(9, 9, 11, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
    }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Network color="var(--accent-blue)" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Global Grid Status</h3>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          ×
        </button>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span>Network Wide Anomalies:</span>
        <span style={{ color: totalAnomalies > 0 ? 'var(--status-red)' : 'var(--text-primary)', fontWeight: 'bold' }}>{totalAnomalies} DETECTED</span>
      </div>

      {/* V8: Grid Filters */}
      <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
        {['ALL', 'GREEN', 'RED', 'ANOMALY'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              borderRadius: '4px',
              border: filter === f ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
              background: filter === f ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {nodes.filter(n => {
          if (filter === 'GREEN') return n.phase.includes('GREEN');
          if (filter === 'RED') return n.phase.includes('RED') || n.phase.includes('YELLOW');
          if (filter === 'ANOMALY') return n.is_anomaly;
          return true;
        }).map(node => (
          <div 
            key={node.id} 
            onClick={() => {
              onNodeSelect(node);
              onClose();
            }}
            style={{ 
              padding: '1rem', 
              borderBottom: '1px solid rgba(255,255,255,0.05)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'background 0.2s ease',
              background: node.is_anomaly ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = node.is_anomaly ? 'rgba(239, 68, 68, 0.05)' : 'transparent'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {node.name}
                {node.shielded_by && <ShieldAlert size={14} color="var(--status-red)" />}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Live: <strong style={{ color: "var(--text-primary)" }}>{node.vehicle_count}v</strong></span>
                <span>Forecast: <strong style={{ color: node.forecast_10m > node.vehicle_count ? 'var(--status-red)' : 'var(--status-green)' }}>{node.forecast_10m}v</strong></span>
              </div>
              {node.shielded_by && (
                <div style={{ fontSize: '0.65rem', color: 'var(--status-red)', marginTop: '0.25rem' }}>
                  Held by {node.shielded_by}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: node.phase.includes('GREEN') ? 'var(--status-green)' : node.phase.includes('YELLOW') ? 'var(--status-yellow)' : 'var(--status-red)'
                }}></span>
                {node.timer}s
              </div>
              <ArrowRight size={14} color="var(--text-secondary)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemMenu;
