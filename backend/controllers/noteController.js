const Note = require('../models/Note');

const normalizeTags = (tags = []) => Array.from(new Set((Array.isArray(tags) ? tags : [])
  .map((tag) => String(tag || '').trim().toLowerCase())
  .filter(Boolean))).slice(0, 12);

exports.createNote = async (req, res) => {
  try {
    const { title, content = '', tags = [], pinned = false } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Note title is required' });
    }

    const note = await Note.create({
      userId: req.user.id,
      title: String(title).trim(),
      content: String(content || '').trim(),
      tags: normalizeTags(tags),
      pinned: Boolean(pinned),
    });

    return res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('[AURA Note Create Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create note' });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { search = '', tag = '' } = req.query;
    const query = { userId: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = { $in: [new RegExp(String(tag).trim(), 'i')] };
    }

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    return res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error('[AURA Notes Fetch Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error('[AURA Note Fetch Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch note' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, pinned } = req.body || {};
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Note title is required' });
    }

    if (title !== undefined) note.title = String(title).trim();
    if (content !== undefined) note.content = String(content || '').trim();
    if (tags !== undefined) note.tags = normalizeTags(tags);
    if (pinned !== undefined) note.pinned = Boolean(pinned);

    await note.save();
    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error('[AURA Note Update Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update note' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const result = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    return res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('[AURA Note Delete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
};

exports.togglePinNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.pinned = !note.pinned;
    await note.save();
    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error('[AURA Note Pin Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update note pin status' });
  }
};
