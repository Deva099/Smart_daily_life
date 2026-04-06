import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import NotificationPopup from './components/NotificationPopup';
import { Menu, Loader2, ArrowRight, LayoutGrid } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null; // Let AppContent handle splash
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
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
        <div className="app-container">
          <Sidebar 
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
          
          <main className="main-content">
            {/* Mobile Header - Visible only on mobile */}
            <div className="mobile-header mobile-only-flex">
              <div className="mobile-logo">
                <div className="logo-icon" style={{ background: 'var(--accent-primary-light)', padding: '0.4rem', borderRadius: '10px' }}>
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
      )}
      <NotificationPopup />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
