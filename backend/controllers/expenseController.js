import Expense from '../models/Expense.js';

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

export const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, currency } = req.body;
    const expense = new Expense({ user: req.user._id, title, amount, category, currency });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    next(error);
  }
};
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      res.status(404);
      return next(new Error('Expense not found'));
    }
    res.json({ message: 'Expense removed' });
  } catch (error) {
    next(error);
  }
};
