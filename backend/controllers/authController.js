const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');


// ============================================================
// DATABASE CHECK
// ============================================================

const isDatabaseReady = () => {
  return mongoose.connection.readyState === 1;
};


// ============================================================
// GENERATE JWT + SET COOKIE
// ============================================================

const generateTokenAndSetCookie = (res, userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = jwt.sign(
    { id: userId },
    jwtSecret,
    {
      expiresIn: '7d',
    }
  );

  const cookieOptions = {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: 'lax',

    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie('token', token, cookieOptions);

  return token;
};


// ============================================================
// REGISTER
// POST /api/auth/register
// Public
// ============================================================

exports.register = async (req, res) => {
  try {

    // --------------------------------------------------------
    // Check database connection
    // --------------------------------------------------------

    if (!isDatabaseReady()) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable. Please try again in a moment.',
      });
    }


    // --------------------------------------------------------
    // Read input
    // --------------------------------------------------------

    const name = String(
      req.body?.name || ''
    ).trim();

    const email = String(
      req.body?.email || ''
    ).trim().toLowerCase();

    const password = String(
      req.body?.password || ''
    );


    // --------------------------------------------------------
    // Basic validation
    // --------------------------------------------------------

    if (
      name.length < 2 ||
      name.length > 80 ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid name, email and password.',
      });
    }


    // --------------------------------------------------------
    // Email validation
    // --------------------------------------------------------

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid email address.',
      });
    }


    // --------------------------------------------------------
    // Password validation
    // --------------------------------------------------------

    if (
      password.length < 6 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be between 6 and 128 characters.',
      });
    }


    // --------------------------------------------------------
    // Check existing user
    // --------------------------------------------------------

    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message:
          'A user with this email already exists.',
      });
    }


    // --------------------------------------------------------
    // Hash password
    // --------------------------------------------------------

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );


    // --------------------------------------------------------
    // Create user
    // --------------------------------------------------------

    const user = await User.create({
      name,
      displayName: name,
      email,
      password: hashedPassword,
      timezone: 'Asia/Kolkata',
      language: 'en',
      country: 'India',
      avatar:
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    });


    // --------------------------------------------------------
    // Generate authentication cookie
    // --------------------------------------------------------

    generateTokenAndSetCookie(
      res,
      user._id
    );


    // --------------------------------------------------------
    // Never send password to frontend
    // --------------------------------------------------------

    const safeUser = {
      _id: user._id,
      name: user.name,
      displayName: user.displayName || user.name,
      email: user.email,
      bio: user.bio || '',
      birthday: user.birthday || '',
      timezone: user.timezone || 'Asia/Kolkata',
      language: user.language || 'en',
      country: user.country || 'India',
      avatar: user.avatar,
      preferences: user.preferences,
      assistantSettings: user.assistantSettings,
    };


    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      data: safeUser,
      user: safeUser,
    });

  } catch (error) {

    console.error(
      '[AURA Register Error]:',
      error
    );


    const isDbIssue =
      error?.name === 'MongooseServerSelectionError' ||
      error?.name === 'MongoServerSelectionError' ||
      /ECONNREFUSED|buffering timed out|database/i.test(
        error?.message || ''
      );


    if (isDbIssue) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable. Please try again in a moment.',
      });
    }


    return res.status(500).json({
      success: false,
      message:
        'Server error during registration',
    });
  }
};


// ============================================================
// LOGIN
// POST /api/auth/login
// Public
// ============================================================

exports.login = async (req, res) => {
  try {

    // --------------------------------------------------------
    // Check database connection
    // --------------------------------------------------------

    if (!isDatabaseReady()) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable. Please try again in a moment.',
      });
    }


    // --------------------------------------------------------
    // Read input
    // --------------------------------------------------------

    const email = String(
      req.body?.email || ''
    ).trim().toLowerCase();

    const password = String(
      req.body?.password || ''
    );


    // --------------------------------------------------------
    // Validate input
    // --------------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide email and password.',
      });
    }


    // --------------------------------------------------------
    // Find user
    // --------------------------------------------------------

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }


    // --------------------------------------------------------
    // Compare password
    // --------------------------------------------------------

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }


    // --------------------------------------------------------
    // Generate authentication cookie
    // --------------------------------------------------------

    generateTokenAndSetCookie(
      res,
      user._id
    );


    // --------------------------------------------------------
    // Safe user object
    // --------------------------------------------------------

    const safeUser = {
      _id: user._id,
      name: user.name,
      displayName: user.displayName || user.name,
      email: user.email,
      bio: user.bio || '',
      birthday: user.birthday || '',
      timezone: user.timezone || 'Asia/Kolkata',
      language: user.language || 'en',
      country: user.country || 'India',
      avatar: user.avatar,
      preferences: user.preferences,
      assistantSettings: user.assistantSettings,
    };


    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      data: safeUser,
      user: safeUser,
    });

  } catch (error) {

    console.error(
      '[AURA Login Error]:',
      error
    );


    const isDbIssue =
      error?.name === 'MongooseServerSelectionError' ||
      error?.name === 'MongoServerSelectionError' ||
      /ECONNREFUSED|buffering timed out|database/i.test(
        error?.message || ''
      );


    if (isDbIssue) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable. Please try again in a moment.',
      });
    }


    return res.status(500).json({
      success: false,
      message:
        'Server error during login',
    });
  }
};


// ============================================================
// GET CURRENT USER
// GET /api/auth/me
// Protected
// ============================================================

exports.me = async (req, res) => {
  try {

    const user = await User
      .findById(req.user.id)
      .select('-password');


    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }


    return res.status(200).json({
      success: true,
      data: user,
      user,
    });

  } catch (error) {

    console.error(
      '[AURA Auth Me Error]:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Server error fetching user profile',
    });
  }
};


// ============================================================
// LOGOUT
// POST /api/auth/logout
// Public / Protected
// ============================================================

exports.logout = async (req, res) => {
  try {

    res.cookie('token', '', {
      httpOnly: true,

      expires: new Date(0),

      secure:
        process.env.NODE_ENV === 'production',

      sameSite: 'lax',
    });


    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {

    console.error(
      '[AURA Logout Error]:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Server error during logout',
    });
  }
};