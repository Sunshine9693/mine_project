const Task = require('../models/Task');

const normalizePriority = (priority) => {
  const score = String(priority || '').toUpperCase();
  return ['LOW', 'MEDIUM', 'HIGH'].includes(score) ? score : 'MEDIUM';
};

const normalizeCategory = (category) => String(category || 'General').trim() || 'General';

exports.createTask = async (req, res) => {
  try {
    const { title, description = '', priority = 'MEDIUM', dueDate, category = 'General' } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      userId: req.user.id,
      title: String(title).trim(),
      description: String(description || '').trim(),
      priority: normalizePriority(priority),
      dueDate: dueDate ? new Date(dueDate) : null,
      category: normalizeCategory(category),
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('[AURA Task Create Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const query = { userId: req.user.id };
    const { status, priority, category, dueDate } = req.query;

    if (status === 'completed') query.completed = true;
    if (status === 'pending') query.completed = false;
    if (priority) query.priority = String(priority).toUpperCase();
    if (category) query.category = new RegExp(String(category).trim(), 'i');
    if (dueDate) {
      const target = new Date(dueDate);
      if (!Number.isNaN(target.getTime())) {
        const start = new Date(target);
        start.setHours(0, 0, 0, 0);
        const end = new Date(target);
        end.setHours(23, 59, 59, 999);
        query.dueDate = { $gte: start, $lte: end };
      }
    }

    const tasks = await Task.find(query).sort({ completed: 1, dueDate: 1, updatedAt: -1 });
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('[AURA Tasks Fetch Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.error('[AURA Task Fetch Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, priority, dueDate, category, completed } = req.body || {};
    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: 'Task title is required' });
      }
      task.title = String(title).trim();
    }
    if (description !== undefined) task.description = String(description || '').trim();
    if (priority !== undefined) task.priority = normalizePriority(priority);
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (category !== undefined) task.category = normalizeCategory(category);
    if (completed !== undefined) task.completed = Boolean(completed);

    await task.save();
    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.error('[AURA Task Update Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();
    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.error('[AURA Task Complete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('[AURA Task Delete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};
