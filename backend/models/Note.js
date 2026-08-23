const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Note title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    default: '',
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: (value) => Array.isArray(value) && value.every((tag) => tag && tag.trim().length > 0),
      message: 'Tags must be non-empty strings',
    },
  },
  pinned: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

NoteSchema.index({ userId: 1, updatedAt: -1 });
NoteSchema.index({ userId: 1, tags: 1 });
NoteSchema.index({ userId: 1, title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Note', NoteSchema);
