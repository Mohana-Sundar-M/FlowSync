import React from 'react';
import { X, TrendingUp, Clock, AlertTriangle, History } from 'lucide-react';
import IntersectionVisualizer from './IntersectionVisualizer';

function AnalyticsSidebar({ data, selectedNode, onDeselect }) {
  if (!data) return null;

  // Calculate city-wide stats roughly
  const nodes = Object.values(data);
  const totalVehicles = nodes.reduce((acc, n) => acc + n.vehicle_count, 0);
  const highTrafficNodes = nodes.filter(n => ['HIGH', 'VERY HIGH'].includes(n.predicted_level)).length;

  return (
    <div style={{
      width: '400px',
      background: 'rgba(9, 9, 11, 0.95)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backdropFilter: 'blur(20px)',
      flexShrink: 0
    }}>
      {/* City Wide Overview Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Metropolitan Overview
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Active Volume</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'hold' }}>{totalVehicles}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Crit. Intersections</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'hold', color: highTrafficNodes > 0 ? 'var(--status-red)' : 'var(--text-primary)' }}>
              {highTrafficNodes}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {selectedNode ? (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', lineHeight: 1.2 }}>{selectedNode.name}</h2>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                  ID: {selectedNode.id} | {selectedNode.lat.toFixed(4)}, {selectedNode.lon.toFixed(4)}
                </div>
              </div>
              <button onClick={onDeselect} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              {selectedNode.shielded_by && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--status-red)', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-red)', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <AlertTriangle size={16} /> NETWORK SHIELD OVERRIDE
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                    This intersection is forcibly held <strong>RED</strong> because downstream <strong>{selectedNode.shielded_by}</strong> is critically congested.
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>LIVE HEURISTICS</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Trajectory:</span>
                <span style={{ fontWeight: 600 }}>{selectedNode.current_level}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Predicted Volume:</span>
                <span className={`status-badge ${
                  selectedNode.predicted_level === 'LOW' ? 'status-low' : 
                  selectedNode.predicted_level === 'MEDIUM' ? 'status-med' : 'status-high'
                }`}>
                  {selectedNode.predicted_level}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Historic Time Average:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {selectedNode.historical_baseline || "N/A"} veh/min
                </span>
              </div>
              
              <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: selectedNode.vehicle_count > (selectedNode.historical_baseline || 150) ? 'var(--status-red)' : 'var(--accent-blue)',
                  width: `${Math.min(100, (selectedNode.vehicle_count / Math.max(150, selectedNode.historical_baseline || 150)) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {selectedNode.vehicle_count} / {Math.max(150, selectedNode.historical_baseline || 150)} veh/min
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>AI 10-Min Forecast:</span>
                <span style={{ fontWeight: 600, color: selectedNode.forecast_10m > selectedNode.vehicle_count ? 'var(--status-red)' : 'var(--status-green)' }}>
                  {selectedNode.forecast_10m} veh/min
                </span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', border: selectedNode.is_anomaly ? '2px solid var(--status-red)' : '1px solid rgba(59, 130, 246, 0.3)', boxShadow: selectedNode.is_anomaly ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: selectedNode.is_anomaly ? 'var(--status-red)' : 'var(--accent-blue)' }}>
                {selectedNode.is_anomaly ? <AlertTriangle size={16} /> : <Clock size={16} />}
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedNode.is_anomaly ? "CRITICAL INCIDENT ACTIVE" : "AI OPTIMIZATION (ACTIVE)"}</span>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                FlowSync is overriding local actuated controls based on real-time load vs historical baseline calculations:
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-green)' }}>{selectedNode.green_duration}s</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Green/Phase</div>
                </div>
                
                <div style={{ height: '30px', width: '1px', background: 'var(--border-color)' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-red)' }}>{selectedNode.red_duration}s</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Red/Clearance</div>
                </div>
              </div>

              {/* Explicit Virtual Render of the actual Street Signals turning on/off via the Backend Master Clock */}
              <IntersectionVisualizer phase={selectedNode.phase} timer={selectedNode.timer} type={selectedNode.junction_type} />
            </div>

          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
            <AlertTriangle size={32} style={{ marginBottom: '1rem' }} />
            <p style={{ maxWidth: '200px', fontSize: '0.875rem' }}>Select any live junction on the map to view intelligent routing analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsSidebar;
