import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Circle, Clock, Bell } from 'lucide-react';
import { fetchTasks, createTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, fetchNotes, createNote, updateNote } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CalendarView = () => {
  // --- STATE ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  
  const [notes, setNotes] = useState({});
  const [tasks, setTasks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState('');
  const [hasReminder, setHasReminder] = useState(false);

  // --- API DATA FETCHING ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedTasks, fetchedNotes] = await Promise.all([fetchTasks(), fetchNotes()]);
        
        const tasksMap = {};
        fetchedTasks.forEach(t => {
          if (t.dateStr) {
            if (!tasksMap[t.dateStr]) tasksMap[t.dateStr] = [];
            tasksMap[t.dateStr].push(t);
          }
        });

        const notesMap = {};
        fetchedNotes.forEach(n => {
          notesMap[n.title] = { id: n._id, content: n.content }; // title serves as the date string natively
        });

        setTasks(tasksMap);
        setNotes(notesMap);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- NOTIFICATIONS POLLING ---
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const todayTasks = tasks[todayString] || [];
      let updated = false;
      const newTodayTasks = todayTasks.map(task => {
        if (!task.completed && task.hasReminder && task.reminderTime === currentTimeString && !task.notified) {
          if (Notification.permission === 'granted') {
            new Notification('Task Reminder', { body: task.title });
          }
          // Sync with server
          apiUpdateTask(task._id, { notified: true }).catch(err => console.error(err));
          
          updated = true;
          return { ...task, notified: true };
        }
        return task;
      });

      if (updated) setTasks(prev => ({ ...prev, [todayString]: newTodayTasks }));
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [tasks]);

  // --- CALENDAR LOGIC ---
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDateClick = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const todayStr = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // --- TASKS LOGIC ---
  const selectedTasks = tasks[selectedDate] || [];
  const completedCount = selectedTasks.filter(t => t.completed).length;
  const totalCount = selectedTasks.length;

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    try {
      const savedTask = await createTask({
        title: newTaskText.trim(),
        hasReminder,
        reminderTime: hasReminder ? newTaskReminder : null,
        dateStr: selectedDate
      });

      setTasks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), savedTask]
      }));
      
      setNewTaskText('');
      setHasReminder(false);
      setNewTaskReminder('');
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleTask = async (taskId) => {
    const dayTasks = tasks[selectedDate] || [];
    const task = dayTasks.find(t => t._id === taskId);
    if (!task) return;

    setTasks(prev => ({
      ...prev,
      [selectedDate]: dayTasks.map(t => t._id === taskId ? { ...t, completed: !t.completed } : t)
    }));

    try {
      await apiUpdateTask(taskId, { completed: !task.completed });
    } catch (e) {
      setTasks(prev => ({
        ...prev,
        [selectedDate]: dayTasks.map(t => t._id === taskId ? { ...t, completed: task.completed } : t)
      }));
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter(t => t._id !== taskId)
    }));

    try {
      await apiDeleteTask(taskId);
    } catch (e) {
      console.error(e);
    }
  };

  // --- NOTES LOGIC ---
  const handleNoteChange = (e) => {
    const newContent = e.target.value;
    setNotes(prev => ({
      ...prev,
      [selectedDate]: { ...prev[selectedDate], content: newContent }
    }));
  };

  const handleNoteBlur = async () => {
    const currentNote = notes[selectedDate];
    if (!currentNote || !currentNote.content.trim()) return;
    
    try {
      if (currentNote.id) {
        await updateNote(currentNote.id, { content: currentNote.content });
      } else {
        const savedNote = await createNote({ title: selectedDate, content: currentNote.content });
        setNotes(prev => ({
          ...prev,
          [selectedDate]: { id: savedNote._id, content: savedNote.content }
        }));
      }
    } catch (e) {
      console.error("Failed to save note", e);
    }
  };

  // --- CHART LOGIC ---
  // Get start of the week (Sunday) for the selected date
  const selDateObj = new Date(selectedDate);
  const startOfWeek = new Date(selDateObj);
  startOfWeek.setDate(selDateObj.getDate() - selDateObj.getDay());
  
  const weeklyData = weekDays.map((down, index) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + index);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dTasks = tasks[dStr] || [];
    return dTasks.filter(t => t.completed).length;
  });

  const chartData = {
    labels: weekDays,
    datasets: [
      {
        label: 'Completed Tasks',
        data: weeklyData,
        backgroundColor: 'var(--accent-primary-light)',
        borderColor: 'var(--accent-primary)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: 'var(--text-secondary)' }, grid: { color: 'var(--border-color)' } },
      x: { ticks: { color: 'var(--text-secondary)' }, grid: { display: false } }
    }
  };

  return (
    <div className="view-section calendar-view-container">
      
      {/* Header */}
      <header className="mb-6">
         <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>Calendar & Tracker</h1>
         <p className="subtext" style={{ fontSize: '0.95rem' }}>Organize your days and track your weekly progress.</p>
         {isLoading && <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>Syncing database...</p>}
      </header>

      <div className="calendar-layout-grid">
        
        {/* LEFT COLUMN: Calendar & Chart */}
        <div className="left-col-stack">
          {/* Calendar Card */}
          <div className="card calendar-card">
             <div className="calendar-header">
               <button onClick={handlePrevMonth} className="btn-icon-only"><ChevronLeft size={20}/></button>
               <h3 style={{ margin: 0 }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
               <button onClick={handleNextMonth} className="btn-icon-only"><ChevronRight size={20}/></button>
             </div>
             
             <div className="calendar-grid">
               {weekDays.map(day => <div key={day} className="calendar-day-name">{day}</div>)}
               
               {/* Empty slots for first week */}
               {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                 <div key={`empty-${i}`} className="calendar-day empty"></div>
               ))}
               
               {/* Days */}
               {Array.from({ length: daysInMonth }).map((_, i) => {
                 const dayNum = i + 1;
                 const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                 const isSelected = dateStr === selectedDate;
                 const isToday = dateStr === todayStr();
                 
                 // show a small dot if there are tasks
                 const dayTasks = tasks[dateStr] || [];
                 const hasTasks = dayTasks.length > 0;
                 const allDone = hasTasks && dayTasks.every(t => t.completed);

                 return (
                   <div 
                     key={dayNum} 
                     className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                     onClick={() => handleDateClick(dayNum)}
                   >
                     <span>{dayNum}</span>
                     {hasTasks && (
                       <div className={`task-dot ${allDone ? 'done' : ''}`}></div>
                     )}
                   </div>
                 );
               })}
             </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="card chart-card flex-col gap-4">
             <h3 style={{ margin: 0 }}>Weekly Progress</h3>
             <p className="subtext mt-0 pt-0" style={{ marginTop: '-0.5rem' }}>Tasks completed this week</p>
             <div className="chart-container" style={{ height: '200px', width: '100%', position: 'relative' }}>
               <Bar data={chartData} options={chartOptions} />
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tasks & Notes */}
        <div className="right-col-stack">
          
          {/* Selected Date Header */}
          <div className="card date-summary-card">
            <h2 style={{ margin: 0, color: 'var(--accent-primary)' }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            {selectedDate === todayStr() && <div className="badge" style={{ marginTop: '0.5rem', background: 'var(--accent-primary)', color: 'white', border: 'none' }}>Today</div>}
          </div>

          {/* Tasks Section */}
          <div className="card tasks-card flex-col gap-4">
            <div className="flex justify-between items-center">
               <h3 style={{ margin: 0 }}>Daily Tasks</h3>
               {totalCount > 0 && (
                 <span className="badge" style={{ background: completedCount === totalCount ? 'var(--success-light)' : 'var(--surface-solid)', color: completedCount === totalCount ? 'var(--success)' : 'var(--text-secondary)' }}>
                   {completedCount}/{totalCount} Completed
                 </span>
               )}
            </div>
            
            <form onSubmit={handleAddTask} className="add-task-form">
              <input 
                type="text" 
                placeholder="What do you need to do?" 
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
              />
              <div className="reminder-toggle flex items-center gap-2 mt-2">
                <button 
                  type="button"
                  className={`btn-icon-only ${hasReminder ? 'active-reminder' : ''}`} 
                  onClick={() => setHasReminder(!hasReminder)}
                  title="Add Reminder"
                >
                  <Bell size={16} color={hasReminder ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                </button>
                {hasReminder && (
                  <input 
                    type="time" 
                    value={newTaskReminder} 
                    onChange={e => setNewTaskReminder(e.target.value)} 
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    required
                  />
                )}
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', marginLeft: 'auto' }}>
                  <Plus size={18} /> Add
                </button>
              </div>
            </form>

            <div className="tasks-list">
              {totalCount === 0 ? (
                <p className="subtext text-center mt-2" style={{ padding: '1rem' }}>No tasks for this date.</p>
              ) : (
                selectedTasks.map(task => (
                  <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <button className="task-check" onClick={() => toggleTask(task._id)}>
                      {task.completed ? <CheckCircle size={20} color="var(--success)" /> : <Circle size={20} color="var(--text-muted)" />}
                    </button>
                    <div className="task-content">
                      <span className="task-text">{task.title}</span>
                      {task.hasReminder && (
                        <div className="task-reminder-badge">
                          <Clock size={12} /> {task.reminderTime}
                        </div>
                      )}
                    </div>
                    <button className="task-delete" onClick={() => deleteTask(task._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="card notes-card flex-col gap-2">
            <h3 style={{ margin: 0 }}>Daily Notes</h3>
            <textarea
              placeholder="Write down your thoughts, reflections, or important details for this day..."
              value={notes[selectedDate]?.content || ''}
              onChange={handleNoteChange}
              onBlur={handleNoteBlur}
              style={{ minHeight: '150px', resize: 'vertical', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarView;
