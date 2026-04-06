import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const OnboardingView = ({ onFinish }) => {
  const [name, setName] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('userName', name.trim());
      onFinish();
    }
  };

  return (
    <div className="app-container items-center justify-center w-full" style={{ background: 'var(--bg-color)', padding: '2rem' }}>
      <div className="card view-section" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="btn-icon-only" style={{ background: 'var(--accent-primary-light)', padding: '1.2rem', borderRadius: 'var(--radius-full)' }}>
            <Sparkles size={40} color="var(--accent-primary)" />
          </div>
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to SmartLife</h1>
        <p style={{ marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          Your minimal, all-in-one minimal daily companion. Manage tasks, habits, and health effortlessly.
        </p>
        <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input
            type="text"
            placeholder="What should we call you?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            style={{ fontSize: '1.1rem', padding: '1rem 1.25rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
            Get Started
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingView;
