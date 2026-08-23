const Memory = require('../models/Memory');

exports.createMemory = async (req, res) => {
  try {
    const { key, value, category = 'general' } = req.body;

    if (!String(key || '').trim() || value === undefined || value === null || !String(value).trim()) {
      return res.status(400).json({ success: false, message: 'Key and value are required' });
    }

    const memory = await Memory.create({
      userId: req.user.id,
      key,
      value,
      category: category === 'general' ? 'other' : category,
    });

    return res.status(201).json({ success: true, memory });
  } catch (error) {
    console.error('[AURA Memory Create Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to save memory' });
  }
};

exports.getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });
    return res.status(200).json({ success: true, memory });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid memory id' });
  }
};

exports.updateMemory = async (req, res) => {
  try {
    const updates = {};
    if (req.body.key !== undefined) updates.key = String(req.body.key).trim();
    if (req.body.value !== undefined) updates.value = req.body.value;
    if (req.body.category !== undefined) updates.category = req.body.category;
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true },
    );
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });
    return res.status(200).json({ success: true, memory });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid memory update' });
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

exports.deleteAllMemory = async (req, res) => {
  try {
    const result = await Memory.deleteMany({ userId: req.user.id });
    return res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('[AURA Memory Clear Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear memories' });
  }
};
