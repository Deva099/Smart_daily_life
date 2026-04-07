import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    } catch(e) {
      console.warn("Audio loading failed", e);
    }
  }, []);

  // Read sound/vibration prefs from localStorage settings cache
  const getNotifPrefs = () => {
    try {
      const cached = localStorage.getItem('smartlife_settings');
      if (cached) {
        const s = JSON.parse(cached);
        return {
          sound: s?.notifications?.sound !== false,
          vibration: s?.soundFeedback?.vibration !== false,
          haptic: s?.soundFeedback?.hapticFeedback !== false,
        };
      }
    } catch {}
    return { sound: true, vibration: true, haptic: true };
  };

  // Poll Backend Notification Engine
  useEffect(() => {
    const pollBackendNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const prefs = getNotifPrefs();
          
          data.forEach(async (notif) => {
            setActiveAlerts(prev => {
              if (!prev.find(a => a.id === notif.id)) {
                // Respect sound setting
                if (prefs.sound && audioRef.current) {
                  audioRef.current.play().catch(()=>{});
                }
                // Respect vibration setting
                if (prefs.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([200, 100, 200]);
                }
                
                // Fire and forget delete so the backend clears it from buffer
                fetch(`${API_URL}/notifications/${notif.id}`, { method: 'DELETE' }).catch(console.error);
                
                return [...prev, notif];
              }
              return prev;
            });
          });
        }
      } catch (err) {
        console.error("Notification Polling Error:", err.message);
      }
    };

    const interval = setInterval(pollBackendNotifications, 10000); 
    pollBackendNotifications(); // Initial call
    return () => clearInterval(interval);
  }, []);

  const triggerSmartAlert = (title, message, isUrgent = false) => {
    const prefs = getNotifPrefs();
    const id = Date.now();
    const newAlert = {
      id,
      title,
      description: message,
      type: isUrgent ? 'danger' : 'warning',
      timestamp: new Date().toISOString()
    };

    setActiveAlerts(prev => [...prev, newAlert]);
    
    // Respect sound setting
    if (prefs.sound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(()=>{});
    }
    
    // Respect vibration setting
    if (isUrgent && prefs.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 500]);
    }
  };

  const dismissAlert = (id) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const snoozeAlert = (id, minutes) => {
    // Dismiss locally for now. A robust backend would reschedule this entirely.
    dismissAlert(id);
  };
  
  // Stubs for RemindersView backwards compatibility
  const [reminders, setReminders] = useState([]);
  const addReminder = () => {};
  const toggleReminder = () => {};
  const deleteReminder = () => {};

  return (
    <NotificationContext.Provider value={{
      activeAlerts, dismissAlert, snoozeAlert, triggerSmartAlert,
      reminders, addReminder, toggleReminder, deleteReminder
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
