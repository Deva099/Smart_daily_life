import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // ─── Smart Preferences ──────────────────────────────────────
  smartPreferences: {
    smartReminders: { type: Boolean, default: true },
    autoScheduling: { type: Boolean, default: false },
    focusMode: { type: Boolean, default: false },
    adaptiveTheme: { type: Boolean, default: false },
  },

  // ─── Appearance ─────────────────────────────────────────────
  appearance: {
    themeMode: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    accentColor: { type: String, default: '#6366f1' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    layoutDensity: { type: String, enum: ['compact', 'comfortable'], default: 'comfortable' },
  },

  // ─── Notifications ──────────────────────────────────────────
  notifications: {
    taskReminders: { type: Boolean, default: true },
    reminderTime: { type: String, enum: ['5', '10', '30'], default: '10' },
    dailySummary: { type: Boolean, default: true },
    smartNotifications: { type: Boolean, default: false },
    sound: { type: Boolean, default: true },
    snooze: { type: Boolean, default: false },
  },

  // ─── Productivity ───────────────────────────────────────────
  productivity: {
    dailyGoal: { type: String, default: '5' },
    streakTracking: { type: Boolean, default: true },
    autoComplete: { type: Boolean, default: true },
    focusTimer: { type: Boolean, default: false },
    defaultDuration: { type: String, enum: ['15', '30', '60'], default: '30' },
  },

  // ─── Analytics ──────────────────────────────────────────────
  analytics: {
    cloudSync: { type: Boolean, default: true },
  },

  // ─── Security ───────────────────────────────────────────────
  security: {
    twoFactor: { type: Boolean, default: false },
  },

  // ─── Language & Accessibility ───────────────────────────────
  accessibility: {
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    highContrast: { type: Boolean, default: false },
  },

  // ─── Sound & Feedback ──────────────────────────────────────
  soundFeedback: {
    vibration: { type: Boolean, default: true },
    hapticFeedback: { type: Boolean, default: true },
  },

  // ─── Privacy ────────────────────────────────────────────────
  privacy: {
    dataSharing: { type: Boolean, default: false },
  },

}, {
  timestamps: true
});

// Static method to get default settings object
settingsSchema.statics.getDefaults = function() {
  return {
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
};

export default mongoose.model('Settings', settingsSchema);
