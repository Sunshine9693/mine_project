const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aura';
const allowedClientOrigins = new Set([
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);

if (!process.env.GEMINI_API_KEY?.trim()) {
  console.warn('[AURA AI] GEMINI_API_KEY is missing. Add it to backend/.env and restart the backend.');
} else {
  console.log('[AURA AI] Gemini API key loaded successfully.');

}

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
  origin: (origin, callback) => {
    if (!origin || allowedClientOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by AURA CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests. Please try again shortly.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter);

// Routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const conversationRoutes = require('./routes/conversations');
const memoryRoutes = require('./routes/memory');
const noteRoutes = require('./routes/notes');
const taskRoutes = require('./routes/tasks');
const reminderRoutes = require('./routes/reminders');
const productivityRoutes = require('./routes/productivity');
const informationRoutes = require('./routes/information');
const userRoutes = require('./routes/users');
const errorMiddleware = require('./middleware/errorMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/dashboard', productivityRoutes);
app.use('/api/users', userRoutes);

const informationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Information service is temporarily rate limited. Please try again shortly.' },
});
app.use(['/api/weather', '/api/search', '/api/translate'], informationLimiter);
app.use('/api', informationRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AURA API'
  });
});

app.use(errorMiddleware);

// Start Server
app.listen(PORT, () => {
  console.log(`[AURA API] Server is running on port ${PORT}`);
  console.log(`[AURA API] Allowing requests from ${CLIENT_URL}`);
});
