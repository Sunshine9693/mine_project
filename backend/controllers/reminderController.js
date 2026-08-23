const Reminder = require('../models/Reminder');

const normalizePriority = (priority) => {
  const score = String(priority || '').toUpperCase();
  return ['LOW', 'MEDIUM', 'HIGH'].includes(score) ? score : 'MEDIUM';
};

exports.createReminder = async (req, res) => {
  try {
    const { title, description = '', date = '', time = '', priority = 'MEDIUM', enabled = true } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Reminder title is required' });
    }

    const reminder = await Reminder.create({
      userId: req.user.id,
      title: String(title).trim(),
      description: String(description || '').trim(),
      date: String(date || '').trim(),
      time: String(time || '').trim(),
      priority: normalizePriority(priority),
      enabled: Boolean(enabled),
    });

    return res.status(201).json({ success: true, reminder });
  } catch (error) {
    console.error('[AURA Reminder Create Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create reminder' });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const query = { userId: req.user.id };
    const { status, priority, date, enabled } = req.query;

    if (status === 'completed') query.completed = true;
    if (status === 'pending') query.completed = false;
    if (status === 'upcoming') query.completed = false;
    if (priority) query.priority = String(priority).toUpperCase();
    if (date) query.date = new RegExp(String(date).trim(), 'i');
    if (enabled !== undefined) query.enabled = enabled === 'true';

    const reminders = await Reminder.find(query).sort({ date: 1, time: 1, updatedAt: -1 });
    return res.status(200).json({ success: true, reminders });
  } catch (error) {
    console.error('[AURA Reminders Fetch Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
  }
};

exports.getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    return res.status(200).json({ success: true, reminder });
  } catch (error) {
    console.error('[AURA Reminder Fetch Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reminder' });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const { title, description, date, time, priority, enabled, completed } = req.body || {};
    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: 'Reminder title is required' });
      }
      reminder.title = String(title).trim();
    }
    if (description !== undefined) reminder.description = String(description || '').trim();
    if (date !== undefined) reminder.date = String(date || '').trim();
    if (time !== undefined) reminder.time = String(time || '').trim();
    if (priority !== undefined) reminder.priority = normalizePriority(priority);
    if (enabled !== undefined) reminder.enabled = Boolean(enabled);
    if (completed !== undefined) reminder.completed = Boolean(completed);

    await reminder.save();
    return res.status(200).json({ success: true, reminder });
  } catch (error) {
    console.error('[AURA Reminder Update Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update reminder' });
  }
};

exports.completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.completed = !reminder.completed;
    await reminder.save();
    return res.status(200).json({ success: true, reminder });
  } catch (error) {
    console.error('[AURA Reminder Complete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update reminder status' });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const result = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    return res.status(200).json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('[AURA Reminder Delete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete reminder' });
  }
};
