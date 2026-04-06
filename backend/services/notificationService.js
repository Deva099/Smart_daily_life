import cron from 'node-cron';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';

// Configuration for checking intervals
const RECHECK_INTERVAL = '*/5 * * * *'; // Every 5 minutes

export const startNotificationEngine = () => {
  console.log('🚀 Notification Engine: Initializing...');

  cron.schedule(RECHECK_INTERVAL, async () => {
    try {
      // 1. Safety Check: Database Connection
      if (mongoose.connection.readyState !== 1) {
        return console.log('⚠️ Notification Engine: DB not ready, skipping sync.');
      }

      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const todayDateStr = now.toISOString().split('T')[0];

      // 2. Process Task Reminders
      const tasksToNotify = await Task.find({
        hasReminder: true,
        notified: false,
        reminderTime: currentTime,
        dateStr: todayDateStr
      });

      for (const task of tasksToNotify) {
        console.log(`🔔 NOTIFICATION: Task "${task.title}" is due now!`);
        task.notified = true;
        await task.save();
      }

      // 3. Process Habit Reminders 
      const habitsToNotify = await Habit.find({
        time: currentTime
      });

      for (const habit of habitsToNotify) {
        console.log(`🔔 NOTIFICATION: Habit "${habit.title}" time reached!`);
      }

    } catch (error) {
      console.error('❌ Notification Engine Error:', error.message);
    }
  });

  console.log(`✅ Notification Engine: Running (Sync: ${RECHECK_INTERVAL})`);
};
