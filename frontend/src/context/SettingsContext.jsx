import React, { createContext, useContext, useEffect } from 'react';
import useSettings from '../hooks/useSettings';

const SettingsContext = createContext(null);

export const useSettingsContext = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Return safe defaults when called outside provider (e.g. auth page)
    return {
      settings: null,
      loading: true,
      syncing: false,
      error: null,
      lastSaved: null,
      updateSetting: () => {},
      resetAllSettings: () => {},
      getSetting: () => undefined,
    };
  }
  return ctx;
};

/**
 * SettingsProvider
 * 
 * Wraps the entire authenticated app. On mount it:
 * 1. Loads settings via useSettings (localStorage first, then backend)
 * 2. Applies accent color to CSS custom properties
 * 3. Applies font size class to <html>
 * 4. Applies high contrast class if enabled
 * 5. Exposes settings and helpers to entire component tree
 */
export const SettingsProvider = ({ children }) => {
  const hook = useSettings();
  const { settings, loading } = hook;

  // ─── Apply accent color to CSS variables whenever it changes ─────
  useEffect(() => {
    if (!settings?.appearance?.accentColor) return;
    const color = settings.appearance.accentColor;
    const root = document.documentElement;

    root.style.setProperty('--accent-primary', color);
    // Generate hover and light variants from the accent
    root.style.setProperty('--accent-primary-light', `${color}20`);
    root.style.setProperty('--accent-primary-hover', color);
  }, [settings?.appearance?.accentColor]);

  // ─── Apply font size class to <html> ─────────────────────────────
  useEffect(() => {
    if (!settings?.appearance?.fontSize) return;
    const html = document.documentElement;
    html.classList.remove('font-small', 'font-medium', 'font-large');
    html.classList.add(`font-${settings.appearance.fontSize}`);
  }, [settings?.appearance?.fontSize]);

  // ─── Apply high contrast mode ────────────────────────────────────
  useEffect(() => {
    if (settings?.accessibility?.highContrast === undefined) return;
    const html = document.documentElement;
    if (settings.accessibility.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
  }, [settings?.accessibility?.highContrast]);

  // ─── Apply layout density ────────────────────────────────────────
  useEffect(() => {
    if (!settings?.appearance?.layoutDensity) return;
    const html = document.documentElement;
    html.classList.remove('density-compact', 'density-comfortable');
    html.classList.add(`density-${settings.appearance.layoutDensity}`);
  }, [settings?.appearance?.layoutDensity]);

  // Convenience helper
  const getSetting = (section, key) => settings?.[section]?.[key];

  const value = {
    ...hook,
    getSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
