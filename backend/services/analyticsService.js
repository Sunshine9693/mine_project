const Memory = require('../models/Memory');
const Note = require('../models/Note');
const Task = require('../models/Task');
const Reminder = require('../models/Reminder');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getOverview = async (userId) => {
  const [user, memories, notes, tasks, reminders, conversations] = await Promise.all([
    User.findById(userId).lean(),
    Memory.find({ userId }).sort({ updatedAt: -1, createdAt: -1 }).lean(),
    Note.find({ userId }).sort({ updatedAt: -1, createdAt: -1 }).lean(),
    Task.find({ userId }).sort({ updatedAt: -1, createdAt: -1 }).lean(),
    Reminder.find({ userId }).sort({ updatedAt: -1, createdAt: -1 }).lean(),
    Conversation.find({ userId }).sort({ updatedAt: -1, createdAt: -1 }).lean(),
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const totalReminders = reminders.length;
  const activeReminders = reminders.filter((reminder) => reminder.enabled && !reminder.completed).length;
  const completedReminders = reminders.filter((reminder) => reminder.completed).length;

  const totalNotes = notes.length;
  const pinnedNotes = notes.filter((note) => note.pinned).length;

  const memoryCategories = memories.reduce((accumulator, memory) => {
    const key = memory.category || 'other';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const maxMemoryCount = Math.max(...Object.values(memoryCategories), 1);
  const categoryBreakdown = Object.entries(memoryCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      category,
      count,
      percent: Math.round((count / maxMemoryCount) * 100),
    }));

  const messageTotal = conversations.reduce((sum, conversation) => sum + (conversation.messages?.length || 0), 0);

  const activity = [
    ...notes.map((note) => ({
      type: 'Note',
      title: note.title,
      timestamp: note.updatedAt || note.createdAt,
      meta: note.pinned ? 'Pinned' : 'Updated',
    })),
    ...tasks.map((task) => ({
      type: 'Task',
      title: task.title,
      timestamp: task.updatedAt || task.createdAt,
      meta: task.completed ? 'Completed' : 'Pending',
    })),
    ...reminders.map((reminder) => ({
      type: 'Reminder',
      title: reminder.title,
      timestamp: reminder.updatedAt || reminder.createdAt,
      meta: reminder.completed ? 'Done' : reminder.enabled ? 'Scheduled' : 'Paused',
    })),
    ...memories.slice(0, 5).map((memory) => ({
      type: 'Memory',
      title: memory.key,
      timestamp: memory.updatedAt || memory.createdAt,
      meta: memory.category || 'other',
    })),
  ]
    .filter((item) => item.title && toDate(item.timestamp))
    .sort((a, b) => toDate(b.timestamp) - toDate(a.timestamp))
    .slice(0, 8)
    .map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp).toISOString(),
    }));

  const summary = {
    notes: {
      total: totalNotes,
      pinned: pinnedNotes,
      recent: notes.slice(0, 3).map((note) => ({
        title: note.title,
        updatedAt: note.updatedAt || note.createdAt,
      })),
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      highPriority: tasks.filter((task) => task.priority === 'HIGH').length,
    },
    reminders: {
      total: totalReminders,
      active: activeReminders,
      completed: completedReminders,
      upcoming: reminders.filter((reminder) => !reminder.completed && reminder.enabled && reminder.date).length,
    },
    memory: {
      total: memories.length,
      categories: categoryBreakdown,
    },
    conversations: {
      total: conversations.length,
      messages: messageTotal,
    },
  };

  const privacy = {
    memoryEnabled: user?.memoryEnabled !== false,
    voiceEnabled: user?.voiceEnabled !== false,
    notifications: {
      reminders: user?.notificationPreferences?.reminders !== false,
      tasks: user?.notificationPreferences?.tasks !== false,
      assistantAlerts: user?.notificationPreferences?.assistantAlerts !== false,
      general: user?.notificationPreferences?.general !== false,
    },
    theme: user?.theme || user?.preferences?.theme || 'system',
    personality: user?.personality || user?.communicationStyle || 'friendly',
    retention: 'Relevant memory entries are used only to personalize responses and remain scoped to this user account.',
  };

  const insights = [
    {
      label: 'Productivity momentum',
      value: `${completedTasks}/${Math.max(totalTasks, 1)} tasks completed`,
      tone: totalTasks === 0 ? 'neutral' : completedTasks >= Math.ceil(totalTasks / 2) ? 'positive' : 'steady',
    },
    {
      label: 'Memory footprint',
      value: `${memories.length} saved memory snippets`,
      tone: memories.length === 0 ? 'neutral' : 'positive',
    },
    {
      label: 'Reminder health',
      value: `${activeReminders} active reminders`,
      tone: activeReminders === 0 ? 'neutral' : 'positive',
    },
  ];

  return {
    summary,
    activity,
    privacy,
    insights,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { getOverview };
