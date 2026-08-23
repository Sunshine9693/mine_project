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
    enum: ['preference', 'personal', 'education', 'work', 'project', 'communication', 'other'],
    default: 'other',
    trim: true,
  },
}, {
  timestamps: true,
});

MemorySchema.index({ userId: 1, updatedAt: -1 });
MemorySchema.index({ userId: 1, key: 1 });

module.exports = mongoose.model('Memory', MemorySchema);
