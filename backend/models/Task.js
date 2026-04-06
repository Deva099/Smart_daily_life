import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low', 'None'], default: 'Medium' },
  deadline: { type: String }, 
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateStr: { type: String }, 
  hasReminder: { type: Boolean, default: false },
  reminderTime: { type: String },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for fast lookup
taskSchema.index({ userId: 1 });
taskSchema.index({ userId: 1, dateStr: 1 });
taskSchema.index({ deadline: 1 });

export default mongoose.model('Task', taskSchema);
