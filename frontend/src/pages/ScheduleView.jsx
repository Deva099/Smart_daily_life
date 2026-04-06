import React, { useState, useEffect } from 'react';
import { CheckCircle2, Calendar, Sparkles, Loader2, Trash2 } from 'lucide-react';

const ScheduleView = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
          // Standardize data from .data if present
          setTasks(data.data !== undefined ? data.data : data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    if (e.key === 'Enter' && newTask.trim()) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title: newTask, priority: 'High', deadline: new Date(Date.now() + 86400000) })
        });
        if (res.ok) {
          setNewTask('');
          fetchTasks(); // Sync view
        }
      } catch (err) { console.error(err); }
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="view-section" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Left Schedule Column */}
      <div style={{ flex: '1 1 600px' }}>
        <div className="header-row" style={{ marginBottom: '1.5rem' }}>
          <h2>Task Timeline</h2>
          <button className="btn-primary" onClick={fetchTasks}><Sparkles size={18} /> Sync Cloud</button>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
               <Loader2 size={36} className="spin" color="var(--accent-primary)" />
               <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             </div>
          ) : tasks.length === 0 ? (
             <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
               No tasks natively loaded from MongoDB. Start typing on the right!
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {tasks.map((task) => (
                <div 
                  key={task._id}
                  style={{
                    display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-md)', position: 'relative',
                    transition: 'var(--transition)', border: '1px solid var(--glass-border)',
                    background: task.status === 'completed' ? 'rgba(255,255,255,0.01)' : 'linear-gradient(90deg, rgba(168,85,247,0.08) 0%, transparent 100%)',
                    borderLeft: task.status === 'completed' ? '3px solid #64748b' : '3px solid var(--accent-primary)',
                    opacity: task.status === 'completed' ? 0.6 : 1
                  }}
                >
                  <div style={{ minWidth: '85px', paddingTop: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>
                       {task.priority || 'Normal'}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', fontSize: '1.1rem' }}>
                        {task.title}
                      </h4>
                      {task.status !== 'completed' && <span className="badge">Active</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div onClick={() => toggleTaskStatus(task)} style={{ cursor: 'pointer' }}>
                      {task.status === 'completed' ? (
                        <CheckCircle2 size={26} color="var(--accent-secondary)" />
                      ) : (
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: '2px solid var(--glass-border)' }} />
                      )}
                    </div>
                    <Trash2 size={20} color="#ef4444" style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => deleteTask(task._id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Right Column */}
      <div style={{ flex: '1 1 300px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Create Task</h3>
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
           <input 
             type="text" 
             placeholder="Type a task and hit Enter..." 
             value={newTask}
             onChange={(e) => setNewTask(e.target.value)}
             onKeyDown={handleAddTask}
             style={{
               width: '100%', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
               background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
               color: 'white', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s', fontSize: '0.95rem'
             }}
             onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
             onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
           />
           <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Data entered here is synced directly with your MongoDB cluster automatically.</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
