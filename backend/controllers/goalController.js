import Goal from '../models/Goal.js';

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    res.json(goals);
  } catch (error) {
    next(error);
  }
};

export const addGoal = async (req, res, next) => {
  try {
    const { title, deadline, milestones } = req.body;
    const goal = await Goal.create({
      user: req.user._id,
      title,
      deadline,
      milestones
    });
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) {
      res.status(404);
      return next(new Error('Goal not found'));
    }
    res.json(goal);
  } catch (error) {
    next(error);
  }
};
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      res.status(404);
      return next(new Error('Goal not found'));
    }
    res.json({ message: 'Goal removed' });
  } catch (error) {
    next(error);
  }
};
