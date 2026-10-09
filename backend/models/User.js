const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    // ========================================================
    // USER NAME
    // ========================================================

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    displayName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Display name cannot exceed 80 characters'],
    },

    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    birthday: {
      type: String,
      trim: true,
      default: '',
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        'Birthday must use YYYY-MM-DD format',
      ],
    },

    timezone: {
      type: String,
      trim: true,
      default: 'Asia/Kolkata',
    },

    language: {
      type: String,
      trim: true,
      default: 'en',
      maxlength: [20, 'Language code cannot exceed 20 characters'],
    },

    country: {
      type: String,
      trim: true,
      default: 'India',
      maxlength: [80, 'Country cannot exceed 80 characters'],
    },


    // ========================================================
    // EMAIL
    // ========================================================

    email: {
      type: String,
      required: [true, 'Email is required'],

      unique: true,

      lowercase: true,

      trim: true,

      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },


    // ========================================================
    // PASSWORD
    // ========================================================

    // IMPORTANT:
    // The password stored here is already bcrypt-hashed.
    // Plain-text passwords must NEVER be stored in MongoDB.

    password: {
      type: String,

      required: [true, 'Password is required'],

      minlength: [
        6,
        'Password must be at least 6 characters',
      ],
    },


    // ========================================================
    // AVATAR
    // ========================================================

    avatar: {
      type: String,
      default: '',
    },


    // ========================================================
    // USER PREFERENCES
    // ========================================================

    preferences: {
      theme: {
        type: String,
        default: 'system',
        enum: ['light', 'dark', 'system', 'lavender', 'rose', 'sage', 'midnight', 'warm'],
      },

      accentColor: {
        type: String,
        default: '#9B5DE5',
        match: [/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Accent color must be a valid hex color'],
      },

      reducedMotion: {
        type: Boolean,
        default: false,
      },

      sound: {
        type: Boolean,
        default: true,
      },
    },

    communicationStyle: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'friendly',
      enum: ['friendly', 'professional', 'concise', 'detailed', 'casual'],
    },

    personality: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'friendly',
      enum: ['friendly', 'professional', 'concise', 'detailed', 'casual'],
    },

    theme: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'system',
      enum: ['light', 'dark', 'system'],
    },

    voiceEnabled: {
      type: Boolean,
      default: true,
    },

    memoryEnabled: {
      type: Boolean,
      default: true,
    },

    notificationPreferences: {
      reminders: {
        type: Boolean,
        default: true,
      },
      tasks: {
        type: Boolean,
        default: true,
      },
      assistantAlerts: {
        type: Boolean,
        default: true,
      },
      general: {
        type: Boolean,
        default: true,
      },
    },

    // ========================================================
    // AURA ASSISTANT SETTINGS
    // ========================================================

    assistantSettings: {
      voice: {
        type: String,
        default: 'aura-default',
      },

      speed: {
        type: Number,
        default: 1.0,

        min: [0.5, 'Voice speed cannot be below 0.5'],

        max: [2.0, 'Voice speed cannot exceed 2.0'],
      },

      autoSpeak: {
        type: Boolean,
        default: false,
      },

      assistantName: {
        type: String,
        trim: true,
        default: 'AURA',
        maxlength: [40, 'Assistant name cannot exceed 40 characters'],
      },

      responseStyle: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'friendly',
        enum: ['friendly', 'professional', 'concise', 'detailed', 'casual'],
      },

      recognitionLanguage: {
        type: String,
        trim: true,
        default: 'en-US',
        maxlength: [20, 'Recognition language cannot exceed 20 characters'],
      },
    },
  },


  // ==========================================================
  // AUTOMATIC TIMESTAMPS
  // ==========================================================

  {
    timestamps: true,
  }
);


// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model(
  'User',
  UserSchema
);