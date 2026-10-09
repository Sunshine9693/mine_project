const User = require('../models/User');

const isValidTimezone = (timezone) => {
  if (!timezone || typeof timezone !== 'string') return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    return true;
  } catch (error) {
    return false;
  }
};

const isValidBirthday = (birthday) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return false;
  const parsedDate = new Date(`${birthday}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === birthday;
};

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  displayName: user.displayName || user.name,
  email: user.email,
  bio: user.bio || '',
  birthday: user.birthday || '',
  timezone: user.timezone || 'Asia/Kolkata',
  language: user.language || 'en',
  country: user.country || 'India',
  avatar: user.avatar || '',
  theme: user.theme || user.preferences?.theme || 'system',
  personality: user.personality || user.assistantSettings?.responseStyle || 'friendly',
  communicationStyle: user.communicationStyle || user.assistantSettings?.responseStyle || 'friendly',
  voiceEnabled: user.voiceEnabled !== undefined ? Boolean(user.voiceEnabled) : Boolean(user.assistantSettings?.autoSpeak !== false),
  memoryEnabled: user.memoryEnabled !== undefined ? Boolean(user.memoryEnabled) : true,
  notificationPreferences: {
    reminders: user.notificationPreferences?.reminders !== false,
    tasks: user.notificationPreferences?.tasks !== false,
    assistantAlerts: user.notificationPreferences?.assistantAlerts !== false,
    general: user.notificationPreferences?.general !== false,
  },
  preferences: {
    theme: user.preferences?.theme || user.theme || 'system',
    accentColor: user.preferences?.accentColor || '#9B5DE5',
    reducedMotion: Boolean(user.preferences?.reducedMotion),
    sound: user.preferences?.sound !== false,
  },
  assistantSettings: {
    voice: user.assistantSettings?.voice || 'aura-default',
    speed: Number(user.assistantSettings?.speed ?? 1),
    autoSpeak: Boolean(user.assistantSettings?.autoSpeak),
    assistantName: user.assistantSettings?.assistantName || 'AURA',
    responseStyle: user.assistantSettings?.responseStyle || user.personality || 'friendly',
    recognitionLanguage: user.assistantSettings?.recognitionLanguage || 'en-US',
  },
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
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found.' });

    const updates = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 2 || name.length > 80) return res.status(400).json({ success: false, message: 'Name must be between 2 and 80 characters.' });
      updates.name = name;
    }

    if (req.body.displayName !== undefined) {
      const displayName = String(req.body.displayName || '').trim();
      if (displayName && (displayName.length < 2 || displayName.length > 80)) {
        return res.status(400).json({ success: false, message: 'Display name must be between 2 and 80 characters.' });
      }
      updates.displayName = displayName;
    }

    if (req.body.bio !== undefined) {
      const bio = String(req.body.bio || '').trim();
      if (bio.length > 500) {
        return res.status(400).json({ success: false, message: 'Bio cannot exceed 500 characters.' });
      }
      updates.bio = bio;
    }

    if (req.body.birthday !== undefined) {
      const birthday = String(req.body.birthday || '').trim();
      if (birthday && !isValidBirthday(birthday)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid birthday.' });
      }
      updates.birthday = birthday;
    }

    if (req.body.timezone !== undefined) {
      const timezone = String(req.body.timezone || '').trim();
      if (!timezone || !isValidTimezone(timezone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid timezone.' });
      }
      updates.timezone = timezone;
    }

    if (req.body.language !== undefined) {
      const language = String(req.body.language || '').trim();
      if (!language || language.length > 20) {
        return res.status(400).json({ success: false, message: 'Please provide a valid language code.' });
      }
      updates.language = language;
    }

    if (req.body.country !== undefined) {
      const country = String(req.body.country || '').trim();
      if (country && country.length > 80) {
        return res.status(400).json({ success: false, message: 'Country name cannot exceed 80 characters.' });
      }
      updates.country = country;
    }

    if (req.body.avatar !== undefined) {
      const avatar = String(req.body.avatar || '').trim();
      if (avatar.length > 500) return res.status(400).json({ success: false, message: 'Avatar URL is too long.' });
      if (avatar) {
        let parsedAvatar;
        try {
          parsedAvatar = new URL(avatar);
        } catch (error) {
          return res.status(400).json({ success: false, message: 'Please provide a valid avatar URL.' });
        }
        if (!['http:', 'https:'].includes(parsedAvatar.protocol)) {
          return res.status(400).json({ success: false, message: 'Avatar URL must use HTTP or HTTPS.' });
        }
      }
      updates.avatar = avatar;
    }

    if (req.body.theme !== undefined) {
      const theme = String(req.body.theme || '').trim().toLowerCase();
      if (!['light', 'dark', 'system'].includes(theme)) {
        return res.status(400).json({ success: false, message: 'Please choose a valid theme.' });
      }
      updates.theme = theme;
      updates.preferences = { ...(currentUser.preferences || {}), theme };
    }

    if (req.body.personality !== undefined) {
      const personality = String(req.body.personality || '').trim().toLowerCase();
      if (!['friendly', 'professional', 'concise', 'detailed', 'casual'].includes(personality)) {
        return res.status(400).json({ success: false, message: 'Please choose a valid personality.' });
      }
      updates.personality = personality;
      updates.assistantSettings = {
        ...(currentUser.assistantSettings || {}),
        responseStyle: personality,
      };
    }

    if (req.body.communicationStyle !== undefined) {
      const communicationStyle = String(req.body.communicationStyle || '').trim().toLowerCase();
      if (!['friendly', 'professional', 'concise', 'detailed', 'casual'].includes(communicationStyle)) {
        return res.status(400).json({ success: false, message: 'Please choose a valid communication style.' });
      }
      updates.communicationStyle = communicationStyle;
    }

    if (req.body.voiceEnabled !== undefined) updates.voiceEnabled = Boolean(req.body.voiceEnabled);
    if (req.body.memoryEnabled !== undefined) updates.memoryEnabled = Boolean(req.body.memoryEnabled);

    if (req.body.notificationPreferences !== undefined && req.body.notificationPreferences && typeof req.body.notificationPreferences === 'object') {
      const nextNotificationPreferences = {
        ...(currentUser.notificationPreferences || {}),
      };
      const { reminders, tasks, assistantAlerts, general } = req.body.notificationPreferences;
      if (reminders !== undefined) nextNotificationPreferences.reminders = Boolean(reminders);
      if (tasks !== undefined) nextNotificationPreferences.tasks = Boolean(tasks);
      if (assistantAlerts !== undefined) nextNotificationPreferences.assistantAlerts = Boolean(assistantAlerts);
      if (general !== undefined) nextNotificationPreferences.general = Boolean(general);
      updates.notificationPreferences = nextNotificationPreferences;
    }

    if (req.body.preferences !== undefined && req.body.preferences && typeof req.body.preferences === 'object') {
      const nextPreferences = {
        ...(currentUser.preferences || {}),
      };
      const { theme, accentColor, reducedMotion, sound } = req.body.preferences;
      if (theme !== undefined) {
        const allowedThemes = ['light', 'dark', 'system', 'lavender', 'rose', 'sage', 'midnight', 'warm'];
        if (!allowedThemes.includes(String(theme))) {
          return res.status(400).json({ success: false, message: 'Please select a valid theme.' });
        }
        nextPreferences.theme = String(theme);
      }
      if (accentColor !== undefined) {
        const color = String(accentColor || '').trim();
        if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color)) {
          return res.status(400).json({ success: false, message: 'Accent color must be a valid hex code.' });
        }
        nextPreferences.accentColor = color;
      }
      if (reducedMotion !== undefined) nextPreferences.reducedMotion = Boolean(reducedMotion);
      if (sound !== undefined) nextPreferences.sound = Boolean(sound);
      updates.preferences = nextPreferences;
    }

    if (req.body.assistantSettings !== undefined && req.body.assistantSettings && typeof req.body.assistantSettings === 'object') {
      const nextAssistantSettings = {
        ...(currentUser.assistantSettings || {}),
      };
      const { voice, speed, autoSpeak, assistantName, responseStyle, recognitionLanguage } = req.body.assistantSettings;
      if (voice !== undefined) nextAssistantSettings.voice = String(voice).trim() || 'aura-default';
      if (speed !== undefined) {
        const numericSpeed = Number(speed);
        if (Number.isNaN(numericSpeed) || numericSpeed < 0.5 || numericSpeed > 2) {
          return res.status(400).json({ success: false, message: 'Voice speed must be between 0.5 and 2.0.' });
        }
        nextAssistantSettings.speed = numericSpeed;
      }
      if (autoSpeak !== undefined) nextAssistantSettings.autoSpeak = Boolean(autoSpeak);
      if (assistantName !== undefined) {
        const value = String(assistantName || '').trim();
        if (value && value.length > 40) {
          return res.status(400).json({ success: false, message: 'Assistant name cannot exceed 40 characters.' });
        }
        nextAssistantSettings.assistantName = value || 'AURA';
      }
      if (responseStyle !== undefined) {
        const normalized = String(responseStyle).trim().toLowerCase();
        if (!['friendly', 'professional', 'concise', 'detailed', 'casual'].includes(normalized)) {
          return res.status(400).json({ success: false, message: 'Please choose a valid response style.' });
        }
        nextAssistantSettings.responseStyle = normalized;
      }
      if (recognitionLanguage !== undefined) {
        const value = String(recognitionLanguage || '').trim();
        if (!value || value.length > 20) {
          return res.status(400).json({ success: false, message: 'Recognition language is invalid.' });
        }
        nextAssistantSettings.recognitionLanguage = value;
      }
      updates.assistantSettings = nextAssistantSettings;
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: safeUser(user), user: safeUser(user) });
  } catch (error) { return next(error); }
};
