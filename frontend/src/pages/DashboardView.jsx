import React, { useState, useEffect } from 'react';
import { Target, CheckSquare, HeartPulse, Droplets, Book, Dumbbell, Plus, Check, X, Flame, Activity, Zap } from 'lucide-react';
import { fetchTasks, fetchHabits, createHabit, updateHabit, updateTask } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardView = ({ setActiveView }) => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTime, setNewHabitTime] = useState('');
  const [newHabitRepeat, setNewHabitRepeat] = useState('daily');

  useEffect(() => {
    fetchData();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // --- RENDERING LOGIC ---

  const renderMobileView = () => (
    <div className="view-section" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>My Dashboard</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>Track your daily rhythm</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" onClick={() => setActiveView?.('habits')} style={{ padding: '1.8rem', background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 12px 40px rgba(124, 58, 237, 0.4)', borderRadius: '20px' }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Habit Master</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{activeHabitStreak} Day Streak <Flame size={24} style={{ display: 'inline', marginLeft: '4px' }} fill="white" /></h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.2)' }}>
              <Zap size={24} color="white" />
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginBottom: '1.2rem' }}>Total consistency • {habits.filter(h => h.completed).length}/{habits.length}</p>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.2)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${habits.length > 0 ? (habits.filter(h => h.completed).length / habits.length) * 100 : 0}%`, height: '100%', background: 'white', borderRadius: '10px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card" onClick={() => setActiveView?.('tasks')} style={{ padding: '1.25rem', cursor: 'pointer', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tasks</span>
              <CheckSquare size={18} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{tasksDone}/{tasksTotal}</h3>
          </div>
          <div className="card" onClick={() => setActiveView?.('health')} style={{ padding: '1.25rem', cursor: 'pointer', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Health</span>
              <Activity size={18} color="var(--accent-secondary)" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Droplets size={14} color="var(--accent-secondary)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>5/8</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse size={14} color="var(--danger)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>6200</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-baseline mb-4">
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Goal Progress</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{progressPct}% COMPLETE</p>
      </div>
      <div className="card flex justify-between items-center" style={{ padding: '1.8rem', marginBottom: '2.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
         <div style={{ flex: 1, paddingRight: '1rem' }}>
            <h2 style={{ margin: '0 0 0.3rem 0', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Great job!</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>You have finished {tasksDone} tasks so far. Keep pushing!</p>
         </div>
         <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', background: `conic-gradient(var(--accent-primary) ${progressPct}%, var(--border-solid) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)' }}>
            <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'var(--bg-color)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900 }}>{progressPct}%</div>
         </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Daily Habits</h3>
        <button onClick={() => setIsAddingHabit(true)} style={{ background: 'transparent', border: 'none', fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 800 }}>+ ADD NEW</button>
      </div>
      <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '1.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {habits.map(h => (
          <div key={h._id} className="card" style={{ minWidth: '180px', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
             <div className="flex justify-between items-start mb-6">
               <div className="btn-icon-only" style={{ background: 'var(--surface-solid)', width: '46px', height: '46px', borderRadius: '12px' }}>{getDynamicIcon(h.title)}</div>
               <div onClick={() => toggleHabit(h._id, h.completed)} style={{ width: '42px', height: '24px', borderRadius: '20px', background: h.completed ? 'var(--accent-primary)' : 'var(--border-solid)', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                 <div style={{ position: 'absolute', top: '3px', left: h.completed ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
               </div>
             </div>
             <h4 style={{ margin: '0', fontSize: '1.1rem', fontWeight: 800 }}>{h.title}</h4>
             <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{h.streak} Day Streak 🔥</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Priorities</h3>
        <button onClick={() => setActiveView?.('tasks')} style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>VIEW ALL</button>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map(t => (
          <div key={t._id} className="card flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleTask(t._id, t.completed)} 
                style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '8px', 
                  border: t.completed ? 'none' : '2px solid var(--border-solid)', 
                  background: t.completed ? 'var(--accent-primary)' : 'transparent', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify-content: 'center',
                  transition: '0.2s'
                }}
              >
                 {t.completed && <Check size={16} color="white" />}
              </button>
              <span style={{ fontSize: '1rem', fontWeight: 600, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)', transition: '0.2s' }}>{t.title}</span>
            </div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.priority === 'High' ? 'var(--danger)' : 'var(--success)', boxShadow: `0 0 8px ${t.priority === 'High' ? 'var(--danger-light)' : 'var(--success-light)'}` }} />
          </div>
        ))}
      </div>
      
      <button className="fab" onClick={() => setIsAddingHabit(true)} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', bottom: '100px', boxShadow: '0 8px 30px rgba(124, 58, 237, 0.4)' }}>
        <Plus size={32} />
      </button>
    </div>
  );

  const renderDesktopView = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const { user } = useAuth();

    return (
      <div className="view-section" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{today}</p>
          <h2 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Welcome back, {user?.name || 'Friend'}!</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Here is what's happening with your goals today.</p>
        </header>

        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 700 }}>Overview Tracking</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Card 1: Tasks */}
          <div className="card" style={{ padding: '1.75rem', cursor: 'pointer', borderLeft: '4px solid var(--accent-primary)' }} onClick={() => setActiveView?.('tasks')}>
            <div className="flex justify-between items-center mb-4">
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 700 }}>Daily Tasks</h4>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'var(--accent-primary-light)' }}>
                <CheckSquare size={20} color="var(--accent-primary)" />
              </div>
            </div>
            <h3 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>{tasksDone}/{tasksTotal}</h3>
            <div style={{ width: '100%', background: 'var(--border-solid)', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '10px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
            </div>
          </div>

          {/* Card 2: Habit Streak */}
          <div className="card" style={{ padding: '1.75rem', background: 'var(--accent-primary-light)', border: '1px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
            <div className="flex justify-between items-center mb-4">
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', margin: 0, fontWeight: 700 }}>Current Streak</h4>
              <Activity size={20} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0 }}>{activeHabitStreak} Days <Flame size={32} fill="var(--accent-primary)" style={{ verticalAlign: 'middle', marginLeft: '8px' }} /></h3>
            <Zap size={60} color="var(--accent-primary)" style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05 }} />
          </div>

          {/* Card 3: Metrics */}
          <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--accent-secondary)' }}>
            <div className="flex justify-between items-center mb-4">
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 700 }}>Vital Metrics</h4>
              <HeartPulse size={20} color="var(--success)" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>5/8 cups Water</span>
                <Droplets size={22} color="var(--accent-secondary)" />
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>6,200 Steps</span>
                <Activity size={22} color="var(--success)" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2.5rem' }}>
          <div>
            <div className="flex justify-between items-center mb-6">
               <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Ongoing Habits</h3>
               <button className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: 'var(--accent-primary)' }} onClick={() => setIsAddingHabit(true)}>+ New Habit</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {habits.map(h => (
                <div key={h._id} className="card shadow-hover" style={{ padding: '1.5rem', transition: 'transform 0.3s' }}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="btn-icon-only" style={{ background: 'var(--surface-color)', width: '42px', height: '42px', borderRadius: '10px' }}>{getDynamicIcon(h.title)}</div>
                    <input type="checkbox" checked={h.completed} onChange={() => toggleHabit(h._id, h.completed)} style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }} />
                  </div>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 800, fontSize: '1.15rem' }}>{h.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{h.streak} Day Streak 🔥</p>
                </div>
              ))}
            </div>
          </div>

          <div>
             <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 800 }}>Goal Progress</h3>
             <div className="card text-center" style={{ padding: '3rem 2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 2rem', borderRadius: '50%', background: `conic-gradient(var(--accent-primary) ${progressPct}%, var(--border-solid) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(124, 58, 237, 0.1)' }}>
                   <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-card)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900 }}>{progressPct}%</div>
                </div>
                <h4 style={{ margin: '0 0 0.6rem 0', fontWeight: 800, fontSize: '1.4rem' }}>Keep it up!</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontSize: '1rem' }}>You're {progressPct}% done with your daily targets. Finish {tasksTotal - tasksDone} more tasks to hit 100%.</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}
      
      {/* Shared Add Habit Modal */}
      {isAddingHabit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 14, 20, 0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
          <div className="card shadow-lg flex flex-col gap-6" style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', padding: '2rem', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center">
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Create New Habit</h3>
              <button onClick={() => setIsAddingHabit(false)} className="btn-icon-only"><X size={24} color="var(--text-muted)" /></button>
            </div>
            <form onSubmit={handleAddHabit} className="flex flex-col gap-5">
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 600 }}>Habit Title</label>
                <input type="text" autoFocus required placeholder="e.g. Morning Meditation" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <div style={{ flex: 1 }}><input type="time" required value={newHabitTime} onChange={e => setNewHabitTime(e.target.value)} /></div>
                <div style={{ flex: 1 }}><select value={newHabitRepeat} onChange={e => setNewHabitRepeat(e.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '1.1rem', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px' }}>Start Habit</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardView;
