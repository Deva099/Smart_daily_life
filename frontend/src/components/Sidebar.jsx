import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Activity, HeartPulse, User, Bell, Calendar, X, PanelLeftClose, PanelLeft } from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { id: 'dashboard', path: '/', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', path: '/habits', label: 'Habits', icon: Activity },
    { id: 'calendar', path: '/calendar', label: 'Calendar', icon: Calendar },
    { id: 'health', path: '/health', label: 'Health', icon: HeartPulse },
    { id: 'profile', path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <NavLink 
          to="/" 
          className="logo" 
          onClick={() => setIsMobileOpen(false)} 
        >
          <div className="logo-icon">
            <LayoutDashboard size={isExpanded ? 24 : 20} color="var(--accent-primary)" />
          </div>
          <span className="sidebar-brand">SmartLife</span>
        </NavLink>
        
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
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
              aria-label={item.label}
            >
              <Icon size={22} style={{ flexShrink: 0 }} />
              <span className="sidebar-label">{item.label}</span>
              <span className="custom-tooltip">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
    </aside>
  );
};

export default Sidebar;
