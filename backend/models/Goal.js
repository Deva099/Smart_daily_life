import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  deadline: { type: Date },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes for fast lookup
goalSchema.index({ userId: 1 });
goalSchema.index({ userId: 1, completed: 1 });

export default mongoose.model('Goal', goalSchema);
