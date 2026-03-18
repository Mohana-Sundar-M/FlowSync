import React, { useEffect, useRef } from 'react';
import { AlertCircle, Zap, ShieldAlert } from 'lucide-react';

function ActionLogPanel({ actions }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [actions]);

  if (!actions || actions.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '250px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        No active AI interventions.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ 
      height: '300px', 
      display: 'flex', 
      flexDirection: 'column',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid var(--border-color)', 
        background: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Zap size={18} color="var(--accent-blue)" />
        <h3 style={{ fontSize: '0.875rem', margin: 0 }}>AI Operations Log</h3>
      </div>
      
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {actions.map((action, idx) => (
          <div key={action.id} className="animate-fade-in" style={{ 
            background: 'rgba(255,255,255,0.03)', 
            padding: '0.75rem', 
            borderRadius: '8px',
            borderLeft: '3px solid var(--status-red)',
            animationDelay: `${idx * 50}ms`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{action.timestamp}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--status-red)', fontWeight: 'bold' }}>SYSTEM OVERRIDE</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
              {action.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActionLogPanel;
