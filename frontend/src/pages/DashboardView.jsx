import React, { useState, useEffect } from 'react';
import { Target, CheckSquare, HeartPulse, Droplets, Book, Dumbbell, Plus, Check, X, Flame, Activity, Zap } from 'lucide-react';
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
    <div className="view-section" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* --- OVERVIEW SECTION --- */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Overview</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', marginBottom: '2.5rem' }}>
        
        {/* Large Habit Tracker Card */}
        <div 
          className="card" 
          onClick={() => setActiveView?.('habits')}
          style={{ 
            padding: '1.8rem', 
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', 
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 12px 40px rgba(124, 58, 237, 0.4)'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '0.3rem' }}>Habit Tracker</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{activeHabitStreak}-Day Streak <Flame size={24} style={{ display: 'inline', marginLeft: '4px' }} fill="white" /></h3>
            </div>
            <Zap size={24} color="rgba(255,255,255,0.3)" />
          </div>
          
          <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>Overall Progress • {habits.filter(h => h.completed).length}/{habits.length}</p>
          
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.2)', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${habits.length > 0 ? (habits.filter(h => h.completed).length / habits.length) * 100 : 0}%`, 
              height: '100%', background: 'white', borderRadius: '10px', 
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
            }} />
          </div>
        </div>

        {/* Small Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card" onClick={() => setActiveView?.('tasks')} style={{ padding: '1.2rem', cursor: 'pointer' }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tasks</span>
              <CheckSquare size={18} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{tasksDone}/{tasksTotal}</h3>
          </div>

          <div className="card" onClick={() => setActiveView?.('health')} style={{ padding: '1.2rem', cursor: 'pointer' }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Health Stats</span>
              <Activity size={18} color="var(--accent-secondary)" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Droplets size={14} color="var(--accent-secondary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>5/8</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse size={14} color="var(--success)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>6200</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DAILY PROGRESS SECTION --- */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem' }}>Daily Progress</h3>
      <div className="card flex justify-between items-center" style={{ padding: '1.8rem', marginBottom: '2.5rem', border: '1px solid var(--border-color)' }}>
         <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem', fontWeight: 800 }}>Great job!</h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>You are almost there.</p>
         </div>
         <div style={{ 
            position: 'relative', width: '90px', height: '90px', borderRadius: '50%',
            background: `conic-gradient(var(--accent-primary) ${progressPct}%, var(--border-solid) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.5s ease'
          }}>
            <div style={{
               width: '74px', height: '74px', borderRadius: '50%', background: 'var(--bg-color)', zIndex: 2,
               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800
            }}>
              {progressPct}%
            </div>
         </div>
      </div>

      {/* --- MY HABITS SECTION --- */}
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>My Habits</h3>
        <button 
          onClick={() => setIsAddingHabit(true)}
          style={{ background: 'transparent', border: 'none', fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer' }}
        >
          + Add New
        </button>
      </div>
      
      {habits.length === 0 ? (
        <div className="card text-center mb-6" style={{ padding: '2.5rem 1.5rem', border: '2px dashed var(--border-color)', background: 'transparent' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No habits created yet 😄</p>
        </div>
      ) : (
      <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '1.5rem', scrollbarWidth: 'none', marginLeft: '-1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
        {habits.map((h) => (
          <div key={h._id} className="card" style={{ minWidth: '170px', padding: '1.5rem', flexShrink: 0, position: 'relative' }}>
             <div className="flex justify-between items-start mb-6">
               <div className="btn-icon-only" style={{ background: 'var(--bg-color)', width: '44px', height: '44px', borderRadius: '12px' }}>
                 {getDynamicIcon(h.title)}
               </div>
               
               <div 
                 onClick={() => toggleHabit(h._id, h.completed)}
                 style={{ 
                   width: '40px', height: '22px', borderRadius: '20px', 
                   background: h.completed ? 'var(--accent-primary)' : 'var(--border-solid)',
                   position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                 }}
               >
                 <div style={{ 
                   position: 'absolute', top: '3px', left: h.completed ? '21px' : '3px',
                   width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                   transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                 }} />
               </div>
             </div>
             <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{h.title}</h4>
             <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {h.time} • {h.streak} {h.streak > 0 ? '🔥' : ''}
              </p>
          </div>
        ))}
      </div>
      )}

      {/* --- TODAY'S TASKS SECTION --- */}
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Today's Tasks</h3>
        <button 
          onClick={() => setActiveView?.('tasks')}
          style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3" style={{ paddingBottom: '2rem' }}>
        {tasks.length === 0 && <p className="text-center text-secondary">No tasks yet.</p>}
        {tasks.map((t) => {
          let badgeColor = 'var(--success)';
          if (t.priority === 'Medium') badgeColor = 'var(--warning)';
          if (t.priority === 'High') badgeColor = 'var(--danger)';

          return (
          <div key={t._id} className="card flex items-center justify-between" style={{ padding: '1.1rem 1.5rem', background: 'var(--surface-color)' }}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleTask(t._id, t.completed)}
                style={{ 
                  width: '24px', height: '24px', borderRadius: '8px', 
                  border: t.completed ? 'none' : '2px solid var(--border-solid)', 
                  background: t.completed ? 'var(--accent-primary)' : 'transparent', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                 {t.completed && <Check size={16} color="white" strokeWidth={3} />}
              </button>
              <div className="flex flex-col">
                 <span style={{ 
                    fontSize: '1rem', fontWeight: 600, 
                    textDecoration: t.completed ? 'line-through' : 'none', 
                    color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)', 
                    transition: 'all 0.3s' 
                  }}>{t.title}</span>
                 {t.deadline && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t.deadline}</span>}
              </div>
            </div>
            {!t.completed && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: badgeColor, boxShadow: `0 0 10px ${badgeColor}` }} />
            )}
          </div>
          )
        })}
      </div>

      {/* Floating Add Habit Button (Repositioned for Mobile Overlap) */}
      <button 
        className="fab" 
        onClick={() => setIsAddingHabit(true)}
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: 'var(--shadow-glow)',
          bottom: '100px',
          right: '1.5rem'
        }}
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* Add Habit Modal */}
      {isAddingHabit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 14, 20, 0.8)', zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="card shadow-lg flex flex-col gap-6" style={{ 
            width: '100%', maxWidth: '420px', 
            animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            padding: '2rem'
          }}>
            <div className="flex justify-between items-center">
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Create New Habit</h3>
              <button onClick={() => setIsAddingHabit(false)} className="btn-icon-only">
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleAddHabit} className="flex flex-col gap-5">
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 600 }}>Habit Title</label>
                <input type="text" autoFocus required placeholder="e.g. Morning Meditation" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 600 }}>Time</label>
                  <input type="time" required value={newHabitTime} onChange={e => setNewHabitTime(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 600 }}>Repeat</label>
                  <select value={newHabitRepeat} onChange={e => setNewHabitRepeat(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1.1rem', borderRadius: '14px', fontSize: '1.05rem' }}>Start New Habit</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
