const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aura';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('[AURA DB] Connected successfully to MongoDB'))
  .catch((err) => {
    console.error('[AURA DB] MongoDB connection error:', err.message);
    console.log('[AURA DB] Please ensure MongoDB service is running locally on port 27017');
  });

// Security Middleware
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Global Rate Limiter (Standard)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', globalLimiter);

// Strict Rate Limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const conversationRoutes = require('./routes/conversations');
const memoryRoutes = require('./routes/memory');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/memory', memoryRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AURA API'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AURA API] Server is running on port ${PORT}`);
  console.log(`[AURA API] Allowing requests from ${CLIENT_URL}`);
});
