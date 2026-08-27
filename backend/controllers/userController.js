const User = require('../models/User');

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  preferences: user.preferences,
  assistantSettings: user.assistantSettings,
});

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: safeUser(user), user: safeUser(user) });
  } catch (error) { return next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 2 || name.length > 80) return res.status(400).json({ success: false, message: 'Name must be between 2 and 80 characters.' });
      updates.name = name;
    }
    if (req.body.avatar !== undefined) {
      const avatar = String(req.body.avatar).trim();
      if (avatar.length > 500) return res.status(400).json({ success: false, message: 'Avatar URL is too long.' });
      updates.avatar = avatar;
    }
    if (req.body.preferences !== undefined) updates.preferences = req.body.preferences;
    if (req.body.assistantSettings !== undefined) updates.assistantSettings = req.body.assistantSettings;
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: safeUser(user), user: safeUser(user) });
  } catch (error) { return next(error); }
};

