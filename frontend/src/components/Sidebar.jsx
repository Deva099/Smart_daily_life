import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, Activity, HeartPulse, User, Bell, Calendar, X, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Activity },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'reminders', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div 
          className="logo" 
          onClick={() => { setActiveView('dashboard'); setIsMobileOpen(false); }} 
        >
          <div className="logo-icon">
            <LayoutDashboard size={isExpanded ? 24 : 20} color="var(--accent-primary)" />
          </div>
          <span className="sidebar-brand">SmartLife</span>
        </div>
        
        {/* Toggle Button for Desktop */}
        <button 
          className="btn-icon-only toggle-sidebar-btn desktop-only-flex" 
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Close sidebar" : "Open sidebar"}
        >
          {isExpanded ? <PanelLeftClose size={22} /> : <PanelLeft size={22} />}
        </button>

        {/* Close Button for Mobile Drawer */}
        <button className="btn-icon-only close-sidebar-btn mobile-only-flex" onClick={() => setIsMobileOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => { setActiveView(item.id); setIsMobileOpen(false); }}
              aria-label={item.label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
              <span className="sidebar-label">{item.label}</span>
              <span className="custom-tooltip">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
    </aside>
  );
};

export default Sidebar;
