import Note from '../models/Note.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new note
// @route   POST /api/notes
// @access  Private
export const addNote = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    
    if (!title || !title.trim()) {
      return next(new ErrorResponse('Note title is required', 400));
    }

    const note = await Note.create({ 
      user: req.user._id, 
      title: title.trim(), 
      content: content ? content.trim() : '', 
      tags 
    });
    
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      return next(new ErrorResponse('Note not found or unauthorized', 404));
    }
    
    if (req.body.title !== undefined) note.title = req.body.title.trim();
    if (req.body.content !== undefined) note.content = req.body.content;
    if (req.body.tags !== undefined) note.tags = req.body.tags;
    
    const updatedNote = await note.save();
    res.status(200).json({ success: true, data: updatedNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      return next(new ErrorResponse('Note not found or unauthorized', 404));
    }
    
    res.status(200).json({ success: true, message: 'Note removed successfully' });
  } catch (error) {
    next(error);
  }
};
