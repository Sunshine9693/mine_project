const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [200, 'Reminder title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  date: {
    type: String,
    default: '',
    trim: true,
  },
  time: {
    type: String,
    default: '',
    trim: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

ReminderSchema.index({ userId: 1, date: 1, time: 1 });
ReminderSchema.index({ userId: 1, completed: 1, enabled: 1 });
ReminderSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Reminder', ReminderSchema);
