import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Active', 'Completed'], default: 'Pending' },
  tasks: [{ text: String, done: { type: Boolean, default: false } }]
});

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  deadline: { type: Date, required: true },
  progress: { type: Number, default: 0 },
  milestones: [milestoneSchema]
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
