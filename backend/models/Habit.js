import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true }, // Format HH:mm
  repeat: { type: String, enum: ['daily', 'weekly', 'none'], default: 'daily' },
  completed: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  userId: { type: String, default: 'guest' }
}, { timestamps: true });

export default mongoose.model('Habit', habitSchema);
