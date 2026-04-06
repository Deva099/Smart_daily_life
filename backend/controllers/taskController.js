import Task from '../models/Task.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new task
// @route   POST /api/tasks
// @access  Private
export const addTask = async (req, res, next) => {
  try {
    const { title, priority, deadline, dateStr, hasReminder, reminderTime, notified } = req.body;
    
    if (!title || !title.trim()) {
      return next(new ErrorResponse('Task title is required', 400));
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
    
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return next(new ErrorResponse('Task not found or unauthorized', 404));
    }
    
    // Update fields
    const fieldsToUpdate = ['title', 'priority', 'deadline', 'completed', 'dateStr', 'hasReminder', 'reminderTime', 'notified'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = (field === 'title') ? req.body[field].trim() : req.body[field];
      }
    });
    
    const updatedTask = await task.save();
    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return next(new ErrorResponse('Task not found or unauthorized', 404));
    }
    
    res.status(200).json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    next(error);
  }
};
