import Habit from '../models/Habit.js';

export const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id });
    res.json(habits);
  } catch (error) {
    next(error);
  }
};

export const addHabit = async (req, res, next) => {
  try {
    const { title, time, repeat } = req.body;
    if (!title || !title.trim()) {
      res.status(400);
      return next(new Error('Habit title is required'));
    }
    if (!time) {
      res.status(400);
      return next(new Error('Habit time is required'));
    }

    const habit = new Habit({
      userId: req.user._id,
      title: title.trim(),
      time,
      repeat: repeat || 'daily'
    });
    const createdHabit = await habit.save();
    res.status(201).json(createdHabit);
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      res.status(404);
      return next(new Error('Habit not found or unauthorized'));
    }

    if (req.body.title) habit.title = req.body.title;
    if (req.body.time) habit.time = req.body.time;
    if (req.body.repeat) habit.repeat = req.body.repeat;
    
    if (req.body.completed !== undefined) {
      habit.completed = req.body.completed;
      if (habit.completed) {
        habit.streak += 1;
      } else {
        habit.streak = Math.max(0, habit.streak - 1);
      }
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      res.status(404);
      return next(new Error('Habit not found or unauthorized'));
    }
    res.json({ message: 'Habit removed' });
  } catch (error) {
    next(error);
  }
};
