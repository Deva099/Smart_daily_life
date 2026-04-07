import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { SettingsProvider, useSettingsContext } from './context/SettingsContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import NotificationPopup from './components/NotificationPopup';
import { Menu, Loader2, ArrowRight, LayoutGrid } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTasks } from './services/api';

// Lazy load views
const DashboardView = lazy(() => import('./pages/DashboardView'));
const TasksView = lazy(() => import('./pages/TasksView'));
const HabitsView = lazy(() => import('./pages/HabitsView'));
const HealthView = lazy(() => import('./pages/HealthView'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const RemindersView = lazy(() => import('./pages/RemindersView'));
const ProfileView = lazy(() => import('./pages/ProfileView'));
const AuthView = lazy(() => import('./pages/AuthView'));
const AssistantView = lazy(() => import('./pages/AssistantView'));
const SettingsView = lazy(() => import('./pages/SettingsView'));

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null; // Let AppContent handle splash
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

/**
 * TaskReminderManager
 * Now respects user notification settings:
 * - taskReminders toggle (on/off)
 * - reminderTime setting (5/10/30 min lead time)
 * - sound and vibration preferences
 */
const TaskReminderManager = () => {
    const { token } = useAuth();
    const { triggerSmartAlert } = useNotifications();
    const { getSetting } = useSettingsContext();
    const notifiedRef = useRef(new Set());

    useEffect(() => {
        if (!token) return;

        // Check if reminders are enabled
        const taskRemindersEnabled = getSetting('notifications', 'taskReminders');
        if (taskRemindersEnabled === false) return;

        const reminderLeadTime = parseInt(getSetting('notifications', 'reminderTime') || '10', 10);

        const checkDeadlines = async () => {
            try {
                const tasks = await fetchTasks();
                if (!Array.isArray(tasks)) return;
                
                const now = new Date();
                
                tasks.forEach(task => {
                    if (task.completed || !task.deadlineISO) return;
                    
                    const deadline = new Date(task.deadlineISO);
                    const diffMs = deadline - now;
                    const diffMins = Math.floor(diffMs / 60000);

                    // Dynamic reminder based on user setting (5/10/30 min)
                    if (diffMins === reminderLeadTime && !notifiedRef.current.has(`${task._id}-lead`)) {
                        triggerSmartAlert(
                            `⏰ ${reminderLeadTime}-Min Reminder`, 
                            `Task: "${task.title}" is due in ${reminderLeadTime} minutes. Time to wrap up!`
                        );
                        notifiedRef.current.add(`${task._id}-lead`);
                    }

                    // 1-minute/Deadline Alert (always fires if reminders are on)
                    if (diffMins >= 0 && diffMins <= 1 && !notifiedRef.current.has(`${task._id}-1min`)) {
                        const countdownMsg = diffMins === 0 ? "EXPIRED" : `${diffMins} min left`;
                        triggerSmartAlert(
                            "⚠️ DEADLINE ALERT", 
                            `Task "${task.title}" is not completed! Only ${countdownMsg}. Please complete ASAP.`,
                            true
                        );
                        notifiedRef.current.add(`${task._id}-1min`);
                    }
                });
            } catch (e) {
                console.error("Reminder check failed", e);
            }
        };

        const interval = setInterval(checkDeadlines, 30000); // Check every 30s
        checkDeadlines();
        return () => clearInterval(interval);
    }, [token, triggerSmartAlert, getSetting]);

    return null;
};

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const userName = user?.name || 'User';
  const initial = userName.charAt(0).toUpperCase();

  // Helper to determine active view for BottomNav
  const getActiveView = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/')) return path.substring(1);
    return 'dashboard';
  };

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="logo-icon animate-pulse-slow" style={{ width: '80px', height: '80px', marginBottom: '1.5rem' }}>
          <ArrowRight size={40} color="var(--accent-primary)" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>SmartLife</h1>
        <p style={{ color: 'var(--text-muted)' }}>Setting up your workspace...</p>
      </div>
    );
  }

  return (
    <div className={`app-wrapper ${theme}`}>
      {!token ? (
        <main className="auth-content">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
          }>
            <Routes>
              <Route path="/auth" element={<AuthView />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Suspense>
        </main>
      ) : (
        <SettingsProvider>
          <div className="app-container">
            {/* Sidebar - Visible ONLY on Desktop */}
            <div className="desktop-only-flex">
              <Sidebar 
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />
            </div>
            
            <main className="main-content">
              {/* Mobile Header - Visible only on mobile */}
              <div className="mobile-header mobile-only-flex">
                <div className="mobile-logo">
                  <div className="logo-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '0.4rem', borderRadius: '12px' }}>
                    <LayoutGrid size={24} color="var(--accent-primary)" />
                  </div>
                  <span>SmartLife</span>
                </div>
                <div 
                  className="mobile-avatar" 
                  onClick={() => navigate('/profile')}
                  style={{ 
                    background: user?.profilePic ? `url(${user.profilePic}) center/cover` : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'white'
                  }}
                >
                  {!user?.profilePic && initial}
                </div>
              </div>

              <Suspense fallback={
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<DashboardView />} />
                  <Route path="/tasks" element={<TasksView />} />
                  <Route path="/habits" element={<HabitsView />} />
                  <Route path="/health" element={<HealthView />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/profile" element={<ProfileView theme={theme} setTheme={setTheme} />} />
                  <Route path="/settings" element={<SettingsView theme={theme} setTheme={setTheme} />} />
                  <Route path="/assistant" element={<AssistantView />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            <BottomNav 
              activeView={getActiveView()} 
              setActiveView={(id) => navigate(id === 'dashboard' ? '/' : `/${id}`)}
              isVisible={true} 
            />
          </div>
          <TaskReminderManager />
        </SettingsProvider>
      )}
      <NotificationPopup />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
