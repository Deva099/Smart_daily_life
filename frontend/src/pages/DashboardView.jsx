import React, { useState, useEffect } from 'react';
import { Target, CheckSquare, HeartPulse, Droplets, Book, Dumbbell, Plus, Check, X } from 'lucide-react';
import { fetchTasks, fetchHabits, createHabit, updateHabit, updateTask } from '../services/api';

const DashboardView = ({ setActiveView }) => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTime, setNewHabitTime] = useState('');
  const [newHabitRepeat, setNewHabitRepeat] = useState('daily');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, habitsData] = await Promise.all([
        fetchTasks(),
        fetchHabits()
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setHabits(Array.isArray(habitsData) ? habitsData : []);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  const tasksDone = tasks.filter(t => t.completed).length;
  const tasksTotal = tasks.length;
  const progressPct = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);
  
  const activeHabitStreak = habits.reduce((max, h) => h.streak > max ? h.streak : max, 0);

  const toggleTask = async (id, currentStatus) => {
    setTasks(tasks.map(t => t._id === id ? { ...t, completed: !currentStatus } : t));
    try {
      await updateTask(id, { completed: !currentStatus });
    } catch (e) {
      console.error(e);
      setTasks(tasks.map(t => t._id === id ? { ...t, completed: currentStatus } : t));
    }
  };

  const toggleHabit = async (id, currentStatus) => {
    try {
      const updated = await updateHabit(id, { completed: !currentStatus });
      setHabits(habits.map(h => h._id === id ? updated : h));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    try {
      const created = await createHabit({
        title: newHabitName.trim(),
        time: newHabitTime || '09:00',
        repeat: newHabitRepeat
      });
      setHabits([created, ...habits]);
      
      setNewHabitName('');
      setNewHabitTime('');
      setIsAddingHabit(false);
    } catch (e) {
      console.error("Failed to create habit", e);
    }
  };

  const getDynamicIcon = (title) => {
     const t = title.toLowerCase();
    if (t.includes('water') || t.includes('drink')) return <Droplets size={20} color="var(--accent-secondary)" />;
     if (t.includes('read') || t.includes('book')) return <Book size={20} color="var(--accent-primary)" />;
     if (t.includes('work') || t.includes('gym') || t.includes('run')) return <Dumbbell size={20} color="var(--accent-primary-hover)" />;
     return <Target size={20} color="var(--accent-primary)" />;
  };

  return (
    <div className="view-section" style={{ paddingBottom: '90px' }}>
      
      {/* Top Cards */}
      <h3 className="mb-3" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Overview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        
        {/* Card 1: Today's Tasks */}
        <div className="card" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => setActiveView('tasks')}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>Tasks</h4>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{tasksDone}/{tasksTotal}</h3>
          <div style={{ width: '100%', background: 'var(--border-solid)', height: '4px', borderRadius: '4px' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #6C63FF, #4FACFE)', borderRadius: '4px', transition: 'width 0.4s' }}></div>
          </div>
        </div>

        {/* Card 2: Habit Tracker */}
        <div className="card shadow-md" style={{ padding: '1rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => setActiveView('habits')}>
          <h4 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>Habit Tracker</h4>
          <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>{activeHabitStreak}-Day Streak 🔥</h3>
        </div>

        {/* Card 3: Health Stats */}
        <div className="card" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => setActiveView('health')}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>Health Stats</h4>
          <div className="flex items-center gap-2 mb-1">
             <Droplets size={14} color="var(--accent-secondary)"/> <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>5/8</span>
          </div>
          <div className="flex items-center gap-2">
             <HeartPulse size={14} color="var(--success)"/> <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>6200</span>
          </div>
        </div>
      </div>

      {/* Daily Progress Section */}
      <h3 className="mb-3" style={{ fontSize: '1.1rem' }}>Daily Progress</h3>
      <div className="card flex justify-between items-center" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
         <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem' }}>Great job!</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>You are almost there.</p>
         </div>
         {/* Conic Gradient CSS Progress Ring */}
         <div style={{ 
            position: 'relative', width: '80px', height: '80px', borderRadius: '50%',
            background: `conic-gradient(#6C63FF ${progressPct}%, var(--border-solid) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.5s ease-in-out'
          }}>
            <div style={{
               width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-color)', zIndex: 2,
               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)'
            }}>
              {progressPct}%
            </div>
         </div>
      </div>

      {/* My Habits Section */}
      <div className="flex justify-between items-center mb-3">
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>My Habits</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsAddingHabit(true)}>+ Add New</span>
      </div>
      
      {habits.length === 0 ? (
        <div className="text-center mt-2 mb-6" style={{ padding: '2rem 1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No habits created yet 😄</p>
        </div>
      ) : (
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem', scrollbarWidth: 'none', marginLeft: '-0.5rem', paddingLeft: '0.5rem', marginRight: '-0.5rem', paddingRight: '0.5rem' }}>
        {habits.map((h) => (
          <div key={h._id} className="card" style={{ minWidth: '150px', padding: '1.25rem', flexShrink: 0 }}>
             <div className="flex justify-between items-start mb-4">
               <div className="btn-icon-only flex items-center justify-center" style={{ background: 'var(--bg-color)', width: '40px', height: '40px', borderRadius: '12px' }}>
                 {getDynamicIcon(h.title)}
               </div>
               
               <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                  <input type="checkbox" checked={h.completed} onChange={() => toggleHabit(h._id, h.completed)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ 
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: h.completed ? '#6C63FF' : 'var(--border-solid)', 
                    transition: '.4s', borderRadius: '34px' 
                  }}>
                    <span style={{ 
                      position: 'absolute', content: '""', height: '14px', width: '14px', 
                      left: h.completed ? '18px' : '3px', bottom: '3px', 
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} />
                  </span>
                </label>
             </div>
             <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{h.title}</h4>
             <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {h.time} • {h.streak} {h.streak > 0 ? '🔥' : ''}
              </p>
          </div>
        ))}
      </div>
      )}

      {/* Today's Tasks Section */}
      <div className="flex justify-between items-center mb-3">
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Today's Tasks</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setActiveView('tasks')}>View All</span>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 && <p className="text-center text-secondary">No tasks yet.</p>}
        {tasks.map((t) => {
          let badgeColor = 'var(--success)';
          if (t.priority === 'Medium') badgeColor = 'var(--warning)';
          if (t.priority === 'High') badgeColor = 'var(--danger)';

          return (
          <div key={t._id} className="card flex items-center justify-between" style={{ padding: '1rem 1.25rem' }}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleTask(t._id, t.completed)}
                style={{ width: '22px', height: '22px', borderRadius: '6px', border: t.completed ? 'none' : '2px solid var(--text-muted)', background: t.completed ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                 {t.completed && <Check size={14} color="white" strokeWidth={3} />}
              </button>
              <div className="flex flex-col">
                 <span style={{ fontSize: '0.95rem', fontWeight: 500, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-secondary)' : 'var(--text-primary)', transition: 'color 0.3s' }}>{t.title}</span>
                 {t.deadline && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {t.deadline}</span>}
              </div>
            </div>
            <span className="badge" style={{ background: 'transparent', border: `1px solid ${badgeColor}`, color: badgeColor, fontWeight: 600 }}>{t.priority}</span>
          </div>
          )
        })}
      </div>

      {/* Floating Add Habit Button */}
      <button className="fab" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', bottom: '100px' }} onClick={() => setIsAddingHabit(true)}>
        <Plus size={28} />
      </button>

      {/* Add Habit Modal */}
      {isAddingHabit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card shadow-lg flex flex-col gap-4" style={{ 
            width: '100%', maxWidth: '420px', 
            animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            border: 'none'
          }}>
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Create New Habit</h3>
              <button 
                onClick={() => setIsAddingHabit(false)} 
                className="btn-icon-only text-muted hover:text-primary transition" 
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
                  <input type="time" required value={newHabitTime} onChange={e => setNewHabitTime(e.target.value)} style={{ padding: '0.75rem', width: '100%' }} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Repeat</label>
                  <select value={newHabitRepeat} onChange={e => setNewHabitRepeat(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit', outline: 'none' }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>Save Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
