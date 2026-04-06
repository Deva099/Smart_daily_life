import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'Miscellaneous' },
  currency: { type: String, default: 'INR' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for analytics and sorting
expenseSchema.index({ user: 1 });
expenseSchema.index({ user: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
