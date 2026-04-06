import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, HeartPulse, CheckSquare, Clock, Plus, Trash2, Sparkles, X } from 'lucide-react';

const RemindersView = () => {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useNotifications();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newType, setNewType] = useState('custom');
  const [newRepeat, setNewRepeat] = useState('daily');

  const handleSave = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addReminder({
      title: newTitle,
      time: newTime,
      type: newType,
      repeat: newRepeat,
      description: `Time for: ${newTitle}`
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'health': return <HeartPulse size={24} color="#3b82f6" />;
      case 'task': return <CheckSquare size={24} color="var(--warning)" />;
      case 'habit': return <Bell size={24} color="var(--accent-primary)" />;
      default: return <Clock size={24} color="var(--accent-secondary)" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'health': return 'rgba(59, 130, 246, 0.15)';
      case 'task': return 'var(--warning-light)';
      case 'habit': return 'var(--accent-primary-light)';
      default: return 'var(--accent-secondary-light)';
    }
  };

  return (
    <div className="view-section" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '80px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Alerts & Tracking</h2>
          <p style={{ margin: 0 }}>Never miss an important routine.</p>
        </div>
      </div>

      <button className="fab" onClick={() => setIsAdding(true)} title="New Alert">
        <Plus size={28} />
      </button>

      {isAdding && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card shadow-lg flex flex-col gap-4" style={{ 
            width: '100%', maxWidth: '420px', 
            animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid var(--accent-primary)'
          }}>
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Schedule Reminder</h3>
              <button 
                onClick={() => setIsAdding(false)} 
                className="btn-icon-only text-muted hover:text-primary transition" 
                style={{ background: 'transparent', padding: '0.2rem' }}
              >
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Title *</label>
                <input type="text" autoFocus required placeholder="e.g. Take Daily Vitamins" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              
              <div className="flex gap-4 flex-wrap">
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Time</label>
                  <input type="time" required value={newTime} onChange={e => setNewTime(e.target.value)} style={{ padding: '0.75rem' }} />
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Category</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit', outline: 'none' }}>
                    <option value="custom">Custom</option>
                    <option value="task">Task</option>
                    <option value="habit">Habit</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Repeat</label>
                  <select value={newRepeat} onChange={e => setNewRepeat(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit', outline: 'none' }}>
                    <option value="none">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Suggestions Box */}
      <div className="card mb-6 flex items-start gap-4 transition" style={{ background: 'var(--accent-primary-light)', border: '1px solid var(--accent-primary)' }}>
        <div className="btn-icon-only flex-shrink-0" style={{ background: 'var(--surface-color)', padding: '0.7rem' }}>
          <Sparkles size={24} color="var(--accent-primary)" />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>Smart Insights Active</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Automated <strong>Morning</strong> (8:00 AM) and <strong>Night</strong> (8:00 PM) reviews are running. 
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {reminders.length === 0 ? (
          <div className="text-center mt-6" style={{ padding: '4rem 1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No alerts scheduled 😄</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Click the + button below to get started!</p>
          </div>
        ) : (
          reminders.map(reminder => (
            <div key={reminder.id} className="card flex items-center justify-between" style={{ padding: '1.25rem', opacity: reminder.active ? 1 : 0.6, borderLeft: reminder.active ? `4px solid var(--accent-primary)` : 'none' }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: getBgColor(reminder.type) }}>
                  {getIcon(reminder.type)}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{reminder.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="badge" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                       <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> 
                       {reminder.time}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{reminder.repeat}</span>
                    {reminder.snoozedUntil && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>Snoozed</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={reminder.active} onChange={() => toggleReminder(reminder.id)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ 
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: reminder.active ? 'var(--accent-primary)' : 'var(--border-solid)', 
                    transition: '.4s', borderRadius: '34px' 
                  }}>
                    <span style={{ 
                      position: 'absolute', content: '""', height: '18px', width: '18px', 
                      left: reminder.active ? '22px' : '3px', bottom: '3px', 
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
                
                <button onClick={() => deleteReminder(reminder.id)} className="btn-icon-only text-muted hover:text-danger" style={{ background: 'transparent', padding: '0.3rem' }}>
                  <Trash2 size={20} color="var(--danger)" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RemindersView;
