import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Sparkles, Loader2, Trash2, Calendar, ChevronRight } from 'lucide-react';

const GoalsView = () => {
  const [goalInput, setGoalInput] = useState('');
  const [, setDeadlineInput] = useState('');
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/goals`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await res.json();
      if (res.ok) {
        setGoals(data);
        if (data.length > 0 && !activeGoal) {
          setActiveGoal(data[0]);
        } else if (activeGoal) {
          const updatedActive = data.find(g => g._id === activeGoal._id);
          if (updatedActive) setActiveGoal(updatedActive);
        }
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleGeneratePlan = async () => {
    if (!goalInput) return;
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      
      const aiRes = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query: `Create a professional 3-phase milestone plan for this goal: ${goalInput}. Each phase should have 3-4 specific tasks. Format your response exactly as a list of phases and tasks.` })
      });
      const aiData = await aiRes.json();

      // Simple parsing of AI response into milestones structure
      const milestones = [
        {
          title: "Phase 1: Foundation",
          status: "Active",
          tasks: aiData.actions?.slice(0, 3).map(t => ({ text: t, done: false })) || [{ text: "Initial research", done: false }]
        },
        {
          title: "Phase 2: Execution",
          status: "Pending",
          tasks: aiData.actions?.slice(3, 6).map(t => ({ text: t, done: false })) || [{ text: "Core implementation", done: false }]
        },
        {
          title: "Phase 3: Optimization",
          status: "Pending",
          tasks: [{ text: "Final review & polish", done: false }]
        }
      ];

      const saveRes = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: goalInput,
          deadline: new Date(Date.now() + 86400000 * 90), // Default 3 months
          milestones: milestones
        })
      });
      
      if (saveRes.ok) {
        setGoalInput(''); setDeadlineInput('');
        fetchGoals();
      }
    } catch (err) { console.error(err); }
    setIsGenerating(false);
  };

  const toggleTask = async (milestoneIdx, taskIdx) => {
    if (!activeGoal) return;
    
    const updatedGoal = { ...activeGoal };
    const task = updatedGoal.milestones[milestoneIdx].tasks[taskIdx];
    task.done = !task.done;

    // Recalculate milestone status and total progress
    const totalTasks = updatedGoal.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
    const completedTasks = updatedGoal.milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.done).length, 0);
    updatedGoal.progress = Math.round((completedTasks / totalTasks) * 100);

    // Update milestone status (if all tasks done -> Completed)
    updatedGoal.milestones.forEach(m => {
       const doneCount = m.tasks.filter(t => t.done).length;
       if (doneCount === m.tasks.length && m.tasks.length > 0) m.status = 'Completed';
       else if (doneCount > 0) m.status = 'Active';
       else m.status = 'Pending';
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/goals/${activeGoal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedGoal)
      });
      if (res.ok) fetchGoals();
    } catch (err) { console.error(err); }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to remove this goal?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (activeGoal?._id === id) setActiveGoal(null);
        fetchGoals();
      }
    } catch (err) { console.error(err); }
  };

  if (loading) {
     return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loader2 className="spin" size={32} color="var(--accent-primary)"/></div>;
  }

  return (
    <div className="view-section split-view" style={{ display: 'flex', gap: '2rem', height: '100%', overflow: 'hidden' }}>
      
      {/* Sidebar for Goal List */}
      <div className="split-sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
         <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target size={18} /> My Goals</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {goals.map(g => (
                  <div key={g._id} onClick={() => setActiveGoal(g)} style={{ padding: '0.75rem', borderRadius: '8px', background: activeGoal?._id === g._id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)', border: activeGoal?._id === g._id ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent', cursor: 'pointer', transition: '0.2s' }}>
                     <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: activeGoal?._id === g._id ? 600 : 400, color: activeGoal?._id === g._id ? 'white' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</p>
                     <div style={{ marginTop: '0.4rem', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div style={{ height: '100%', width: `${g.progress}%`, background: 'var(--accent-primary)', borderRadius: '10px' }} />
                     </div>
                  </div>
               ))}
               <button className="quick-btn" onClick={() => setActiveGoal(null)} style={{ marginTop: '0.5rem', width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  + Set New Goal
               </button>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="split-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
        
        {!activeGoal ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', height: 'fit-content', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', marginBottom: '1.5rem' }}>
              <Target size={32} color="white" />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Goal Planning Expert</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 2.5rem' }}>
              Define your vision and let the AI architect a phased milestone plan for you. Your progress syncs across your entire LifeOS.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>YOUR VISION</label>
                <input type="text" placeholder="e.g. Master React in 3 months" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'inherit', outline: 'none' }} />
              </div>
            </div>
            
            <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }} onClick={handleGeneratePlan} disabled={!goalInput.trim() || isGenerating}>
              {isGenerating ? <Loader2 size={20} className="spin" color="white" /> : <Sparkles size={20} />} Generate My Action Plan
            </button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', animation: 'fadeIn 0.4s ease-out' }}>
            {/* Background Progress Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, height: '6px', width: `${activeGoal.progress}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Target size={28} color="var(--accent-primary)" />
                  </div>
                  <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{activeGoal.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> Deadline: {new Date(activeGoal.deadline).toLocaleDateString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} /> {activeGoal.milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.done).length, 0)} Tasks Done</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '2.5rem', color: 'white', margin: 0, fontWeight: 800, letterSpacing: '-1px' }}>
                    {activeGoal.progress}%
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Overall Progress</span>
                </div>
                <button onClick={() => handleDeleteGoal(activeGoal._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
                  <Trash2 size={16} /> <span style={{ fontSize: '0.8rem' }}>Delete Goal</span>
                </button>
              </div>
            </div>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {activeGoal.milestones && activeGoal.milestones.map((milestone, mIdx) => (
                <div key={mIdx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem', border: milestone.status === 'Active' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, color: milestone.status === 'Pending' ? 'var(--text-secondary)' : 'white', fontSize: '1.1rem' }}>{milestone.title}</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', background: milestone.status === 'Completed' ? 'rgba(20, 184, 166, 0.2)' : milestone.status === 'Active' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)', color: milestone.status === 'Completed' ? 'var(--accent-secondary)' : milestone.status === 'Active' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                       {milestone.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {milestone.tasks.map((task, tIdx) => (
                      <div key={tIdx} onClick={() => toggleTask(mIdx, tIdx)} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', transition: '0.2s', opacity: milestone.status === 'Pending' ? 0.6 : 1 }}>
                        <div style={{ marginTop: '2px', transition: '0.2s', transform: task.done ? 'scale(1.1)' : 'scale(1)' }}>
                          {task.done ? <CheckCircle2 size={20} color="var(--accent-primary)" /> : <Circle size={20} color="var(--text-secondary)" />}
                        </div>
                        <span style={{ fontSize: '0.95rem', color: task.done ? 'var(--text-secondary)' : 'white', textDecoration: task.done ? 'line-through' : 'none', lineHeight: 1.5, transition: '0.2s' }}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GoalsView;
