import Goal from '../models/Goal.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new goal
// @route   POST /api/goals
// @access  Private
export const addGoal = async (req, res, next) => {
  try {
    const { title, target, category, deadline } = req.body;
    
    if (!title || !target) {
      return next(new ErrorResponse('Goal title and target are required', 400));
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title: title.trim(),
      target,
      category: category || 'General',
      deadline
    });
    
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!goal) {
      return next(new ErrorResponse('Goal not found or unauthorized', 404));
    }

    const fieldsToUpdate = ['title', 'current', 'target', 'category', 'deadline', 'completed'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        goal[field] = (field === 'title') ? req.body[field].trim() : req.body[field];
      }
    });

    const updatedGoal = await goal.save();
    res.status(200).json({ success: true, data: updatedGoal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!goal) {
      return next(new ErrorResponse('Goal not found or unauthorized', 404));
    }
    
    res.status(200).json({ success: true, message: 'Goal removed successfully' });
  } catch (error) {
    next(error);
  }
};
