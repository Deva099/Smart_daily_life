import React from 'react';
import { Home, CheckSquare, Target, Calendar, Activity, User } from 'lucide-react';

const BottomNav = ({ activeView, setActiveView, isVisible }) => {
  if (!isVisible) return null;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'habits', label: 'Habits', icon: Target, path: '/habits' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 'health', label: 'Health', icon: Activity, path: '/health' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <nav className="bottom-nav mobile-only-flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`nav-item-bottom ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <Icon size={22} className={isActive ? 'text-accent' : ''} />
              {isActive && <div className="active-dot" />}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
