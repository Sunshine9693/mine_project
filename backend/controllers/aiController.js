const mongoose = require('mongoose');
const { generateAIResponse, MAX_CONTEXT_MESSAGES } = require('../services/aiService');
const { detectIntent, FUTURE_INTENTS, parseNoteInput, parseTaskInput, parseReminderInput } = require('../services/intentService');
const { resolveReminderDate } = require('../utils/timezone');
const Conversation = require('../models/Conversation');
const Memory = require('../models/Memory');
const Note = require('../models/Note');
const Task = require('../models/Task');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { routeAction } = require('../services/actionRouter');

const MAX_MESSAGE_LENGTH = 8000;

const normalizeText = (value) => String(value || '').trim().slice(0, MAX_MESSAGE_LENGTH);

const ensureConversation = async ({ conversationId, userId, message }) => {
  if (conversationId) {
    if (!mongoose.isValidObjectId(conversationId)) {
      const error = new Error('Invalid conversation id');
      error.status = 400;
      throw error;
    }
    const existing = await Conversation.findOne({ _id: conversationId, userId });
    if (!existing) {
      const error = new Error('Conversation not found');
      error.status = 404;
      throw error;
    }
    return existing;
  }

  return Conversation.create({
    userId,
    title: message.slice(0, 40) || 'New conversation',
    messages: [],
  });
};

const parseMemoryInstruction = (message) => {
  const content = message.replace(/^(remember|store in memory|save to memory)\s+(that\s+|this\s+)?/i, '').trim();
  const preference = content.match(/(?:i\s+)?prefer\s+(.+?)(?:\s+answers?|\s+explanations?)?$/i);
  if (preference) return { key: 'response_style', value: 'concise', category: 'preference' };

  const favorite = content.match(/my\s+favorite\s+([\w\s]+?)\s+is\s+(.+)/i);
  if (favorite) return { key: `favorite_${favorite[1].trim().replace(/\s+/g, '_').toLowerCase()}`, value: favorite[2].trim(), category: 'preference' };

  const workingOn = content.match(/(?:i\s+)?(?:am|'m)\s+working\s+on\s+(.+)/i);
  if (workingOn) return { key: 'current_project', value: workingOn[1].trim(), category: 'project' };

  const explicit = content.match(/^([^:]+):\s*(.+)$/);
  if (explicit) return { key: explicit[1].trim().replace(/\s+/g, '_').toLowerCase(), value: explicit[2].trim(), category: 'other' };

  return { key: 'user_note', value: content, category: 'personal' };
};

const memoryResponse = (type, message, action = null) => ({ type, message, action });

const buildNoteSearchQuery = (message) => {
  const search = String(message || '')
    .replace(/^(show|list|get|view)\s+/i, '')
    .replace(/\bmy\s+/i, '')
    .replace(/\bnotes?\b/gi, '')
    .replace(/\babout\b/gi, '')
    .replace(/\bfor\b/gi, '')
    .trim();
  return search;
};

const buildTaskSearchQuery = (message) => {
  const search = String(message || '')
    .replace(/^(show|list|get|view)\s+/i, '')
    .replace(/\bmy\s+/i, '')
    .replace(/\btasks?\b/gi, '')
    .replace(/\b(?:pending|due|today|tomorrow|high priority|completed)\b/gi, '')
    .trim();
  return search;
};

const performProductivityIntent = async ({ intent, message, userId }) => {
  if (intent === 'CREATE_NOTE') {
    const parsed = parseNoteInput(message);
    const note = await Note.create({
      userId,
      title: parsed.title,
      content: parsed.content,
      tags: parsed.tags,
      pinned: false,
    });

    return memoryResponse('CREATE_NOTE', `I created the note "${note.title}".`, {
      note: {
        id: note._id,
        title: note.title,
        tags: note.tags,
        content: note.content,
      },
    });
  }

  if (intent === 'SEARCH_NOTES' || intent === 'GET_NOTES') {
    const queryText = buildNoteSearchQuery(message);
    const search = queryText || undefined;
    const filter = { userId };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 }).lean();
    const responseText = notes.length
      ? `I found ${notes.length} note${notes.length === 1 ? '' : 's'}${search ? ` matching "${search}"` : ''}.`
      : 'I did not find any matching notes.';

    return memoryResponse(intent, responseText, { notes });
  }

  if (intent === 'UPDATE_NOTE') {
    const noteName = String(message).match(/(?:my\s+)?([a-z0-9\s-]+?)\s+note/i)?.[1] || 'Untitled';
    const note = await Note.findOne({ userId, title: { $regex: noteName, $options: 'i' } }).sort({ updatedAt: -1 });
    if (!note) {
      return memoryResponse('UPDATE_NOTE', 'I could not find a matching note to update.', null);
    }

    const nextText = String(message).replace(/^(?:update|edit)\s+/i, '').replace(new RegExp(`(?:my\s+)?${noteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+note`, 'i'), '').trim();
    note.content = nextText || note.content;
    note.title = note.title;
    await note.save();
    return memoryResponse('UPDATE_NOTE', `I updated the note "${note.title}".`, { note: { id: note._id, title: note.title, content: note.content } });
  }

  if (intent === 'DELETE_NOTE') {
    const titleMatch = String(message).match(/(?:delete|remove)\s+(?:my\s+)?(.+?)(?:\s+note|$)/i)?.[1] || '';
    const note = await Note.findOne({ userId, title: { $regex: titleMatch || '.', $options: 'i' } }).sort({ updatedAt: -1 });
    if (!note) {
      return memoryResponse('DELETE_NOTE', 'I could not find a note to delete.', null);
    }

    await Note.deleteOne({ _id: note._id, userId });
    return memoryResponse('DELETE_NOTE', `I deleted the note "${note.title}".`, { id: note._id });
  }

  if (intent === 'PIN_NOTE') {
    const titleMatch = String(message).match(/(?:pin\s+my\s+|pin\s+)(.+?)(?:\s+note|$)/i)?.[1] || '';
    const note = await Note.findOne({ userId, title: { $regex: titleMatch || '.', $options: 'i' } }).sort({ updatedAt: -1 });
    if (!note) {
      return memoryResponse('PIN_NOTE', 'I could not find a note to pin.', null);
    }

    note.pinned = true;
    await note.save();
    return memoryResponse('PIN_NOTE', `I pinned "${note.title}".`, { note: { id: note._id, pinned: true } });
  }

  if (intent === 'CREATE_TASK') {
    const parsed = parseTaskInput(message);
    const task = await Task.create({
      userId,
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      category: parsed.category,
    });

    return memoryResponse('CREATE_TASK', `I added the task "${task.title}".`, {
      task: { id: task._id, title: task.title, priority: task.priority, category: task.category },
    });
  }

  if (intent === 'GET_TASKS') {
    const queryText = buildTaskSearchQuery(message);
    const query = { userId };
    if (/pending/i.test(message)) query.completed = false;
    if (/completed|done/i.test(message)) query.completed = true;
    if (/high[- ]?priority/i.test(message)) query.priority = 'HIGH';
    if (queryText) {
      query.$or = [{ title: { $regex: queryText, $options: 'i' } }, { description: { $regex: queryText, $options: 'i' } }, { category: { $regex: queryText, $options: 'i' } }];
    }

    const tasks = await Task.find(query).sort({ completed: 1, dueDate: 1, updatedAt: -1 }).lean();
    const responseText = tasks.length
      ? `I found ${tasks.length} task${tasks.length === 1 ? '' : 's'} for you.`
      : 'You do not have any matching tasks.';

    return memoryResponse('GET_TASKS', responseText, { tasks });
  }

  if (intent === 'UPDATE_TASK') {
    const titleMatch = String(message).match(/(?:my\s+)?([a-z0-9\s-]+?)\s+task/i)?.[1] || 'task';
    const task = await Task.findOne({ userId, title: { $regex: titleMatch, $options: 'i' } }).sort({ updatedAt: -1 });
    if (!task) {
      return memoryResponse('UPDATE_TASK', 'I could not find a matching task to update.', null);
    }

    const parsed = parseTaskInput(message);
    task.title = parsed.title || task.title;
    task.priority = parsed.priority || task.priority;
    task.category = parsed.category || task.category;
    await task.save();
    return memoryResponse('UPDATE_TASK', `I updated the task "${task.title}".`, { task: { id: task._id, title: task.title, priority: task.priority } });
  }

  if (intent === 'COMPLETE_TASK') {
    const titleMatch = String(message).match(/(?:my\s+)?([a-z0-9\s-]+?)\s+task/i)?.[1] || '';
    const task = await Task.findOne({ userId, title: { $regex: titleMatch || '.', $options: 'i' } }).sort({ updatedAt: -1 });
    if (!task) {
      return memoryResponse('COMPLETE_TASK', 'I could not find a task to mark complete.', null);
    }

    task.completed = true;
    await task.save();
    return memoryResponse('COMPLETE_TASK', `I marked "${task.title}" as completed.`, { task: { id: task._id, completed: true } });
  }

  if (intent === 'DELETE_TASK') {
    const titleMatch = String(message).match(/(?:delete|remove)\s+(?:my\s+)?(.+?)(?:\s+task|$)/i)?.[1] || '';
    const task = await Task.findOne({ userId, title: { $regex: titleMatch || '.', $options: 'i' } }).sort({ updatedAt: -1 });
    if (!task) {
      return memoryResponse('DELETE_TASK', 'I could not find a task to delete.', null);
    }

    await Task.deleteOne({ _id: task._id, userId });
    return memoryResponse('DELETE_TASK', `I deleted the task "${task.title}".`, { id: task._id });
  }

  if (intent === 'CREATE_REMINDER') {
    const parsed = parseReminderInput(message);
    const reminder = await Reminder.create({
      userId,
      title: parsed.title,
      description: String(message).trim(),
      date: resolveReminderDate(parsed.date),
      time: parsed.time,
      priority: parsed.priority,
      enabled: parsed.enabled,
    });

    return memoryResponse('CREATE_REMINDER', `I scheduled the reminder "${reminder.title}".`, {
      reminder: {
        id: reminder._id,
        title: reminder.title,
        date: reminder.date,
        time: reminder.time,
        priority: reminder.priority,
      },
    });
  }

  if (intent === 'GET_REMINDERS') {
    const query = { userId };
    if (/today/i.test(message)) {
      const todayDate = resolveReminderDate('today');
      query.date = todayDate;
    }
    if (/pending|upcoming/i.test(message)) {
      query.completed = false;
    }
    const reminders = await Reminder.find(query).sort({ date: 1, time: 1, updatedAt: -1 }).lean();
    const responseText = reminders.length
      ? `I found ${reminders.length} reminder${reminders.length === 1 ? '' : 's'} for you.`
      : 'You do not have any matching reminders.';

    return memoryResponse('GET_REMINDERS', responseText, { reminders });
  }

  if (intent === 'DELETE_REMINDER') {
    const titleMatch = String(message).match(/(?:cancel|delete|remove)\s+(?:my\s+)?(.+?)(?:\s+reminder|$)/i)?.[1] || '';
    const reminder = await Reminder.findOne({ userId, title: { $regex: titleMatch || '.', $options: 'i' } }).sort({ updatedAt: -1 });
    if (!reminder) {
      return memoryResponse('DELETE_REMINDER', 'I could not find a reminder to cancel.', null);
    }

    await Reminder.deleteOne({ _id: reminder._id, userId });
    return memoryResponse('DELETE_REMINDER', `I canceled the reminder "${reminder.title}".`, { id: reminder._id });
  }

  return memoryResponse('CHAT', 'I am ready to help with your notes, tasks, and reminders.', null);
};

const performMemoryIntent = async ({ intent, message, userId }) => {
  if (intent === 'CREATE_MEMORY') {
    const instruction = parseMemoryInstruction(message);
    const memory = await Memory.findOneAndUpdate(
      { userId, key: instruction.key },
      { ...instruction, userId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return memoryResponse('CREATE_MEMORY', `I'll remember that ${memory.value}.`, {
      id: memory._id,
      key: memory.key,
      value: memory.value,
      category: memory.category,
    });
  }

  if (intent === 'GET_MEMORY') {
    const memories = await Memory.find({ userId }).sort({ updatedAt: -1 }).limit(50).lean();
    const messageText = memories.length
      ? `I remember: ${memories.map((memory) => `${memory.key.replace(/_/g, ' ')} is ${memory.value}`).join('; ')}.`
      : 'I do not have any saved memories about you yet.';
    return memoryResponse('GET_MEMORY', messageText, { memories });
  }

  const phrase = message.replace(/^(forget|remove from memory|delete memory)\s+(that\s+|this\s+)?/i, '').trim();
  const words = phrase.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
  const memories = await Memory.find({ userId }).sort({ updatedAt: -1 }).limit(50);
  const match = memories.find((memory) => words.some((word) => `${memory.key} ${memory.value}`.toLowerCase().includes(word)));
  if (!match) return memoryResponse('DELETE_MEMORY', 'I could not find a matching saved memory.', null);

  await Memory.deleteOne({ _id: match._id, userId });
  return memoryResponse('DELETE_MEMORY', `I forgot that ${match.value}.`, { id: match._id, key: match.key });
};

const errorResponse = (error) => {
  if (error.code === 'AI_NOT_CONFIGURED') return { status: 503, message: 'AI service is not configured.' };
  if (error.code === 'AI_RATE_LIMITED') return { status: 429, code: 'AI_RATE_LIMITED', message: 'AURA is temporarily busy. Please try again in a few seconds.' };
  if (error.code === 'AI_QUOTA_EXCEEDED') return { status: 429, code: 'AI_QUOTA_EXCEEDED', message: 'AURA\'s AI service quota is unavailable. Please check the API project billing/usage settings.' };
  if (error.code === 'AI_AUTH_ERROR') return { status: 502, code: 'AI_AUTH_ERROR', message: 'AURA\'s AI configuration needs attention.' };
  if (error.code === 'AI_MODEL_ERROR') return { status: 502, code: 'AI_MODEL_ERROR', message: 'AURA\'s configured AI model is unavailable.' };
  if (error.code === 'AI_INVALID_RESPONSE') return { status: 502, message: 'The AI provider returned an invalid response.' };
  if (error.code === 'AI_PROVIDER_ERROR') return { status: 502, code: 'AI_PROVIDER_ERROR', message: 'AURA could not reach the AI provider. Please try again.' };
  return { status: error.status || 500, code: error.code, message: error.status ? error.message : 'AI service error' };
};

exports.chat = async (req, res) => {
  try {
    const message = normalizeText(req.body.message);
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    const userId = req.user.id;
    const inputType = req.body.inputType === 'VOICE' ? 'VOICE' : 'TEXT';
    const intent = detectIntent(message);
    const conversation = await ensureConversation({ conversationId: req.body.conversationId, userId, message });
    const history = conversation.messages.slice(-MAX_CONTEXT_MESSAGES).map(({ role, content }) => ({ role, content }));
    conversation.messages.push({ role: 'user', content: message, type: 'message', inputType });

    let result;
    if (FUTURE_INTENTS.includes(intent) && ['WEATHER', 'SEARCH', 'CALCULATE', 'TIME', 'DATE', 'TRANSLATE'].includes(intent)) {
      result = await routeAction({ intent, message });
    } else if (intent === 'CHAT') {
      const [user, memories] = await Promise.all([
        User.findById(userId).select('name preferences assistantSettings').lean(),
        Memory.find({ userId }).sort({ updatedAt: -1 }).limit(50).lean(),
      ]);
      const aiResult = await generateAIResponse({ message, history, user, memories });
      result = memoryResponse('CHAT', aiResult.message, null);
    } else if (/^(CREATE_|GET_|SEARCH_|UPDATE_|DELETE_|PIN_|COMPLETE_)/.test(intent)) {
      result = await performProductivityIntent({ intent, message, userId });
    } else {
      result = await performMemoryIntent({ intent, message, userId });
    }

    conversation.messages.push({ role: 'assistant', content: result.message, type: 'message', inputType });
    await conversation.save();

    return res.status(200).json({
      success: true,
      response: result.message,
      type: result.type,
      action: result.action,
      intent,
      conversationId: conversation._id,
    });
  } catch (error) {
    const safeError = errorResponse(error);
    console.error('[AURA AI Controller Error]:', error.code || error.message);
    return res.status(safeError.status).json({ success: false, code: safeError.code, message: safeError.message });
  }
};
