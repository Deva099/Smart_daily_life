import cron from 'node-cron';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';

// In-memory store for active notifications (frontend polls /api/notifications)
export const activeNotifications = [];

export const clearNotification = (id) => {
  const index = activeNotifications.findIndex(n => n.id === id);
  if (index !== -1) activeNotifications.splice(index, 1);
};

const addNotification = (message, type = 'reminder') => {
  activeNotifications.push({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    message,
    type,
    time: new Date().toISOString()
  });
  // Keep only the last 20 notifications in memory
  if (activeNotifications.length > 20) activeNotifications.shift();
};

const RECHECK_INTERVAL = '*/5 * * * *'; // Every 5 minutes

export const startNotificationEngine = () => {
  console.log('🚀 Notification Engine: Initializing...');

  cron.schedule(RECHECK_INTERVAL, async () => {
    try {
      // Safety Check: Only run if database is connected
      if (mongoose.connection.readyState !== 1) {
        return console.log('⚠️ Notification Engine: DB not ready, skipping sync.');
      }

      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const todayDateStr = now.toISOString().split('T')[0];

      // Process Task Reminders
      const tasksToNotify = await Task.find({
        hasReminder: true,
        notified: false,
        reminderTime: currentTime,
        dateStr: todayDateStr
      });

      for (const task of tasksToNotify) {
        const msg = `⏰ Task reminder: "${task.title}" is due now!`;
        console.log(`🔔 ${msg}`);
        addNotification(msg, 'task');
        task.notified = true;
        await task.save();
      }

      // Process Habit Reminders 
      const habitsToNotify = await Habit.find({ time: currentTime });

      for (const habit of habitsToNotify) {
        const msg = `💪 Habit time: "${habit.title}" — let's go!`;
        console.log(`🔔 ${msg}`);
        addNotification(msg, 'habit');
      }

    } catch (error) {
      console.error('❌ Notification Engine Error:', error.message);
    }
  });

  console.log(`✅ Notification Engine: Running (every 5 min)`);
};
