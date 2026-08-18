const { callAI } = require('../services/aiService');
const { detectIntent } = require('../services/intentService');
const Conversation = require('../models/Conversation');
const Memory = require('../models/Memory');
const User = require('../models/User');

const normalizeText = (value) => String(value || '').trim();

const ensureConversation = async ({ conversationId, userId, message, title }) => {
  if (conversationId) {
    const existing = await Conversation.findById(conversationId);
    if (existing && existing.userId.toString() === userId.toString()) {
      return existing;
    }
  }

  return Conversation.create({
    userId,
    title: title || normalizeText(message).slice(0, 40) || 'New conversation',
    messages: [],
  });
};

const handleMemoryItem = async ({ userId, message }) => {
  const lower = message.toLowerCase();
  const match = lower.match(/remember(?:\s+(?:that|this))?\s+(.+)/i);
  if (!match) return null;

  const value = match[1].trim();
  if (!value) return null;

  const item = await Memory.create({
    userId,
    key: 'user_note',
    value,
    category: 'memory',
  });

  return item;
};

exports.chat = async (req, res) => {
  try {
    const message = normalizeText(req.body.message);
    const conversationId = req.body.conversationId || null;
    const userId = req.user?.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const intent = detectIntent(message);
    const user = await User.findById(userId).lean();
    const conversation = await ensureConversation({
      conversationId,
      userId,
      message,
      title: message.slice(0, 40),
    });

    conversation.messages.push({ role: 'user', content: message, createdAt: new Date() });

    let action = null;
    if (intent === 'MEMORY') {
      await handleMemoryItem({ userId, message });
      action = 'memory';
    }

    const aiResult = await callAI({
      message,
      conversationId: conversation._id,
      userPreferences: user?.preferences || user?.assistantSettings || {},
    });

    const responseText = aiResult.response || 'I am here to help.';

    conversation.messages.push({ role: 'assistant', content: responseText, createdAt: new Date() });
    conversation.title = conversation.title || 'New conversation';
    await conversation.save();

    return res.status(200).json({
      success: true,
      response: responseText,
      conversationId: conversation._id,
      action,
      intent,
    });
  } catch (error) {
    console.error('[AURA AI Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'AI service error',
    });
  }
};
