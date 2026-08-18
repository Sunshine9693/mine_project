const Memory = require('../models/Memory');

exports.createMemory = async (req, res) => {
  try {
    const { key, value, category = 'general' } = req.body;

    if (!key || !value) {
      return res.status(400).json({ success: false, message: 'Key and value are required' });
    }

    const memory = await Memory.create({
      userId: req.user.id,
      key,
      value,
      category,
    });

    return res.status(201).json({ success: true, memory });
  } catch (error) {
    console.error('[AURA Memory Create Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to save memory' });
  }
};

exports.getMemory = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, memories });
  } catch (error) {
    console.error('[AURA Memory Get Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch memories' });
  }
};

exports.deleteMemory = async (req, res) => {
  try {
    const result = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    return res.status(200).json({ success: true, message: 'Memory deleted' });
  } catch (error) {
    console.error('[AURA Memory Delete Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete memory' });
  }
};
