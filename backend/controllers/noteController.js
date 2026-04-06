import Note from '../models/Note.js';

export const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !title.trim()) {
      res.status(400);
      return next(new Error('Note title is required'));
    }

    const note = await Note.create({ 
      user: req.user._id, 
      title: title.trim(), 
      content: content ? content.trim() : '', 
      tags 
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      res.status(404);
      return next(new Error('Note not found or unauthorized'));
    }
    
    if (req.body.title) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    if (req.body.tags) note.tags = req.body.tags;
    
    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      res.status(404);
      return next(new Error('Note not found or unauthorized'));
    }
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    next(error);
  }
};
