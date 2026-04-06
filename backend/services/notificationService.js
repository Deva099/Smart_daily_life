import cron from 'node-cron';
import mongoose from 'mongoose';
import Habit from '../models/Habit.js';
import Task from '../models/Task.js';

// Internal Notification Store for React Polling
export let activeNotifications = [];

export const clearNotification = (id) => {
  activeNotifications = activeNotifications.filter(n => n.id !== id);
};

export const startNotificationEngine = () => {
  cron.schedule('* * * * *', async () => {
    // Skip tick if MongoDB is not connected (readyState 1 = connected)
    if (mongoose.connection.readyState !== 1) {
      console.log('[Notification Engine] Skipping tick — DB not connected.');
      return;
    }

    try {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeString = `${currentHours}:${currentMinutes}`;
      
      console.log(`[Notification Engine] Running tick at ${timeString}`);

      // 1. Check Habits scheduled for this exact minute
      const habits = await Habit.find({ time: timeString, completed: false });
      habits.forEach(habit => {
        activeNotifications.push({
          id: `h_${habit._id}_${Date.now()}`,
          title: habit.title,
          type: 'habit',
          description: `Reminder: It's time for your habit - ${habit.title}`,
          timestamp: new Date()
        });
        console.log(`[Notification] 🔔 Triggered Habit Alert: ${habit.title}`);
      });

      // 2. Check Tasks scheduled for this exact minute
      const tasks = await Task.find({ deadline: timeString, completed: false });
      tasks.forEach(task => {
        activeNotifications.push({
          id: `t_${task._id}_${Date.now()}`,
          title: task.title,
          type: 'task',
          description: `Deadline Approaching: Your task ${task.title} is due!`,
          timestamp: new Date()
        });
        console.log(`[Notification] 🔔 Triggered Task Alert: ${task.title}`);
      });

      // 3. Smart Logic: Morning Summary (08:00)
      if (timeString === '08:00') {
         const pendingTasks = await Task.countDocuments({ completed: false });
         activeNotifications.push({
            id: `smart_morning_${Date.now()}`,
            title: 'Good Morning! 👋',
            type: 'system',
            description: `You have ${pendingTasks} tasks scheduled for today. Let's get started!`,
            timestamp: new Date()
         });
      }

      // 4. Smart Logic: Night Reminder (20:00)
      if (timeString === '20:00') {
         const pendingTasks = await Task.countDocuments({ completed: false });
         if (pendingTasks > 0) {
           activeNotifications.push({
              id: `smart_night_${Date.now()}`,
              title: 'Evening Reminder 🌙',
              type: 'system',
              description: `You still have ${pendingTasks} pending tasks. Will you finish them or move them to tomorrow?`,
              timestamp: new Date()
           });
         }
      }

      // Clean up old notifications (older than 1 hr)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      activeNotifications = activeNotifications.filter(n => n.timestamp >= oneHourAgo);

    } catch (error) {
      console.error('[Notification Engine Error]', error.message);
    }
  });

  console.log('✅ Smart Notification Engine initialized. Running every minute.');
};
