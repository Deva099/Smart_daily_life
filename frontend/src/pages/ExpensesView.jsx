import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { ArrowUpRight, ArrowDownRight, Sparkles, Send, AlertTriangle, Loader2, Trash2, Plus } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];
const CATEGORY_COLORS = {
  'Food': '#14b8a6',
  'Transport': '#f59e0b',
  'Entertainment': '#a855f7',
  'Bills': '#3b82f6',
  'Shopping': '#ec4899',
  'Health': '#ef4444',
  'Other': '#94a3b8'
};

const ExpensesView = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [expenseInput, setExpenseInput] = useState(''); // for AI analysis

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setExpenses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, amount: parseFloat(amount), category })
      });
      if (res.ok) {
        setTitle(''); setAmount(''); setCategory('Other');
        fetchExpenses();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchExpenses();
    } catch (err) { console.error(err); }
  };

  const handleAnalyze = async () => {
    if (!expenseInput.trim() && expenses.length === 0) return;
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/ai/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          expenses: expenseInput.trim() 
            ? [{ description: "Raw User Input", amount: expenseInput }] 
            : expenses.map(e => ({ description: e.title, amount: e.amount, category: e.category }))
        })
      });
      const data = await res.json();
      if (res.ok) setAnalysisData(data);
    } catch (err) { console.error(err); }
    setIsAnalyzing(false);
  };

  // Chart Data Calculations
  const doughnutData = useMemo(() => {
    const categoryTotals = {};
    CATEGORIES.forEach(cat => categoryTotals[cat] = 0);
    expenses.forEach(exp => {
      if (categoryTotals[exp.category] !== undefined) {
        categoryTotals[exp.category] += exp.amount;
      } else {
        categoryTotals['Other'] += exp.amount;
      }
    });

    return {
      labels: CATEGORIES,
      datasets: [{
        data: CATEGORIES.map(cat => categoryTotals[cat]),
        backgroundColor: CATEGORIES.map(cat => CATEGORY_COLORS[cat]),
        hoverOffset: 4,
        borderWidth: 0
      }]
    };
  }, [expenses]);

  const barData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyTotals = new Array(7).fill(0);
    
    // Get current week expenses
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= startOfWeek) {
        dailyTotals[expDate.getDay()] += exp.amount;
      }
    });

    return {
      labels: days,
      datasets: [{
        label: 'Spent',
        data: dailyTotals,
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderRadius: 4
      }]
    };
  }, [expenses]);

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
    cutout: '70%'
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
    }
  };

  return (
    <div className="view-section" style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
      <div className="header-row" style={{ marginBottom: 0 }}>
        <h2>Expenses Analytics</h2>
      </div>

      {/* Top Section: Analysis & Add Expense */}
      <div className="dashboard-grid" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Add Expense Form */}
        <div className="glass-panel" style={{ flex: '1 1 350px', padding: '2rem' }}>
          <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Plus size={20} color="var(--accent-primary)" /> Add Transaction
          </h4>
          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', color: 'white', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', color: 'white', outline: 'none' }} />
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', color: 'white', outline: 'none' }}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <button className="btn-primary" type="submit" style={{ marginTop: '0.5rem' }}>Add Expense</button>
          </form>
        </div>

        {/* AI Advisor Input */}
        <div className="glass-panel" style={{ flex: '1 1 450px', padding: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} color="var(--accent-primary)" /> Smart Financial Advisor
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {expenses.length > 0 ? "Analyzing your live data. You can also paste additional context here." : "Paste your monthly budget context to generate a plan."}
          </p>
          <textarea 
            placeholder="e.g. Total Income $4000, Target Savings $1000..."
            value={expenseInput}
            onChange={(e) => setExpenseInput(e.target.value)}
            style={{ width: '100%', height: '80px', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'inherit', resize: 'none', marginBottom: '1rem', outline: 'none', fontSize: '0.9rem' }}
          />
          <button className="btn-primary" onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 size={16} className="spin" color="white" /> : <Sparkles size={16} />} Get AI Advice
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="dashboard-grid" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Total Expenditure</p>
          <h3 style={{ fontSize: '2rem', color: 'white', fontWeight: 700 }}>${totalSpent.toLocaleString()}</h3>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Top Category</p>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
            {doughnutData.labels[doughnutData.datasets[0].data.indexOf(Math.max(...doughnutData.datasets[0].data))] || 'N/A'}
          </h3>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Transactions</p>
          <h3 style={{ fontSize: '2rem', color: 'white', fontWeight: 700 }}>{expenses.length}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-grid" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 450px', padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Categories</h4>
          <div style={{ height: '220px' }}>
            {expenses.length > 0 ? (
              <Doughnut data={doughnutData} options={chartOptions} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No data yet</div>
            )}
          </div>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 350px', padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Weekly Trend</h4>
          <div style={{ height: '220px' }}>
             {expenses.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Overlay (if exists) */}
      {analysisData && (
          <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', animation: 'fadeIn 0.4s ease-out' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <h4 style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Sparkles size={20} /> AI Financial Strategy
               </h4>
               <button onClick={() => setAnalysisData(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Close</button>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div>
                   <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Insights</strong>
                   <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {analysisData.insights?.map((ins, i) => <li key={i}>{ins}</li>)}
                   </ul>
                </div>
                <div>
                   <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Recommended Actions</strong>
                   {analysisData.actions?.map((act, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <ArrowUpRight size={16} color="var(--accent-secondary)" />
                         <span style={{ fontSize: '0.9rem' }}>{act}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
      )}

      {/* Transaction List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Recent History</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="spin" /></div>
          ) : expenses.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No transactions recorded.</p>
          ) : (
            expenses.slice(0, 10).map(exp => (
              <div key={exp._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLORS[exp.category] || '#94a3b8' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>{exp.title}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(exp.date).toLocaleDateString()} • {exp.category}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'white' }}>${exp.amount.toFixed(2)}</span>
                  <button onClick={() => handleDeleteExpense(exp._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.6}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ExpensesView;
