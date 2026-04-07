import express from 'express';
import { getTasks, addTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { getHabits, addHabit, updateHabit, deleteHabit } from '../controllers/habitController.js';
import { getHealthData, upsertHealthData } from '../controllers/healthController.js';
import { getNotes, addNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { getGoals, addGoal, deleteGoal, updateGoal } from '../controllers/goalController.js';
import { getExpenses, addExpense, deleteExpense } from '../controllers/expenseController.js';
import { signup, login, checkEmail, forgotPassword, verifyOtp, resetPassword, forgotUsername, getProfile, refresh, updateProfilePic } from '../controllers/authController.js';
import { getSettings, updateSettings, resetSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { activeNotifications, clearNotification } from '../services/notificationService.js';

const router = express.Router();

// --- Public Routes ---
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/check-email', checkEmail);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/forgot-username', forgotUsername);
router.put('/auth/profile-pic', protect, updateProfilePic);
router.get('/auth/profile', protect, getProfile);

// --- Protected Routes ---

// Notifications
router.get('/notifications', protect, (req, res) => res.json(activeNotifications));
router.delete('/notifications/:id', protect, (req, res) => {
  clearNotification(req.params.id);
  res.json({ message: 'Notification cleared' });
});

// Tasks
router.route('/tasks').get(protect, getTasks).post(protect, addTask);
router.route('/tasks/:id').put(protect, updateTask).delete(protect, deleteTask);

// Habits
router.route('/habits').get(protect, getHabits).post(protect, addHabit);
router.route('/habits/:id').put(protect, updateHabit).delete(protect, deleteHabit);

// Health
router.route('/health/:dateStr').get(protect, getHealthData).put(protect, upsertHealthData);

// Notes
router.route('/notes').get(protect, getNotes).post(protect, addNote);
router.route('/notes/:id').put(protect, updateNote).delete(protect, deleteNote);

// Goals
router.route('/goals').get(protect, getGoals).post(protect, addGoal);
router.route('/goals/:id').put(protect, updateGoal).delete(protect, deleteGoal);

// Expenses
router.route('/expenses').get(protect, getExpenses).post(protect, addExpense);
router.route('/expenses/:id').delete(protect, deleteExpense);

// Settings
router.route('/settings').get(protect, getSettings).put(protect, updateSettings);
router.post('/settings/reset', protect, resetSettings);

export default router;
