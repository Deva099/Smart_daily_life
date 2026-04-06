import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Moon, Sun, Bell, Shield, LogOut, X, ArrowRight, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfilePic } from '../services/api';

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={onChange}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: checked ? 'var(--accent-primary)' : 'var(--text-muted)',
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.3s'
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: 'white',
      position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
      transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }} />
  </div>
);

const ProfileView = ({ theme, setTheme }) => {
  const { user, logout, updateUser } = useAuth();
  const userName = user?.name || 'User';
  const initial = userName.charAt(0).toUpperCase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const [notifSettings, setNotifSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('notificationSettings')) || {
      pushEnabled: true,
      dailyAlerts: true,
      taskReminders: true,
      habitReminders: true
    };
  });

  const handleSaveSettings = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifSettings));
    setIsModalOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = () => {
    logout();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local validation
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPG and PNG files are allowed.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setUploading(true);
    reader.onerror = () => {
      setUploading(false);
      setMessage({ type: 'error', text: 'Failed to read file' });
    };

    reader.onload = async () => {
      const base64String = reader.result;
      setMessage({ type: '', text: '' });

      try {
        const res = await updateProfilePic({ profilePic: base64String });
        updateUser({ profilePic: res.profilePic });
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        
        // Auto clear success message
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Upload failed' });
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="view-section" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', animation: 'fadeIn 0.6s ease-out' }}>
      
      {message.text && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '1rem', borderRadius: '12px', marginBottom: '1rem',
          background: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          animation: 'fadeSlideUp 0.3s ease-out',
          fontSize: '0.9rem', fontWeight: 500
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="card flex flex-col items-center justify-center mb-6" style={{ 
        textAlign: 'center', 
        padding: '3.5rem 2rem',
        background: 'var(--bg-card-gradient)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px',
          background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none'
        }} />
        
        <div className="avatar-container" style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div 
            className="avatar" 
            style={{ 
              width: '120px', height: '120px', fontSize: '3rem', 
              borderRadius: '50%',
              background: user.profilePic ? `url(${user.profilePic}) center/cover` : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              border: '4px solid var(--surface-solid)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => !uploading && fileInputRef.current.click()}
          >
            {!user.profilePic && initial}
            
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2
              }}>
                <Loader2 className="animate-spin" size={32} color="white" />
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            style={{
              position: 'absolute', bottom: '5px', right: '5px',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--accent-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid var(--surface-solid)',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={18} />}
          </button>

          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>{userName}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
          SmartLife Member <span style={{ opacity: 0.6 }}>since 2026</span>
        </p>
        <p style={{ 
          fontSize: '0.8rem', color: 'var(--text-muted)', 
          marginTop: '0.5rem', fontWeight: 500, letterSpacing: '0.02em',
          background: 'var(--accent-primary-light)', padding: '0.25rem 0.75rem',
          borderRadius: '20px'
        }}>
          JPG, PNG • Max 2MB
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Preferences</h3>
        </div>
        
        <div className="flex flex-col gap-2">
          {/* Theme Row */}
          <div 
            className="settings-row" 
            onClick={toggleTheme}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem', borderRadius: '16px', cursor: 'pointer',
              transition: 'all 0.2s ease', border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div className="flex items-center gap-4">
              <div className="btn-icon-only" style={{ 
                background: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                width: '48px', height: '48px'
              }}>
                {theme === 'dark' ? <Sun size={22} color="#f59e0b" /> : <Moon size={22} color="var(--accent-primary)" />}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 600 }}>Appearance</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            
            <div 
              className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`} 
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              style={{ padding: '4px' }}
            >
              <div className="theme-toggle-knob">
                {theme === 'dark' ? <Moon size={12} color="var(--accent-primary)" /> : <Sun size={12} color="#f59e0b" />}
              </div>
            </div>
          </div>

          {/* Notifications Row */}
          <div 
            className="settings-row" 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem', borderRadius: '16px', cursor: 'pointer',
              transition: 'all 0.2s ease', border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div className="flex items-center gap-4">
              <div className="btn-icon-only" style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px' }}>
                <Bell size={22} color="#10b981" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 600 }}>Notifications</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage your daily alerts</p>
              </div>
            </div>
            <ArrowRight size={18} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0' }} />

          {/* Sign Out Row - Fixed redundancy */}
          <div 
            className="settings-row signout-row" 
            onClick={handleSignOut}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem', borderRadius: '16px', cursor: 'pointer',
              transition: 'all 0.2s ease', border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div className="flex items-center gap-4">
              <div className="btn-icon-only" style={{ background: 'rgba(239, 68, 68, 0.1)', width: '48px', height: '48px' }}>
                <LogOut size={22} color="#ef4444" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#ef4444' }}>Sign Out</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', opacity: 0.7 }}>Securely end your session</p>
              </div>
            </div>
            <div style={{ 
              padding: '0.5rem 1rem', borderRadius: '10px', 
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em'
            }}>
              Logout
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.3)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="card shadow-lg flex flex-col gap-4" style={{ 
            width: '100%', maxWidth: '420px', 
            animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid var(--accent-primary)'
          }}>
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Notification Settings</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn-icon-only" 
                style={{ background: 'transparent', padding: '0.2rem' }}
              >
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Push Notifications</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allow all system notifications</p>
                </div>
                <ToggleSwitch 
                  checked={notifSettings.pushEnabled} 
                  onChange={() => setNotifSettings({...notifSettings, pushEnabled: !notifSettings.pushEnabled})} 
                />
              </div>

              <div className="flex justify-between items-center" style={{ opacity: notifSettings.pushEnabled ? 1 : 0.5, pointerEvents: notifSettings.pushEnabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Daily Planner Alerts</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Morning agenda and evening wrap-up</p>
                </div>
                <ToggleSwitch 
                  checked={notifSettings.dailyAlerts} 
                  onChange={() => setNotifSettings({...notifSettings, dailyAlerts: !notifSettings.dailyAlerts})} 
                />
              </div>

              <div className="flex justify-between items-center" style={{ opacity: notifSettings.pushEnabled ? 1 : 0.5, pointerEvents: notifSettings.pushEnabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Task Reminders</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get notified for specific task deadlines</p>
                </div>
                <ToggleSwitch 
                  checked={notifSettings.taskReminders} 
                  onChange={() => setNotifSettings({...notifSettings, taskReminders: !notifSettings.taskReminders})} 
                />
              </div>

              <div className="flex justify-between items-center" style={{ opacity: notifSettings.pushEnabled ? 1 : 0.5, pointerEvents: notifSettings.pushEnabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Habit Streaks</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reminders to complete daily habits</p>
                </div>
                <ToggleSwitch 
                  checked={notifSettings.habitReminders} 
                  onChange={() => setNotifSettings({...notifSettings, habitReminders: !notifSettings.habitReminders})} 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSettings}>Save Settings</button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default ProfileView;
