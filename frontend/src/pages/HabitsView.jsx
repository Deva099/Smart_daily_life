import React, { useState, useEffect } from 'react';
import { Flame, Check, Bell, BellOff, X, Plus } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { fetchHabits, createHabit, updateHabit as apiUpdateHabit } from '../services/api';

const HabitsView = () => {
  const { addReminder, reminders, deleteReminder } = useNotifications();
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTime, setNewHabitTime] = useState('');
  const [newHabitRepeat, setNewHabitRepeat] = useState('daily');

  useEffect(() => {
    const loadHabits = async () => {
      const data = await fetchHabits();
      setHabits(data);
      setIsLoading(false);
    };
    loadHabits();
  }, []);

  const toggleHabit = async (id) => {
    const habit = habits.find(h => h._id === id);
    if (!habit) return;

    // Optimistic Update
    setHabits(habits.map(h => {
      if (h._id === id) {
        return { 
          ...h, 
          completed: !h.completed,
          streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    }));

    try {
      await apiUpdateHabit(id, { completed: !habit.completed });
    } catch (e) {
      console.error(e);
      // Fallback reversion
      setHabits(habits.map(h => {
        if (h._id === id) return { ...h, completed: habit.completed, streak: habit.streak };
        return h;
      }));
    }
  };

  const getHabitReminder = (habitTitle) => reminders.find(r => r.title === habitTitle && r.type === 'habit');

  const toggleHabitReminder = (habitTitle) => {
      const existing = getHabitReminder(habitTitle);
      if (existing) {
          deleteReminder(existing.id);
      } else {
          addReminder({
              title: habitTitle,
              type: 'habit',
              time: '09:00',
              repeat: 'daily',
              description: `Don't break your streak! Time for: ${habitTitle}`
          });
      }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    try {
      const savedHabit = await createHabit({
        title: newHabitName.trim(),
        time: newHabitTime || '09:00',
        repeat: newHabitRepeat
      });

      setHabits([savedHabit, ...habits]);

      if (newHabitTime) {
        addReminder({
          title: newHabitName.trim(),
          type: 'habit',
          time: newHabitTime,
          repeat: newHabitRepeat,
          description: `Don't break your streak! Time for: ${newHabitName.trim()}`
        });
      }

      setNewHabitName('');
      setNewHabitTime('');
      setNewHabitRepeat('daily');
      setIsAdding(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const getWeekDays = () => ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="view-section" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', paddingBottom: '80px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Habits</h2>
          <p style={{ margin: 0 }}>Build consistency every day.</p>
        </div>
      </div>

      <button className="fab" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }} onClick={() => setIsAdding(true)} title="New Habit">
        <Plus size={28} />
      </button>

      {isLoading && <p style={{ textAlign: 'center', opacity: 0.7 }}>Loading Habits...</p>}

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
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Create New Habit</h3>
              <button 
                onClick={() => setIsAdding(false)} 
                className="btn-icon-only" 
                style={{ background: 'transparent', padding: '0.2rem' }}
              >
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Habit Name *</label>
                <input type="text" autoFocus required placeholder="e.g. Read 20 pages" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} />
              </div>
              <div className="flex gap-4 flex-wrap">
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Reminder Time</label>
                  <input type="time" value={newHabitTime} onChange={e => setNewHabitTime(e.target.value)} style={{ padding: '0.75rem', width: '100%' }} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Repeat</label>
                  <select value={newHabitRepeat} onChange={e => setNewHabitRepeat(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '100%' }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center mt-6" style={{ padding: '4rem 1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No habits yet 😄</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Click the + button to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {habits.map(habit => {
            const hasReminder = getHabitReminder(habit.title);
            const habitColor = habit.color || 'var(--accent-primary)';
            return (
            <div key={habit._id} className="card" style={{ borderTop: `4px solid ${habitColor}`, background: 'var(--bg-card)' }}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{habit.title}</h3>
                    <button 
                      onClick={() => toggleHabitReminder(habit.title)}
                      className="btn-icon-only flex items-center"
                      style={{ background: 'transparent', padding: '0.2rem', color: hasReminder ? habitColor : 'var(--text-muted)' }}
                      title={hasReminder ? 'Daily Reminder Active' : 'Enable Daily Reminder'}
                    >
                      {hasReminder ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: habit.streak > 2 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {habit.streak > 2 ? <span>🔥</span> : <Flame size={18} fill="transparent" />}
                    <span style={{ fontWeight: 600 }}>{habit.streak} Day Streak</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleHabit(habit._id)}
                  className="btn-icon-only flex items-center justify-center" 
                  style={{ 
                    width: '48px', height: '48px', 
                    borderRadius: 'var(--radius-md)',
                    background: habit.completed ? habitColor : 'var(--surface-color)',
                    border: habit.completed ? 'none' : `2px solid var(--border-color)`,
                    transition: 'var(--transition)',
                    boxShadow: habit.completed ? `0 4px 15px ${habitColor}40` : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {habit.completed ? <Check size={28} color="white" /> : <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--text-muted)' }}/>}
                </button>
              </div>
              
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>This Week</p>
                <div className="flex justify-between items-center">
                  {getWeekDays().map((day, i) => {
                    const isToday = i === 4;
                    const isDone = (isToday && habit.completed);
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <span style={{ fontSize: '0.75rem', color: isToday ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 500 }}>{day}</span>
                        <div style={{ 
                          width: '24px', height: '24px', 
                          borderRadius: 'var(--radius-sm)', 
                          background: isDone ? habitColor : 'var(--bg-color)',
                          opacity: isDone ? (isToday ? 1 : 0.6) : 1,
                          border: isDone ? 'none' : '1px solid var(--border-color)',
                        }}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default HabitsView;
