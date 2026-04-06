import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true }, 
  repeat: { type: String, enum: ['daily', 'weekly', 'none'], default: 'daily' },
  completed: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  userId: { type: String, required: true } // Kept as String for backward compatibility with existing data
}, { timestamps: true });

// Indexes for fast lookup
habitSchema.index({ userId: 1 });
habitSchema.index({ userId: 1, time: 1 });

export default mongoose.model('Habit', habitSchema);
