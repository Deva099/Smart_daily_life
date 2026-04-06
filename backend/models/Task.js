import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low', 'None'], default: 'Medium' },
  deadline: { type: String }, // Format HH:mm or Time
  completed: { type: Boolean, default: false },
  userId: { type: String, default: 'guest' },
  dateStr: { type: String }, // For calendar mappings E.g. 2026-04-01
  hasReminder: { type: Boolean, default: false },
  reminderTime: { type: String },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
