import Expense from '../models/Expense.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
export const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, currency } = req.body;
    
    if (!title || !amount) {
      return next(new ErrorResponse('Title and amount are required', 400));
    }

    const expense = await Expense.create({ 
      user: req.user._id, 
      title: title.trim(), 
      amount, 
      category: category || 'Miscellaneous', 
      currency: currency || 'INR' 
    });
    
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!expense) {
      return next(new ErrorResponse('Expense not found or unauthorized', 404));
    }
    
    res.status(200).json({ success: true, message: 'Expense removed successfully' });
  } catch (error) {
    next(error);
  }
};
