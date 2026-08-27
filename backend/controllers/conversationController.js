const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

const validateId = (id) => mongoose.isValidObjectId(id);
const findOwnedConversation = (id, userId) => {
  if (!validateId(id)) {
    const error = new Error('Invalid conversation id.');
    error.status = 400;
    throw error;
  }
  return Conversation.findOne({ _id: id, userId });
};

exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const title = String(req.body?.title || 'New conversation').trim();
    if (title.length > 200) return res.status(400).json({ success: false, message: 'Conversation title cannot exceed 200 characters.' });

    const conversation = await Conversation.create({
      userId,
      title,
      messages: [],
    });

    res.status(201).json({ success: true, conversation });
  } catch (error) {
    console.error('[AURA Conversation Create Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('[AURA Conversations Fetch Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

exports.getConversationById = async (req, res) => {
  try {
    const conversation = await findOwnedConversation(req.params.id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('[AURA Conversation Get Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
};

exports.updateConversation = async (req, res) => {
  try {
    const { title, messages } = req.body;
    const conversation = await findOwnedConversation(req.params.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (title) conversation.title = title;
    if (messages) conversation.messages = messages;

    await conversation.save();
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('[AURA Conversation Update Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update conversation' });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const result = await findOwnedConversation(req.params.id, req.user.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await result.deleteOne();
    return res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('[AURA Conversation Delete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conversation = await findOwnedConversation(req.params.id, req.user.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    return res.json({ success: true, data: conversation.messages, messages: conversation.messages });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Failed to fetch messages' });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const conversation = await findOwnedConversation(req.params.id, req.user.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const role = String(req.body?.role || '').toLowerCase();
    const content = String(req.body?.content || '').trim();
    if (!['user', 'assistant', 'system'].includes(role)) return res.status(400).json({ success: false, message: 'Role must be user, assistant, or system.' });
    if (!content || content.length > 8000) return res.status(400).json({ success: false, message: 'Message content is required and must be at most 8000 characters.' });
    const message = { conversationId: conversation._id, userId: req.user.id, role, content };
    conversation.messages.push(message);
    await conversation.save();
    return res.status(201).json({ success: true, data: conversation.messages.at(-1), message: conversation.messages.at(-1) });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Failed to create message' });
  }
};
