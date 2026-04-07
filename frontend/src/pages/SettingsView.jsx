import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings, Sparkles, Brain, CalendarClock, Focus, SunMoon,
  Palette, Type, LayoutGrid, Moon, Sun, Monitor,
  Bell, BellRing, Clock, Volume2, Vibrate, BellOff,
  Target, Flame, Lightbulb, Timer, ListTodo,
  BarChart3, TrendingUp, FileDown, Cloud,
  Shield, KeyRound, Smartphone, History,
  Globe, Accessibility, Contrast,
  Link2, CalendarSync,
  Download, Trash2, Lock,
  VolumeX, SmartphoneNfc,
  LogOut, LogOutIcon,
  ChevronRight, ChevronDown, Check, X, ArrowLeft
} from 'lucide-react';

// ─── Helper Components ──────────────────────────────────────────

const ToggleSwitch = ({ checked, onChange, accentColor }) => (
  <div
    onClick={onChange}
    style={{
      width: '48px', height: '26px', borderRadius: '13px',
      background: checked ? (accentColor || 'var(--accent-primary)') : 'var(--border-solid)',
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: 0,
      boxShadow: checked ? `0 0 12px ${accentColor || 'var(--accent-primary)'}40` : 'none',
    }}
  >
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%', background: 'white',
      position: 'absolute', top: '3px', left: checked ? '25px' : '3px',
      transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    }} />
  </div>
);

const SegmentedControl = ({ options, value, onChange }) => (
  <div style={{
    display: 'flex', gap: '3px', background: 'var(--bg-color)',
    borderRadius: '10px', padding: '3px', border: '1px solid var(--border-color)',
  }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          flex: 1, padding: '0.4rem 0.6rem', borderRadius: '8px',
          fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
          background: value === opt.value ? 'var(--accent-primary)' : 'transparent',
          color: value === opt.value ? 'white' : 'var(--text-secondary)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ColorDot = ({ color, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '28px', height: '28px', borderRadius: '50%',
      background: color, border: active ? '3px solid white' : '2px solid transparent',
      cursor: 'pointer', transition: 'all 0.2s ease',
      boxShadow: active ? `0 0 12px ${color}60` : `0 2px 6px ${color}30`,
      transform: active ? 'scale(1.15)' : 'scale(1)',
      outline: active ? `2px solid ${color}` : 'none',
      outlineOffset: '2px',
    }}
  />
);

const SettingRow = ({ icon: Icon, iconColor, iconBg, title, subtitle, right, onClick, danger, last }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.85rem',
      padding: '0.9rem 0', cursor: onClick ? 'pointer' : 'default',
      borderBottom: last ? 'none' : '1px solid var(--border-color)',
      transition: 'background 0.15s ease',
    }}
  >
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px',
      background: iconBg || 'var(--accent-primary-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} color={danger ? 'var(--danger)' : (iconColor || 'var(--accent-primary)')} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h4 style={{
        margin: 0, fontSize: '0.95rem', fontWeight: 600,
        color: danger ? 'var(--danger)' : 'var(--text-primary)',
      }}>{title}</h4>
      {subtitle && (
        <p style={{
          margin: '0.15rem 0 0', fontSize: '0.78rem',
          color: 'var(--text-muted)', lineHeight: 1.3,
        }}>{subtitle}</p>
      )}
    </div>
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      {right || (onClick && <ChevronRight size={18} color="var(--text-muted)" />)}
    </div>
  </div>
);

const SectionCard = ({ title, icon: SectionIcon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{
      padding: 0, overflow: 'hidden', marginBottom: '1rem',
      border: '1px solid var(--border-color)',
      transition: 'box-shadow 0.3s ease',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          width: '100%', padding: '1rem 1.15rem',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
        }}
      >
        {SectionIcon && <SectionIcon size={18} color="var(--accent-primary)" />}
        <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 700 }}>
          {title}
        </span>
        <ChevronDown
          size={18}
          color="var(--text-muted)"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div style={{
        maxHeight: isOpen ? '2000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: isOpen ? '0 1.15rem 0.5rem' : '0 1.15rem',
      }}>
        {children}
      </div>
    </div>
  );
};

// ─── Accent Color Palette ───────────────────────────────────────

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
];

// ─── Main Component ─────────────────────────────────────────────

const SettingsView = ({ theme, setTheme }) => {
  const { user, logout } = useAuth();

  // Load all settings from localStorage
  const loadSettings = useCallback(() => {
    const saved = localStorage.getItem('smartlife_settings');
    return saved ? JSON.parse(saved) : {};
  }, []);

  const [settings, setSettings] = useState(() => {
    const s = loadSettings();
    return {
      // Smart Preferences
      smartReminders: s.smartReminders ?? true,
      autoScheduling: s.autoScheduling ?? false,
      focusMode: s.focusMode ?? false,
      adaptiveTheme: s.adaptiveTheme ?? false,
      // Appearance
      themeMode: s.themeMode || 'dark',
      accentColor: s.accentColor || '#6366f1',
      fontSize: s.fontSize || 'medium',
      layoutDensity: s.layoutDensity || 'comfortable',
      // Notifications
      taskReminders: s.taskReminders ?? true,
      reminderTime: s.reminderTime || '10',
      dailySummary: s.dailySummary ?? true,
      smartNotifications: s.smartNotifications ?? false,
      notifSound: s.notifSound ?? true,
      snoozeNotifs: s.snoozeNotifs ?? false,
      // Productivity
      dailyGoal: s.dailyGoal || '5',
      streakTracking: s.streakTracking ?? true,
      autoComplete: s.autoComplete ?? true,
      focusTimer: s.focusTimer ?? false,
      defaultDuration: s.defaultDuration || '30',
      // Analytics
      cloudSync: s.cloudSync ?? true,
      // Language & Accessibility
      language: s.language || 'en',
      highContrast: s.highContrast ?? false,
      // Sound
      vibration: s.vibration ?? true,
      hapticFeedback: s.hapticFeedback ?? true,
      // Security
      twoFactor: s.twoFactor ?? false,
    };
  });

  const [toast, setToast] = useState(null);

  // Persist on change
  useEffect(() => {
    localStorage.setItem('smartlife_settings', JSON.stringify(settings));
  }, [settings]);

  const update = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleThemeChange = (mode) => {
    update('themeMode', mode);
    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemDark ? 'dark' : 'light');
    } else {
      setTheme(mode);
    }
    showToast(`Theme set to ${mode}`);
  };

  const handleAccentChange = (color) => {
    update('accentColor', color);
    document.documentElement.style.setProperty('--accent-primary', color);
    showToast('Accent color updated');
  };

  const handleExport = (format) => {
    showToast(`Exporting data as ${format}...`);
  };

  const handleLogout = () => {
    logout();
  };

  const handleLogoutAll = () => {
    showToast('Logged out from all devices');
    setTimeout(() => logout(), 1500);
  };

  return (
    <div className="view-section" style={{
      maxWidth: '640px', margin: '0 auto', width: '100%',
      paddingBottom: '100px',
    }}>
      {/* Page Header */}
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px var(--accent-primary-light)',
          }}>
            <Settings size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Customize your SmartLife experience
            </p>
          </div>
        </div>
      </header>

      {/* ─── 1. Smart Preferences ─────────────────────────────── */}
      <SectionCard title="Smart Preferences" icon={Brain}>
        <SettingRow
          icon={Sparkles} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Smart Reminders" subtitle="AI-based context-aware suggestions"
          right={<ToggleSwitch checked={settings.smartReminders} onChange={() => update('smartReminders', !settings.smartReminders)} />}
        />
        <SettingRow
          icon={CalendarClock} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Auto Task Scheduling" subtitle="Automatically organize your day"
          right={<ToggleSwitch checked={settings.autoScheduling} onChange={() => update('autoScheduling', !settings.autoScheduling)} />}
        />
        <SettingRow
          icon={Focus} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Focus Mode" subtitle="Block distractions while working"
          right={<ToggleSwitch checked={settings.focusMode} onChange={() => update('focusMode', !settings.focusMode)} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={SunMoon} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Adaptive Theme" subtitle="Auto switch based on time of day"
          right={<ToggleSwitch checked={settings.adaptiveTheme} onChange={() => update('adaptiveTheme', !settings.adaptiveTheme)} accentColor="#10b981" />}
          last
        />
      </SectionCard>

      {/* ─── 2. Appearance ────────────────────────────────────── */}
      <SectionCard title="Appearance" icon={Palette}>
        <SettingRow
          icon={theme === 'dark' ? Moon : Sun}
          iconColor={theme === 'dark' ? '#8b5cf6' : '#f59e0b'}
          iconBg={theme === 'dark' ? 'rgba(139,92,246,0.12)' : 'rgba(245,158,11,0.12)'}
          title="Theme"
          subtitle={`Currently: ${settings.themeMode === 'system' ? 'System' : settings.themeMode === 'dark' ? 'Dark' : 'Light'}`}
          right={
            <SegmentedControl
              options={[
                { value: 'light', label: '☀️' },
                { value: 'dark', label: '🌙' },
                { value: 'system', label: '💻' },
              ]}
              value={settings.themeMode}
              onChange={handleThemeChange}
            />
          }
        />
        <div style={{ padding: '0.9rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(236,72,153,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Palette size={20} color="#ec4899" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Accent Color</h4>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personalize your theme
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', paddingLeft: '52px' }}>
            {ACCENT_COLORS.map(c => (
              <ColorDot
                key={c.value}
                color={c.value}
                active={settings.accentColor === c.value}
                onClick={() => handleAccentChange(c.value)}
              />
            ))}
          </div>
        </div>
        <SettingRow
          icon={Type} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
          title="Font Size"
          right={
            <SegmentedControl
              options={[{ value: 'small', label: 'S' }, { value: 'medium', label: 'M' }, { value: 'large', label: 'L' }]}
              value={settings.fontSize}
              onChange={(v) => update('fontSize', v)}
            />
          }
        />
        <SettingRow
          icon={LayoutGrid} iconColor="#14b8a6" iconBg="rgba(20,184,166,0.12)"
          title="Layout Density"
          right={
            <SegmentedControl
              options={[{ value: 'compact', label: 'Tight' }, { value: 'comfortable', label: 'Relaxed' }]}
              value={settings.layoutDensity}
              onChange={(v) => update('layoutDensity', v)}
            />
          }
          last
        />
      </SectionCard>

      {/* ─── 3. Notifications ─────────────────────────────────── */}
      <SectionCard title="Notifications" icon={Bell}>
        <SettingRow
          icon={BellRing} iconColor="#f43f5e" iconBg="rgba(244,63,94,0.12)"
          title="Task Reminders" subtitle="Get notified before deadlines"
          right={<ToggleSwitch checked={settings.taskReminders} onChange={() => update('taskReminders', !settings.taskReminders)} accentColor="#f43f5e" />}
        />
        <SettingRow
          icon={Clock} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Reminder Lead Time"
          right={
            <SegmentedControl
              options={[{ value: '5', label: '5m' }, { value: '10', label: '10m' }, { value: '30', label: '30m' }]}
              value={settings.reminderTime}
              onChange={(v) => update('reminderTime', v)}
            />
          }
        />
        <SettingRow
          icon={BarChart3} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Daily Summary" subtitle="Morning & evening digest"
          right={<ToggleSwitch checked={settings.dailySummary} onChange={() => update('dailySummary', !settings.dailySummary)} accentColor="#8b5cf6" />}
        />
        <SettingRow
          icon={Sparkles} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Smart Notifications" subtitle="Only important alerts"
          right={<ToggleSwitch checked={settings.smartNotifications} onChange={() => update('smartNotifications', !settings.smartNotifications)} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={Volume2} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Notification Sound"
          right={<ToggleSwitch checked={settings.notifSound} onChange={() => update('notifSound', !settings.notifSound)} accentColor="#10b981" />}
        />
        <SettingRow
          icon={BellOff} iconColor="#94a3b8" iconBg="rgba(148,163,184,0.12)"
          title="Snooze Notifications" subtitle="Delay alerts temporarily"
          right={<ToggleSwitch checked={settings.snoozeNotifs} onChange={() => update('snoozeNotifs', !settings.snoozeNotifs)} />}
          last
        />
      </SectionCard>

      {/* ─── 4. Productivity ──────────────────────────────────── */}
      <SectionCard title="Productivity" icon={Target}>
        <SettingRow
          icon={ListTodo} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
          title="Daily Goal" subtitle="Tasks per day target"
          right={
            <SegmentedControl
              options={[{ value: '3', label: '3' }, { value: '5', label: '5' }, { value: '8', label: '8' }, { value: '10', label: '10' }]}
              value={settings.dailyGoal}
              onChange={(v) => update('dailyGoal', v)}
            />
          }
        />
        <SettingRow
          icon={Flame} iconColor="#f43f5e" iconBg="rgba(244,63,94,0.12)"
          title="Streak Tracking" subtitle="Track consecutive productive days"
          right={<ToggleSwitch checked={settings.streakTracking} onChange={() => update('streakTracking', !settings.streakTracking)} accentColor="#f43f5e" />}
        />
        <SettingRow
          icon={Lightbulb} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Auto-Complete Suggestions" subtitle="AI-powered task completion hints"
          right={<ToggleSwitch checked={settings.autoComplete} onChange={() => update('autoComplete', !settings.autoComplete)} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={Timer} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Focus Timer" subtitle="Pomodoro-style work sessions"
          right={<ToggleSwitch checked={settings.focusTimer} onChange={() => update('focusTimer', !settings.focusTimer)} accentColor="#10b981" />}
        />
        <SettingRow
          icon={Clock} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Default Task Duration"
          right={
            <SegmentedControl
              options={[{ value: '15', label: '15m' }, { value: '30', label: '30m' }, { value: '60', label: '1h' }]}
              value={settings.defaultDuration}
              onChange={(v) => update('defaultDuration', v)}
            />
          }
          last
        />
      </SectionCard>

      {/* ─── 5. Analytics & Reports ───────────────────────────── */}
      <SectionCard title="Analytics & Reports" icon={BarChart3} defaultOpen={false}>
        <SettingRow
          icon={TrendingUp} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Weekly Insights" subtitle="View your productivity trends"
          onClick={() => showToast('Opening weekly insights...')}
        />
        <SettingRow
          icon={BarChart3} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Monthly Report" subtitle="Detailed completion statistics"
          onClick={() => showToast('Opening monthly report...')}
        />
        <SettingRow
          icon={FileDown} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Export Data"
          right={
            <div className="flex gap-2">
              <button onClick={() => handleExport('PDF')} style={{
                padding: '0.35rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-solid)',
                background: 'var(--surface-solid)', color: 'var(--text-primary)', fontSize: '0.75rem',
                cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)',
              }}>PDF</button>
              <button onClick={() => handleExport('CSV')} style={{
                padding: '0.35rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-solid)',
                background: 'var(--surface-solid)', color: 'var(--text-primary)', fontSize: '0.75rem',
                cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)',
              }}>CSV</button>
            </div>
          }
        />
        <SettingRow
          icon={Cloud} iconColor={settings.cloudSync ? '#22c55e' : '#94a3b8'}
          iconBg={settings.cloudSync ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)'}
          title="Cloud Sync" subtitle={settings.cloudSync ? 'Connected & syncing' : 'Sync disabled'}
          right={<ToggleSwitch checked={settings.cloudSync} onChange={() => update('cloudSync', !settings.cloudSync)} accentColor="#22c55e" />}
          last
        />
      </SectionCard>

      {/* ─── 6. Security ──────────────────────────────────────── */}
      <SectionCard title="Security" icon={Shield} defaultOpen={false}>
        <SettingRow
          icon={KeyRound} iconColor="#f43f5e" iconBg="rgba(244,63,94,0.12)"
          title="Change Password" subtitle="Update your credentials"
          onClick={() => showToast('Password change flow coming soon')}
        />
        <SettingRow
          icon={Shield} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Two-Factor Authentication" subtitle={settings.twoFactor ? 'Enabled' : 'Disabled'}
          right={<ToggleSwitch checked={settings.twoFactor} onChange={() => { update('twoFactor', !settings.twoFactor); showToast(settings.twoFactor ? '2FA disabled' : '2FA enabled'); }} accentColor="#8b5cf6" />}
        />
        <SettingRow
          icon={Smartphone} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Device Management" subtitle="View and manage logged-in devices"
          onClick={() => showToast('Device management opening...')}
        />
        <SettingRow
          icon={History} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Login Activity" subtitle="View recent sign-in history"
          onClick={() => showToast('Showing login history...')}
          last
        />
      </SectionCard>

      {/* ─── 7. Language & Accessibility ───────────────────────── */}
      <SectionCard title="Language & Accessibility" icon={Globe} defaultOpen={false}>
        <SettingRow
          icon={Globe} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
          title="Language"
          right={
            <SegmentedControl
              options={[{ value: 'en', label: 'EN' }, { value: 'hi', label: 'हि' }]}
              value={settings.language}
              onChange={(v) => { update('language', v); showToast(`Language set to ${v === 'en' ? 'English' : 'Hindi'}`); }}
            />
          }
        />
        <SettingRow
          icon={Accessibility} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Font Accessibility" subtitle="Larger text for readability"
          right={
            <SegmentedControl
              options={[{ value: 'small', label: 'A' }, { value: 'medium', label: 'A' }, { value: 'large', label: 'A' }]}
              value={settings.fontSize}
              onChange={(v) => update('fontSize', v)}
            />
          }
        />
        <SettingRow
          icon={Contrast} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="High Contrast Mode" subtitle="Improved visibility"
          right={<ToggleSwitch checked={settings.highContrast} onChange={() => update('highContrast', !settings.highContrast)} accentColor="#f59e0b" />}
          last
        />
      </SectionCard>

      {/* ─── 8. Integrations ──────────────────────────────────── */}
      <SectionCard title="Integrations" icon={Link2} defaultOpen={false}>
        <SettingRow
          icon={CalendarSync} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Google Calendar" subtitle="Sync tasks with your calendar"
          onClick={() => showToast('Google Calendar sync coming soon')}
        />
        <SettingRow
          icon={Link2} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="External Apps" subtitle="Connect with Notion, Slack, etc."
          onClick={() => showToast('App integrations coming soon')}
          last
        />
      </SectionCard>

      {/* ─── 9. Data & Privacy ────────────────────────────────── */}
      <SectionCard title="Data & Privacy" icon={Lock} defaultOpen={false}>
        <SettingRow
          icon={Download} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Download My Data" subtitle="Get a copy of all your data"
          onClick={() => showToast('Preparing data download...')}
        />
        <SettingRow
          icon={Lock} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
          title="Privacy Controls" subtitle="Manage data sharing preferences"
          onClick={() => showToast('Privacy controls coming soon')}
        />
        <SettingRow
          icon={Trash2} iconColor="var(--danger)" iconBg="var(--danger-light)"
          title="Delete Account" subtitle="Permanently remove all data"
          danger
          onClick={() => showToast('Account deletion requires confirmation via email')}
          last
        />
      </SectionCard>

      {/* ─── 10. Sound & Feedback ─────────────────────────────── */}
      <SectionCard title="Sound & Feedback" icon={Volume2} defaultOpen={false}>
        <SettingRow
          icon={settings.notifSound ? Volume2 : VolumeX}
          iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Notification Sound"
          right={<ToggleSwitch checked={settings.notifSound} onChange={() => update('notifSound', !settings.notifSound)} accentColor="#0ea5e9" />}
        />
        <SettingRow
          icon={Vibrate} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Vibration"
          right={<ToggleSwitch checked={settings.vibration} onChange={() => update('vibration', !settings.vibration)} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={SmartphoneNfc} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Haptic Feedback" subtitle="Tactile response on interactions"
          right={<ToggleSwitch checked={settings.hapticFeedback} onChange={() => update('hapticFeedback', !settings.hapticFeedback)} accentColor="#8b5cf6" />}
          last
        />
      </SectionCard>

      {/* ─── 11. Session ──────────────────────────────────────── */}
      <SectionCard title="Session" icon={LogOut} defaultOpen={true}>
        <SettingRow
          icon={LogOut} iconColor="var(--danger)" iconBg="var(--danger-light)"
          title="Logout" subtitle="Sign out of this device"
          danger
          onClick={handleLogout}
        />
        <SettingRow
          icon={LogOutIcon} iconColor="var(--danger)" iconBg="var(--danger-light)"
          title="Logout All Devices" subtitle="End all active sessions"
          danger
          onClick={handleLogoutAll}
          last
        />
      </SectionCard>

      {/* App Version */}
      <div style={{
        textAlign: 'center', padding: '1.5rem 0 0',
        color: 'var(--text-muted)', fontSize: '0.75rem',
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>SmartLife v2.0.0</p>
        <p style={{ margin: '0.25rem 0 0', opacity: 0.7 }}>Made with ❤️ for productivity</p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-solid)', color: 'var(--text-primary)',
          padding: '0.75rem 1.5rem', borderRadius: '14px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25), 0 0 0 1px var(--border-color)',
          zIndex: 5000, animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.88rem', fontWeight: 600, backdropFilter: 'blur(20px)',
          fontFamily: 'var(--font-body)',
          maxWidth: '90vw',
        }}>
          <Check size={16} color="var(--accent-primary)" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default SettingsView;
