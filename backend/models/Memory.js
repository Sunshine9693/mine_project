const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  key: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  category: {
    type: String,
    default: 'general',
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Memory', MemorySchema);
