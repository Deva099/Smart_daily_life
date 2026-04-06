import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  tags: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes for search and sorting
noteSchema.index({ user: 1 });
noteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);
