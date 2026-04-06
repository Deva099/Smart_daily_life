import Task from '../models/Task.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const addTask = async (req, res, next) => {
  try {
    const { title, priority, deadline, dateStr, hasReminder, reminderTime, notified } = req.body;
    if (!title || !title.trim()) {
      res.status(400);
      return next(new Error('Task title is required'));
    }
    
    const task = await Task.create({ 
      userId: req.user._id, 
      title: title.trim(), 
      priority: priority || 'Medium', 
      deadline,
      dateStr,
      hasReminder,
      reminderTime,
      notified
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      res.status(404);
      return next(new Error('Task not found or unauthorized'));
    }
    
    if (req.body.title) task.title = req.body.title;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.deadline !== undefined) task.deadline = req.body.deadline;
    if (req.body.completed !== undefined) task.completed = req.body.completed;
    if (req.body.dateStr) task.dateStr = req.body.dateStr;
    if (req.body.hasReminder !== undefined) task.hasReminder = req.body.hasReminder;
    if (req.body.reminderTime !== undefined) task.reminderTime = req.body.reminderTime;
    if (req.body.notified !== undefined) task.notified = req.body.notified;
    
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      res.status(404);
      return next(new Error('Task not found or unauthorized'));
    }
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    next(error);
  }
};
