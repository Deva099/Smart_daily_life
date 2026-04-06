import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, AlertCircle, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { fetchTasks, createTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask } from '../services/api';

const TasksView = () => {
  const { addReminder } = useNotifications();
  const [tasks, setTasks] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      const data = await fetchTasks();
      setTasks(data);
      setIsLoading(false);
    };
    loadTasks();
  }, []);

  const toggleTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    setTasks(tasks.map(t => t._id === id ? { ...t, completed: !t.completed } : t)); 
    try {
      await apiUpdateTask(id, { completed: !task.completed });
    } catch(e) {
      setTasks(tasks.map(t => t._id === id ? { ...t, completed: task.completed } : t)); 
    }
  };

  const deleteTask = async (id) => {
    setTasks(tasks.filter(t => t._id !== id)); 
    try {
      await apiDeleteTask(id);
    } catch(e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    // Convert 24h time to 12h for UI display
    let displayTime = 'Anytime';
    if (newTaskTime) {
      const [h, m] = newTaskTime.split(':');
      const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
      const h12 = parseInt(h) % 12 || 12;
      displayTime = `${h12}:${m} ${ampm}`;
      
      // Add global reminder using 24h format for string matching in context
      addReminder({
        title: newTaskTitle,
        type: 'task',
        time: newTaskTime,
        repeat: 'none',
        description: `It's time for your priority task: ${newTaskTitle}`
      });
    }

    let deadlineISO = null;
    if (newTaskDate && newTaskTime) {
      deadlineISO = new Date(`${newTaskDate}T${newTaskTime}`).toISOString();
    }

    try {
      const savedTask = await createTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        time: displayTime,
        deadlineISO: deadlineISO
      });
      setTasks([savedTask, ...tasks]);
      setNewTaskTitle('');
      setNewTaskTime('');
      setIsAdding(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'var(--danger)';
    if (priority === 'Medium') return 'var(--warning)';
    return 'var(--success)';
  };

  const getCountdown = (deadlineISO) => {
    if (!deadlineISO) return null;
    const now = new Date();
    const deadline = new Date(deadlineISO);
    const diffMs = deadline - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) return { text: 'Expired', color: 'var(--danger)' };
    if (diffMins <= 10) return { text: `${diffMins}m left`, color: diffMins <= 2 ? 'var(--danger)' : 'var(--warning)' };
    return null;
  };

  return (
    <div className="view-section" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)' }}>Tasks</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage your schedule and daily to-dos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>
      
      {isLoading && <p style={{ textAlign: 'center', opacity: 0.7 }}>Loading Tasks...</p>}

      {isAdding && (
        <div className="card mb-6" style={{ border: '1px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
          <h3 className="mb-4">New Task</h3>
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="What do you need to do?" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
              autoFocus
            />
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} style={{ flex: 1, minWidth: '120px' }}>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <input 
                type="date" 
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                style={{ flex: 1, minWidth: '150px', padding: '0.75rem' }}
                required
              />
              <input 
                type="time" 
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '0.75rem' }}
                required
              />
              <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Task</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Selecting a time will automatically schedule a smart reminder.</p>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-12 opacity-60">
             <p>No tasks found. Click "Add Task" to get started.</p>
          </div>
        )}
        
        {/* Simple list rendering for now to avoid date grouping errors if server data differs */}
        <div className="flex flex-col gap-3">
          {tasks.map(task => (
            <div key={task._id} className="card flex items-center justify-between group" style={{ padding: '1rem 1.25rem' }}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTask(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {task.completed ? <CheckCircle2 size={24} color="var(--accent-secondary)" /> : <Circle size={24} color="var(--text-muted)" />}
                </button>
                <div style={{ opacity: task.completed ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="badge" style={{ background: 'transparent', border: `1px solid ${getPriorityColor(task.priority)}`, color: getPriorityColor(task.priority), padding: '0.1rem 0.6rem' }}>
                      {task.priority}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Clock size={14} /> {task.time}
                    </span>
                    {getCountdown(task.deadlineISO) && (
                      <span className="badge animate-pulse-slow" style={{ background: getCountdown(task.deadlineISO).color, color: 'white', border: 'none', padding: '0.1rem 0.6rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '6px' }}>
                        {getCountdown(task.deadlineISO).text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => deleteTask(task._id)} className="btn-icon-only text-danger" style={{ opacity: 0.4 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.4}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksView;
