import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { BellRing, Check, Clock, X } from 'lucide-react';

const NotificationPopup = () => {
  const { activeAlerts, dismissAlert, snoozeAlert } = useNotifications();
  const [snoozeOpenFor, setSnoozeOpenFor] = useState(null);

  if (activeAlerts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none'
    }}>
      {activeAlerts.map(alert => (
        <div 
          key={alert.id}
          className="card"
          style={{
            pointerEvents: 'auto',
            width: '340px',
            padding: '1.25rem',
            animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            borderLeft: '4px solid var(--accent-primary)',
            background: 'var(--surface-color)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
              <BellRing size={20} />
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{alert.title}</h4>
            </div>
            <button 
              onClick={() => dismissAlert(alert.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
          
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {alert.description || `It's time for ${alert.title}`}
          </p>

          <div className="flex gap-2">
            <button 
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
              onClick={() => dismissAlert(alert.id)}
            >
              <Check size={16} /> Complete
            </button>
            
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.6rem', fontSize: '0.85rem' }}
                onClick={() => setSnoozeOpenFor(snoozeOpenFor === alert.id ? null : alert.id)}
              >
                <Clock size={16} /> Snooze
              </button>
              
              {snoozeOpenFor === alert.id && (
                <div 
                  className="card"
                  style={{
                    position: 'absolute',
                    bottom: '110%',
                    right: 0,
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    width: '120px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none' }} onClick={() => { snoozeAlert(alert.id, 5); setSnoozeOpenFor(null); }}>5 mins</button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none' }} onClick={() => { snoozeAlert(alert.id, 10); setSnoozeOpenFor(null); }}>10 mins</button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none' }} onClick={() => { snoozeAlert(alert.id, 30); setSnoozeOpenFor(null); }}>30 mins</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;
