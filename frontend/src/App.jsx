import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import NotificationPopup from './components/NotificationPopup';
import { NotificationProvider } from './context/NotificationContext';
import { Menu, Loader2, ArrowRight } from 'lucide-react';

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

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const [activeView, setActiveView] = useState(localStorage.getItem('activeView') || 'dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

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

  if (!token) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
        <AuthView />
      </Suspense>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView setActiveView={setActiveView} />;
      case 'tasks': return <TasksView />;
      case 'habits': return <HabitsView />;
      case 'health': return <HealthView />;
      case 'calendar': return <CalendarView />;
      case 'reminders': return <RemindersView />;
      case 'profile': return <ProfileView theme={theme} setTheme={setTheme} />;
      default: return <DashboardView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className={`app-container ${theme}`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <main className="main-content">
        <button className="mobile-only-flex btn-icon-only mb-4" onClick={() => setIsMobileOpen(true)}>
          <Menu size={24} />
        </button>
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
          </div>
        }>
          {renderView()}
        </Suspense>
      </main>
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
