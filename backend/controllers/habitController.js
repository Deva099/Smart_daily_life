import Habit from '../models/Habit.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all habits for user
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id });
    res.status(200).json({ success: true, data: habits });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new habit
// @route   POST /api/habits
// @access  Private
export const addHabit = async (req, res, next) => {
  try {
    const { title, time, repeat } = req.body;
    
    if (!title || !title.trim()) {
      return next(new ErrorResponse('Habit title is required', 400));
    }
    if (!time) {
      return next(new ErrorResponse('Habit time is required', 400));
    }

    const habit = await Habit.create({
      userId: req.user._id,
      title: title.trim(),
      time,
      repeat: repeat || 'daily'
    });
    
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return next(new ErrorResponse('Habit not found or unauthorized', 404));
    }

    // Update basic fields
    if (req.body.title) habit.title = req.body.title.trim();
    if (req.body.time) habit.time = req.body.time;
    if (req.body.repeat) habit.repeat = req.body.repeat;
    
    // Handle completion and streak logic
    if (req.body.completed !== undefined) {
      const wasCompleted = habit.completed;
      habit.completed = req.body.completed;
      
      if (habit.completed && !wasCompleted) {
        habit.streak += 1;
      } else if (!habit.completed && wasCompleted) {
        habit.streak = Math.max(0, habit.streak - 1);
      }
    }

    const updatedHabit = await habit.save();
    res.status(200).json({ success: true, data: updatedHabit });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return next(new ErrorResponse('Habit not found or unauthorized', 404));
    }
    
    res.status(200).json({ success: true, message: 'Habit removed successfully' });
  } catch (error) {
    next(error);
  }
};
