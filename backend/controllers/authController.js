const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token and set cookie
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'aura-default-development-secret-key-987654',
    { expiresIn: '7d' }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Lax works well in local development, strict can be used for API-first
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);
  return token;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    });

    // Generate token and set HTTP cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        assistantSettings: user.assistantSettings
      }
    });

  } catch (error) {
    console.error('[AURA Register Error]:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and set HTTP cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        assistantSettings: user.assistantSettings
      }
    });

  } catch (error) {
    console.error('[AURA Login Error]:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[AURA Auth Me Error]:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private/Public
exports.logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[AURA Logout Error]:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};
