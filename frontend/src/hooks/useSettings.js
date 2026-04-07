import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSettings, updateSettingsAPI, resetSettingsAPI } from '../services/api';

const CACHE_KEY = 'smartlife_settings';

// Default settings — mirrors backend schema defaults
const DEFAULT_SETTINGS = {
  smartPreferences: { smartReminders: true, autoScheduling: false, focusMode: false, adaptiveTheme: false },
  appearance: { themeMode: 'dark', accentColor: '#6366f1', fontSize: 'medium', layoutDensity: 'comfortable' },
  notifications: { taskReminders: true, reminderTime: '10', dailySummary: true, smartNotifications: false, sound: true, snooze: false },
  productivity: { dailyGoal: '5', streakTracking: true, autoComplete: true, focusTimer: false, defaultDuration: '30' },
  analytics: { cloudSync: true },
  security: { twoFactor: false },
  accessibility: { language: 'en', highContrast: false },
  soundFeedback: { vibration: true, hapticFeedback: true },
  privacy: { dataSharing: false },
};

/**
 * useSettings hook
 * 
 * On mount: loads from localStorage (instant), then syncs from backend.
 * On update: updates React state, writes to localStorage, and debounce-saves to backend.
 */
export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const pendingUpdatesRef = useRef({});

  // ─── Load from backend on mount ────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadFromBackend = async () => {
      try {
        const data = await fetchSettings();
        if (mounted && data) {
          // Extract only settings fields (exclude _id, userId, timestamps)
          const clean = {
            smartPreferences: data.smartPreferences || DEFAULT_SETTINGS.smartPreferences,
            appearance: data.appearance || DEFAULT_SETTINGS.appearance,
            notifications: data.notifications || DEFAULT_SETTINGS.notifications,
            productivity: data.productivity || DEFAULT_SETTINGS.productivity,
            analytics: data.analytics || DEFAULT_SETTINGS.analytics,
            security: data.security || DEFAULT_SETTINGS.security,
            accessibility: data.accessibility || DEFAULT_SETTINGS.accessibility,
            soundFeedback: data.soundFeedback || DEFAULT_SETTINGS.soundFeedback,
            privacy: data.privacy || DEFAULT_SETTINGS.privacy,
          };
          setSettings(clean);
          localStorage.setItem(CACHE_KEY, JSON.stringify(clean));
        }
      } catch (err) {
        console.error('Failed to load settings from backend:', err);
        setError('Failed to sync settings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFromBackend();
    return () => { mounted = false; };
  }, []);

  // ─── Debounced save to backend ─────────────────────────────
  const saveToBackend = useCallback(async (updates) => {
    setSyncing(true);
    setError(null);
    try {
      await updateSettingsAPI(updates);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setSyncing(false);
    }
  }, []);

  /**
   * Update a specific section of settings
   * @param {string} section - e.g. 'appearance', 'notifications'
   * @param {string} key - e.g. 'themeMode', 'sound'
   * @param {any} value - new value
   */
  const updateSetting = useCallback((section, key, value) => {
    // 1. Update React state immediately
    setSettings(prev => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
      // 2. Write to localStorage immediately
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });

    // 3. Accumulate pending updates and debounce backend save
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      [section]: {
        ...(pendingUpdatesRef.current[section] || {}),
        [key]: value
      }
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updates = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};
      saveToBackend(updates);
    }, 800);
  }, [saveToBackend]);

  /**
   * Reset all settings to defaults
   */
  const resetAllSettings = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const data = await resetSettingsAPI();
      const clean = {
        smartPreferences: data.smartPreferences || DEFAULT_SETTINGS.smartPreferences,
        appearance: data.appearance || DEFAULT_SETTINGS.appearance,
        notifications: data.notifications || DEFAULT_SETTINGS.notifications,
        productivity: data.productivity || DEFAULT_SETTINGS.productivity,
        analytics: data.analytics || DEFAULT_SETTINGS.analytics,
        security: data.security || DEFAULT_SETTINGS.security,
        accessibility: data.accessibility || DEFAULT_SETTINGS.accessibility,
        soundFeedback: data.soundFeedback || DEFAULT_SETTINGS.soundFeedback,
        privacy: data.privacy || DEFAULT_SETTINGS.privacy,
      };
      setSettings(clean);
      localStorage.setItem(CACHE_KEY, JSON.stringify(clean));
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Failed to reset settings');
    } finally {
      setSyncing(false);
    }
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    settings,
    loading,
    syncing,
    lastSaved,
    error,
    updateSetting,
    resetAllSettings,
  };
};

export default useSettings;
