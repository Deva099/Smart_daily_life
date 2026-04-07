import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useSettings from '../hooks/useSettings';
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
  ChevronRight, ChevronDown, Check, Loader2, CloudOff,
  RotateCcw, RefreshCw
} from 'lucide-react';

// ─── Helper Components ──────────────────────────────────────────

const ToggleSwitch = ({ checked, onChange, accentColor, disabled }) => (
  <div
    onClick={disabled ? undefined : onChange}
    style={{
      width: '48px', height: '26px', borderRadius: '13px',
      background: checked ? (accentColor || 'var(--accent-primary)') : 'var(--border-solid)',
      position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
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

const SegmentedControl = ({ options, value, onChange, disabled }) => (
  <div style={{
    display: 'flex', gap: '3px', background: 'var(--bg-color)',
    borderRadius: '10px', padding: '3px', border: '1px solid var(--border-color)',
    opacity: disabled ? 0.5 : 1,
  }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => !disabled && onChange(opt.value)}
        disabled={disabled}
        style={{
          flex: 1, padding: '0.4rem 0.6rem', borderRadius: '8px',
          fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: value === opt.value ? 'var(--accent-primary)' : 'transparent',
          color: value === opt.value ? 'white' : 'var(--text-secondary)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
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
      outline: active ? `2px solid ${color}` : 'none', outlineOffset: '2px',
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
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={20} color={danger ? 'var(--danger)' : (iconColor || 'var(--accent-primary)')} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h4 style={{
        margin: 0, fontSize: '0.95rem', fontWeight: 600,
        color: danger ? 'var(--danger)' : 'var(--text-primary)',
      }}>{title}</h4>
      {subtitle && (
        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
          {subtitle}
        </p>
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
      border: '1px solid var(--border-color)', transition: 'box-shadow 0.3s ease',
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
        <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 700 }}>{title}</span>
        <ChevronDown
          size={18} color="var(--text-muted)"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div style={{
        maxHeight: isOpen ? '2000px' : '0', overflow: 'hidden',
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
  const { settings, loading, syncing, lastSaved, error, updateSetting, resetAllSettings } = useSettings();
  const [toast, setToast] = useState(null);

  // Convenience: read a setting value
  const get = (section, key) => settings?.[section]?.[key];

  // Convenience: update a setting and show feedback
  const set = (section, key, value, toastMsg) => {
    updateSetting(section, key, value);
    if (toastMsg) showToast(toastMsg);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleThemeChange = (mode) => {
    set('appearance', 'themeMode', mode, `Theme set to ${mode}`);
    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemDark ? 'dark' : 'light');
    } else {
      setTheme(mode);
    }
  };

  const handleAccentChange = (color) => {
    set('appearance', 'accentColor', color, 'Accent color updated');
    document.documentElement.style.setProperty('--accent-primary', color);
  };

  const handleExport = (format) => showToast(`Exporting data as ${format}...`);
  const handleLogout = () => logout();
  const handleLogoutAll = () => { showToast('Logged out from all devices'); setTimeout(() => logout(), 1500); };
  const handleResetSettings = async () => {
    await resetAllSettings();
    setTheme('dark');
    document.documentElement.style.removeProperty('--accent-primary');
    showToast('All settings reset to defaults');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="view-section" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <div className="flex items-center justify-center" style={{ padding: '4rem 0', flexDirection: 'column', gap: '1rem' }}>
          <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-section" style={{ maxWidth: '640px', margin: '0 auto', width: '100%', paddingBottom: '100px' }}>
      
      {/* ─── Page Header ──────────────────────────────────────── */}
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
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Customize your SmartLife experience
            </p>
          </div>
          {/* Sync Status Indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.7rem', color: syncing ? 'var(--warning)' : error ? 'var(--danger)' : 'var(--text-muted)',
            fontWeight: 500,
          }}>
            {syncing ? (
              <><RefreshCw size={13} className="animate-spin" /> Saving</>
            ) : error ? (
              <><CloudOff size={13} /> Offline</>
            ) : lastSaved ? (
              <><Cloud size={13} color="var(--success)" /> Synced</>
            ) : null}
          </div>
        </div>
      </header>

      {/* ─── 1. Smart Preferences ─────────────────────────────── */}
      <SectionCard title="Smart Preferences" icon={Brain}>
        <SettingRow
          icon={Sparkles} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Smart Reminders" subtitle="AI-based context-aware suggestions"
          right={<ToggleSwitch checked={get('smartPreferences', 'smartReminders')} onChange={() => set('smartPreferences', 'smartReminders', !get('smartPreferences', 'smartReminders'))} />}
        />
        <SettingRow
          icon={CalendarClock} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Auto Task Scheduling" subtitle="Automatically organize your day"
          right={<ToggleSwitch checked={get('smartPreferences', 'autoScheduling')} onChange={() => set('smartPreferences', 'autoScheduling', !get('smartPreferences', 'autoScheduling'))} />}
        />
        <SettingRow
          icon={Focus} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Focus Mode" subtitle="Block distractions while working"
          right={<ToggleSwitch checked={get('smartPreferences', 'focusMode')} onChange={() => set('smartPreferences', 'focusMode', !get('smartPreferences', 'focusMode'))} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={SunMoon} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Adaptive Theme" subtitle="Auto switch based on time of day"
          right={<ToggleSwitch checked={get('smartPreferences', 'adaptiveTheme')} onChange={() => set('smartPreferences', 'adaptiveTheme', !get('smartPreferences', 'adaptiveTheme'))} accentColor="#10b981" />}
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
          subtitle={`Currently: ${get('appearance', 'themeMode') === 'system' ? 'System' : get('appearance', 'themeMode') === 'dark' ? 'Dark' : 'Light'}`}
          right={
            <SegmentedControl
              options={[{ value: 'light', label: '☀️' }, { value: 'dark', label: '🌙' }, { value: 'system', label: '💻' }]}
              value={get('appearance', 'themeMode')}
              onChange={handleThemeChange}
            />
          }
        />
        <div style={{ padding: '0.9rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(236,72,153,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Palette size={20} color="#ec4899" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Accent Color</h4>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Personalize your theme</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', paddingLeft: '52px' }}>
            {ACCENT_COLORS.map(c => (
              <ColorDot key={c.value} color={c.value} active={get('appearance', 'accentColor') === c.value} onClick={() => handleAccentChange(c.value)} />
            ))}
          </div>
        </div>
        <SettingRow
          icon={Type} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
          title="Font Size"
          right={
            <SegmentedControl
              options={[{ value: 'small', label: 'S' }, { value: 'medium', label: 'M' }, { value: 'large', label: 'L' }]}
              value={get('appearance', 'fontSize')}
              onChange={(v) => set('appearance', 'fontSize', v)}
            />
          }
        />
        <SettingRow
          icon={LayoutGrid} iconColor="#14b8a6" iconBg="rgba(20,184,166,0.12)"
          title="Layout Density"
          right={
            <SegmentedControl
              options={[{ value: 'compact', label: 'Tight' }, { value: 'comfortable', label: 'Relaxed' }]}
              value={get('appearance', 'layoutDensity')}
              onChange={(v) => set('appearance', 'layoutDensity', v)}
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
          right={<ToggleSwitch checked={get('notifications', 'taskReminders')} onChange={() => set('notifications', 'taskReminders', !get('notifications', 'taskReminders'))} accentColor="#f43f5e" />}
        />
        <SettingRow
          icon={Clock} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Reminder Lead Time"
          right={
            <SegmentedControl
              options={[{ value: '5', label: '5m' }, { value: '10', label: '10m' }, { value: '30', label: '30m' }]}
              value={get('notifications', 'reminderTime')}
              onChange={(v) => set('notifications', 'reminderTime', v)}
            />
          }
        />
        <SettingRow
          icon={BarChart3} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Daily Summary" subtitle="Morning & evening digest"
          right={<ToggleSwitch checked={get('notifications', 'dailySummary')} onChange={() => set('notifications', 'dailySummary', !get('notifications', 'dailySummary'))} accentColor="#8b5cf6" />}
        />
        <SettingRow
          icon={Sparkles} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Smart Notifications" subtitle="Only important alerts"
          right={<ToggleSwitch checked={get('notifications', 'smartNotifications')} onChange={() => set('notifications', 'smartNotifications', !get('notifications', 'smartNotifications'))} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={Volume2} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Notification Sound"
          right={<ToggleSwitch checked={get('notifications', 'sound')} onChange={() => set('notifications', 'sound', !get('notifications', 'sound'))} accentColor="#10b981" />}
        />
        <SettingRow
          icon={BellOff} iconColor="#94a3b8" iconBg="rgba(148,163,184,0.12)"
          title="Snooze Notifications" subtitle="Delay alerts temporarily"
          right={<ToggleSwitch checked={get('notifications', 'snooze')} onChange={() => set('notifications', 'snooze', !get('notifications', 'snooze'))} />}
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
              value={get('productivity', 'dailyGoal')}
              onChange={(v) => set('productivity', 'dailyGoal', v)}
            />
          }
        />
        <SettingRow
          icon={Flame} iconColor="#f43f5e" iconBg="rgba(244,63,94,0.12)"
          title="Streak Tracking" subtitle="Track consecutive productive days"
          right={<ToggleSwitch checked={get('productivity', 'streakTracking')} onChange={() => set('productivity', 'streakTracking', !get('productivity', 'streakTracking'))} accentColor="#f43f5e" />}
        />
        <SettingRow
          icon={Lightbulb} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Auto-Complete Suggestions" subtitle="AI-powered task completion hints"
          right={<ToggleSwitch checked={get('productivity', 'autoComplete')} onChange={() => set('productivity', 'autoComplete', !get('productivity', 'autoComplete'))} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={Timer} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Focus Timer" subtitle="Pomodoro-style work sessions"
          right={<ToggleSwitch checked={get('productivity', 'focusTimer')} onChange={() => set('productivity', 'focusTimer', !get('productivity', 'focusTimer'))} accentColor="#10b981" />}
        />
        <SettingRow
          icon={Clock} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Default Task Duration"
          right={
            <SegmentedControl
              options={[{ value: '15', label: '15m' }, { value: '30', label: '30m' }, { value: '60', label: '1h' }]}
              value={get('productivity', 'defaultDuration')}
              onChange={(v) => set('productivity', 'defaultDuration', v)}
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
          icon={Cloud}
          iconColor={get('analytics', 'cloudSync') ? '#22c55e' : '#94a3b8'}
          iconBg={get('analytics', 'cloudSync') ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)'}
          title="Cloud Sync" subtitle={get('analytics', 'cloudSync') ? 'Connected & syncing' : 'Sync disabled'}
          right={<ToggleSwitch checked={get('analytics', 'cloudSync')} onChange={() => set('analytics', 'cloudSync', !get('analytics', 'cloudSync'))} accentColor="#22c55e" />}
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
          title="Two-Factor Authentication" subtitle={get('security', 'twoFactor') ? 'Enabled' : 'Disabled'}
          right={<ToggleSwitch checked={get('security', 'twoFactor')} onChange={() => { set('security', 'twoFactor', !get('security', 'twoFactor'), get('security', 'twoFactor') ? '2FA disabled' : '2FA enabled'); }} accentColor="#8b5cf6" />}
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
              value={get('accessibility', 'language')}
              onChange={(v) => set('accessibility', 'language', v, `Language set to ${v === 'en' ? 'English' : 'Hindi'}`)}
            />
          }
        />
        <SettingRow
          icon={Accessibility} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
          title="Font Accessibility" subtitle="Larger text for readability"
          right={
            <SegmentedControl
              options={[{ value: 'small', label: 'A' }, { value: 'medium', label: 'A' }, { value: 'large', label: 'A' }]}
              value={get('appearance', 'fontSize')}
              onChange={(v) => set('appearance', 'fontSize', v)}
            />
          }
        />
        <SettingRow
          icon={Contrast} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="High Contrast Mode" subtitle="Improved visibility"
          right={<ToggleSwitch checked={get('accessibility', 'highContrast')} onChange={() => set('accessibility', 'highContrast', !get('accessibility', 'highContrast'))} accentColor="#f59e0b" />}
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
          right={<ToggleSwitch checked={get('privacy', 'dataSharing')} onChange={() => set('privacy', 'dataSharing', !get('privacy', 'dataSharing'))} />}
        />
        <SettingRow
          icon={Trash2} iconColor="var(--danger)" iconBg="var(--danger-light)"
          title="Delete Account" subtitle="Permanently remove all data" danger
          onClick={() => showToast('Account deletion requires confirmation via email')}
          last
        />
      </SectionCard>

      {/* ─── 10. Sound & Feedback ─────────────────────────────── */}
      <SectionCard title="Sound & Feedback" icon={Volume2} defaultOpen={false}>
        <SettingRow
          icon={get('notifications', 'sound') ? Volume2 : VolumeX}
          iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.12)"
          title="Notification Sound"
          right={<ToggleSwitch checked={get('notifications', 'sound')} onChange={() => set('notifications', 'sound', !get('notifications', 'sound'))} accentColor="#0ea5e9" />}
        />
        <SettingRow
          icon={Vibrate} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Vibration"
          right={<ToggleSwitch checked={get('soundFeedback', 'vibration')} onChange={() => set('soundFeedback', 'vibration', !get('soundFeedback', 'vibration'))} accentColor="#f59e0b" />}
        />
        <SettingRow
          icon={SmartphoneNfc} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)"
          title="Haptic Feedback" subtitle="Tactile response on interactions"
          right={<ToggleSwitch checked={get('soundFeedback', 'hapticFeedback')} onChange={() => set('soundFeedback', 'hapticFeedback', !get('soundFeedback', 'hapticFeedback'))} accentColor="#8b5cf6" />}
          last
        />
      </SectionCard>

      {/* ─── 11. Session ──────────────────────────────────────── */}
      <SectionCard title="Session" icon={LogOut} defaultOpen={true}>
        <SettingRow
          icon={RotateCcw} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
          title="Reset All Settings" subtitle="Restore factory defaults"
          onClick={handleResetSettings}
        />
        <SettingRow
          icon={LogOut} iconColor="var(--danger)" iconBg="var(--danger-light)"
          title="Logout" subtitle="Sign out of this device" danger
          onClick={handleLogout}
        />
        <SettingRow
          icon={LogOutIcon} iconColor="var(--danger)" iconBg="var(--danger-light)"
          title="Logout All Devices" subtitle="End all active sessions" danger
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

      {/* ─── Toast Notification ───────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-solid)', color: 'var(--text-primary)',
          padding: '0.75rem 1.5rem', borderRadius: '14px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25), 0 0 0 1px var(--border-color)',
          zIndex: 5000, animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.88rem', fontWeight: 600, backdropFilter: 'blur(20px)',
          fontFamily: 'var(--font-body)', maxWidth: '90vw', whiteSpace: 'nowrap',
        }}>
          <Check size={16} color="var(--accent-primary)" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default SettingsView;
