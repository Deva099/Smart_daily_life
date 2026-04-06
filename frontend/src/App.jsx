import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import NotificationPopup from './components/NotificationPopup';
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

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null; // Let AppContent handle splash
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { token, loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    <Router>
      <div className={`app-container ${theme}`}>
        {token && (
          <Sidebar 
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        )}
        
        <main className={token ? "main-content" : "auth-content"}>
          {token && (
            <button className="mobile-only-flex btn-icon-only mb-4" onClick={() => setIsMobileOpen(true)}>
              <Menu size={24} />
            </button>
          )}

          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
          }>
            <Routes>
              <Route path="/auth" element={!token ? <AuthView /> : <Navigate to="/" />} />
              
              <Route path="/" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><TasksView /></ProtectedRoute>} />
              <Route path="/habits" element={<ProtectedRoute><HabitsView /></ProtectedRoute>} />
              <Route path="/health" element={<ProtectedRoute><HealthView /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileView theme={theme} setTheme={setTheme} /></ProtectedRoute>} />
              <Route path="/assistant" element={<ProtectedRoute><AssistantView /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <NotificationPopup />
      </div>
    </Router>
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
