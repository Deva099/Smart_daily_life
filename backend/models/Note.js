import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: { type: String, default: 'guest' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  aiSummary: { type: String }
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
