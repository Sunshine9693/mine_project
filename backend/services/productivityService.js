const Note = require('../models/Note');
const Task = require('../models/Task');
const Reminder = require('../models/Reminder');

const getDashboardSummary = async (userId) => {
  const [notes, tasks, reminders] = await Promise.all([
    Note.find({ userId }).lean(),
    Task.find({ userId }).lean(),
    Reminder.find({ userId }).lean(),
  ]);

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  return {
    notes: {
      total: notes.length,
      pinned: notes.filter((note) => note.pinned).length,
      recent: notes.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3),
    },
    tasks: {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      highPriority: tasks.filter((task) => task.priority === 'HIGH').length,
    },
    reminders: {
      today: reminders.filter((reminder) => {
        if (!reminder.date) return false;
        const target = new Date(reminder.date);
        return target >= start && target <= end;
      }).length,
      upcoming: reminders.filter((reminder) => !reminder.completed && reminder.enabled && reminder.date).length,
      completed: reminders.filter((reminder) => reminder.completed).length,
    },
  };
};

module.exports = { getDashboardSummary };
