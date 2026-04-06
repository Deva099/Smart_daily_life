import React from 'react';
import { Home, CheckSquare, Target, Calendar, Activity, User } from 'lucide-react';

const BottomNav = ({ activeView, setActiveView, isVisible }) => {
  if (!isVisible) return null;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'calendar', label: 'Cal', icon: Calendar },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'profile', label: 'Me', icon: User }
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
            style={{ color: isActive ? 'var(--accent-primary)' : undefined }}
          >
            <div className="icon-wrapper">
              <Icon
                size={20}
                color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
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
