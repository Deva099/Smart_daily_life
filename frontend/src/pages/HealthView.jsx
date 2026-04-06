import React, { useState, useEffect } from 'react';
import { Droplets, Footprints, Moon, Plus, Minus, Bell, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { fetchHealthData, saveHealthData } from '../services/api';

const HealthView = () => {
  const { addReminder, reminders } = useNotifications();
  
  // Date State Management
  const [dateObj, setDateObj] = useState(new Date());
  const dateStr = dateObj.toISOString().split('T')[0];
  
  // Health Object State
  const [health, setHealth] = useState({
    waterIntake: 0,
    steps: 0,
    sleepHours: 0,
    exerciseMinutes: 0
  });

  const waterGoal = 8;
  const stepsGoal = 10000;
  const sleepGoal = 8;
  const exerciseGoal = 60;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchHealthData(dateStr);
        if (data) {
          setHealth({
            waterIntake: data.waterIntake || 0,
            steps: data.steps || 0,
            sleepHours: data.sleepHours || 0,
            exerciseMinutes: data.exerciseMinutes || 0
          });
        }
      } catch (e) {
        console.error("Failed to load health", e);
      }
    };
    loadData();
  }, [dateStr]);

  const handleUpdate = async (field, value) => {
    // Optimistic UI Update
    setHealth(prev => ({ ...prev, [field]: value }));
    // API Sync
    try {
      await saveHealthData(dateStr, { [field]: value });
    } catch (e) {
      console.error("Failed to update health sync", e);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(dateObj);
    newDate.setDate(newDate.getDate() + days);
    setDateObj(newDate);
  };

  const [waterRemindersActive, setWaterRemindersActive] = useState(
    reminders.some(r => r.title === 'Auto Water Reminder' && r.active)
  );

  const toggleWaterReminders = () => {
    if (!waterRemindersActive) {
      ['10:00', '13:00', '16:00', '19:00'].forEach(time => {
        addReminder({
          title: 'Auto Water Reminder',
          type: 'health',
          time: time,
          repeat: 'daily',
          description: 'Time to drink a glass of water!'
        });
      });
      setWaterRemindersActive(true);
    } else {
       alert("Manage or delete these in the Notification Hub.");
       setWaterRemindersActive(false);
    }
  };

  const getProgressWidth = (current, goal) => {
    return `${Math.min(100, (current / goal) * 100)}%`;
  };

  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const displayDate = isToday ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="view-section" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Health Center</h2>
          <p style={{ margin: 0 }}>Track your daily wellness progress securely.</p>
        </div>
        
        {/* Date Navigator */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-full shadow-sm" style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }}>
          <button className="btn-icon-only" onClick={() => changeDate(-1)}><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 600, minWidth: '100px', textAlign: 'center' }}>{displayDate}</span>
          <button className="btn-icon-only" onClick={() => changeDate(1)} disabled={isToday} style={{ opacity: isToday ? 0.3 : 1 }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Water Tracker */}
        <div className="card text-center relative" style={{ borderTop: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <button 
            onClick={toggleWaterReminders}
            title="Toggle Smart Hourly Reminders"
            className="btn-icon-only flex items-center justify-center p-2 absolute top-4 right-4" 
            style={{ background: waterRemindersActive ? 'var(--accent-primary)' : 'var(--bg-color)', color: waterRemindersActive ? 'white' : 'var(--text-secondary)' }}
          >
            <Bell size={18} />
          </button>
          
          <div className="flex justify-center mb-4 mt-2">
            <div className="btn-icon-only flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-full)', width: '88px', height: '88px' }}>
              <Droplets size={40} color="#3b82f6" />
            </div>
          </div>
          <h3 className="mb-2">Water Intake</h3>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{health.waterIntake} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>/ {waterGoal}</span></h2>
          <p style={{ fontSize: '0.9rem', marginBottom: 'auto', color: 'var(--text-muted)' }}>Glasses {isToday ? 'today' : 'logged'}</p>
          <div className="flex justify-center gap-4 mt-4">
            <button className="btn btn-secondary" onClick={() => handleUpdate('waterIntake', Math.max(0, health.waterIntake - 1))} style={{ padding: '0.75rem' }} disabled={health.waterIntake === 0}><Minus size={20} /></button>
            <button className="btn btn-primary" onClick={() => handleUpdate('waterIntake', Math.min(waterGoal, health.waterIntake + 1))} style={{ padding: '0.75rem', background: '#3b82f6', border: 'none' }}><Plus size={20} /></button>
          </div>
        </div>

        {/* Step Tracker */}
        <div className="card text-center flex flex-col" style={{ borderTop: '4px solid var(--warning)' }}>
          <div className="flex justify-center mb-4 mt-2">
            <div className="btn-icon-only flex items-center justify-center" style={{ background: 'var(--warning-light)', padding: '1.5rem', borderRadius: 'var(--radius-full)', width: '88px', height: '88px' }}>
              <Footprints size={40} color="var(--warning)" />
            </div>
          </div>
          <h3 className="mb-2">Step Counter</h3>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{health.steps.toLocaleString()}</h2>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>of {stepsGoal.toLocaleString()} steps goal</p>
          <div style={{ width: '100%', background: 'var(--bg-color)', height: '16px', borderRadius: '10px', overflow: 'hidden', marginTop: 'auto', marginBottom: '1rem' }}>
            <div style={{ width: getProgressWidth(health.steps, stepsGoal), height: '100%', background: 'var(--warning)', borderRadius: '10px', transition: 'width 1s ease-in-out' }}></div>
          </div>
          <div className="flex justify-center gap-4">
             <button className="btn btn-secondary text-xs" onClick={() => handleUpdate('steps', Math.max(0, health.steps - 500))}>-500</button>
             <button className="btn btn-secondary text-xs" onClick={() => handleUpdate('steps', health.steps + 500)}>+500</button>
             <button className="btn btn-secondary text-xs" onClick={() => handleUpdate('steps', Math.min(stepsGoal, health.steps + 1000))}>+1k</button>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="card text-center flex flex-col" style={{ borderTop: '4px solid var(--accent-primary)' }}>
          <div className="flex justify-center mb-4 mt-2">
            <div className="btn-icon-only flex items-center justify-center" style={{ background: 'var(--accent-primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-full)', width: '88px', height: '88px' }}>
              <Moon size={40} color="var(--accent-primary)" />
            </div>
          </div>
          <h3 className="mb-2">Sleep Tracking</h3>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{health.sleepHours}h</h2>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>of {sleepGoal}h sleep goal</p>
          <div style={{ width: '100%', background: 'var(--bg-color)', height: '16px', borderRadius: '10px', overflow: 'hidden', marginTop: 'auto', marginBottom: '1rem' }}>
            <div style={{ width: getProgressWidth(health.sleepHours, sleepGoal), height: '100%', background: 'var(--accent-primary)', borderRadius: '10px', transition: 'width 1s ease-in-out' }}></div>
          </div>
          <div className="flex justify-center gap-4">
             <button className="btn btn-secondary text-xs" onClick={() => handleUpdate('sleepHours', Math.max(0, health.sleepHours - 0.5))}>-30m</button>
             <button className="btn btn-secondary text-xs" onClick={() => handleUpdate('sleepHours', Math.min(24, health.sleepHours + 0.5))}>+30m</button>
          </div>
        </div>

        {/* Exercise Tracker */}
        <div className="card text-center flex flex-col" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="flex justify-center mb-4 mt-2">
            <div className="btn-icon-only flex items-center justify-center" style={{ background: 'var(--success-light)', padding: '1.5rem', borderRadius: 'var(--radius-full)', width: '88px', height: '88px' }}>
              <Activity size={40} color="var(--success)" />
            </div>
          </div>
          <h3 className="mb-2">Active Exercise</h3>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{health.exerciseMinutes}m</h2>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>of {exerciseGoal}m daily goal</p>
          <div style={{ width: '100%', background: 'var(--bg-color)', height: '16px', borderRadius: '10px', overflow: 'hidden', marginTop: 'auto', marginBottom: '1rem' }}>
            <div style={{ width: getProgressWidth(health.exerciseMinutes, exerciseGoal), height: '100%', background: 'var(--success)', borderRadius: '10px', transition: 'width 1s ease-in-out' }}></div>
          </div>
          <div className="flex justify-center gap-4">
             <button className="btn btn-secondary text-xs" onClick={() => handleUpdate('exerciseMinutes', Math.max(0, health.exerciseMinutes - 15))}>-15m</button>
             <button className="btn btn-secondary text-xs" onClick={() => handleUpdate('exerciseMinutes', health.exerciseMinutes + 15)}>+15m</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthView;
