import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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

  // Poll Backend Notification Engine
  useEffect(() => {
    const pollBackendNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/notifications');
        const data = await response.json();
        
        if (data && data.length > 0) {
          data.forEach(async (notif) => {
            setActiveAlerts(prev => {
              if (!prev.find(a => a.id === notif.id)) {
                if (audioRef.current) audioRef.current.play().catch(()=>{});
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
                
                // Fire and forget delete so the backend clears it from buffer
                fetch(`http://localhost:5001/api/notifications/${notif.id}`, { method: 'DELETE' }).catch(console.error);
                
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

  const dismissAlert = (id) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const snoozeAlert = (id, minutes) => {
    // Dismiss locally for now. A robust backend would reschedule this entirely.
    dismissAlert(id);
  };
  
  // Stubs for RemindersView backwards compability
  const [reminders, setReminders] = useState([]);
  const addReminder = () => {};
  const toggleReminder = () => {};
  const deleteReminder = () => {};

  return (
    <NotificationContext.Provider value={{
      activeAlerts, dismissAlert, snoozeAlert,
      reminders, addReminder, toggleReminder, deleteReminder
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
