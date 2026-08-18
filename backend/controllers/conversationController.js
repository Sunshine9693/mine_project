const Conversation = require('../models/Conversation');

exports.createConversation = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title = 'New conversation' } = req.body;

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
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
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
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });

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
    const result = await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    return res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('[AURA Conversation Delete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};
