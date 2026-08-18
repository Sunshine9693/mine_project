const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      default: 'light'
    },
    sound: {
      type: Boolean,
      default: true
    }
  },
  assistantSettings: {
    voice: {
      type: String,
      default: 'aura-default'
    },
    speed: {
      type: Number,
      default: 1.0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
