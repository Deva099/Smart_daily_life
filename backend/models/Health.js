import mongoose from 'mongoose';

const healthSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'guest' },
  dateStr: { type: String, required: true }, // Format: 'YYYY-MM-DD'
  waterIntake: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  steps: { type: Number, default: 0 },
  exerciseMinutes: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure unique entry per user per day
healthSchema.index({ userId: 1, dateStr: 1 }, { unique: true });

export default mongoose.model('Health', healthSchema);
