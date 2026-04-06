import mongoose from 'mongoose';

const healthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateStr: { type: String, required: true }, 
  waterIntake: { type: Number, default: 0 }, // glasses
  sleepHours: { type: Number, default: 0 }, // hours
  steps: { type: Number, default: 0 },
  exerciseMinutes: { type: Number, default: 0 }
}, { timestamps: true });

// Composite index for fast daily lookups
healthSchema.index({ userId: 1, dateStr: 1 }, { unique: true });

export default mongoose.model('Health', healthSchema);
