// ============================================================
// AURA AI ASSISTANT - BACKEND SERVER
// ============================================================

// Fix Node.js DNS resolution for MongoDB Atlas SRV connection
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from backend/.env
require('dotenv').config({
  path: path.join(__dirname, '.env'),
});


// ============================================================
// APP INITIALIZATION
// ============================================================

const app = express();

const DEFAULT_PORT = 5002;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const CLIENT_URL =
  process.env.CLIENT_URL || 'http://localhost:5173';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/aura';

const configuredOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
].flatMap((origin) =>
  (origin || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
);


// ============================================================
// ALLOWED FRONTEND ORIGINS
// ============================================================

const allowedClientOrigins = new Set(configuredOrigins);


// ============================================================
// ENVIRONMENT CHECKS
// ============================================================

if (!process.env.GEMINI_API_KEY?.trim()) {
  console.warn(
    '[AURA AI] GEMINI_API_KEY is missing. Add it to backend/.env and restart the backend.'
  );
} else {
  console.log('[AURA AI] Gemini API key loaded successfully.');
}


// ============================================================
// MONGODB ATLAS CONNECTION
// ============================================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[AURA DB] Connected successfully to MongoDB Atlas');
  })
  .catch((err) => {
    console.error(
      '[AURA DB] MongoDB connection error:',
      err.message
    );

    console.error(
      '[AURA DB] Please check your MongoDB Atlas connection, credentials, and network access.'
    );
  });


// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

app.use(helmet());

app.use(cookieParser());


// ============================================================
// CORS CONFIGURATION
// ============================================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      // Example: Postman, curl, server-to-server requests
      if (!origin || allowedClientOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error('Origin is not allowed by AURA CORS policy')
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);


// ============================================================
// BODY PARSER
// ============================================================

app.use(express.json());


// ============================================================
// GLOBAL API RATE LIMITER
// ============================================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
});

app.use('/api', globalLimiter);


// ============================================================
// AUTHENTICATION RATE LIMITER
// ============================================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 15,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message:
      'Too many authentication attempts, please try again after 15 minutes.',
  },
});


// ============================================================
// AI RATE LIMITER
// ============================================================

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: 30,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many AI requests. Please try again shortly.',
  },
});


// Apply authentication rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);


// Apply AI rate limiting
app.use('/api/ai', aiLimiter);


// ============================================================
// ROUTES
// ============================================================

const authRoutes = require('./routes/auth');

const aiRoutes = require('./routes/ai');

const conversationRoutes =
  require('./routes/conversations');

const memoryRoutes =
  require('./routes/memory');

const noteRoutes =
  require('./routes/notes');

const taskRoutes =
  require('./routes/tasks');

const reminderRoutes =
  require('./routes/reminders');

const productivityRoutes =
  require('./routes/productivity');

const analyticsRoutes =
  require('./routes/analytics');

const informationRoutes =
  require('./routes/information');

const userRoutes =
  require('./routes/users');

const errorMiddleware =
  require('./middleware/errorMiddleware');


// ============================================================
// AUTH ROUTES
// ============================================================

app.use(
  '/api/auth',
  authRoutes
);


// ============================================================
// AI ROUTES
// ============================================================

app.use(
  '/api/ai',
  aiRoutes
);


// ============================================================
// CONVERSATION ROUTES
// ============================================================

app.use(
  '/api/conversations',
  conversationRoutes
);


// ============================================================
// MEMORY ROUTES
// ============================================================

app.use(
  '/api/memory',
  memoryRoutes
);


// ============================================================
// NOTES ROUTES
// ============================================================

app.use(
  '/api/notes',
  noteRoutes
);


// ============================================================
// TASK ROUTES
// ============================================================

app.use(
  '/api/tasks',
  taskRoutes
);


// ============================================================
// REMINDER ROUTES
// ============================================================

app.use(
  '/api/reminders',
  reminderRoutes
);


// ============================================================
// PRODUCTIVITY / DASHBOARD ROUTES
// ============================================================

app.use(
  '/api/dashboard',
  productivityRoutes
);


// ============================================================
// ANALYTICS / ACTIVITY / PRIVACY ROUTES
// ============================================================

app.use(
  '/api/analytics',
  analyticsRoutes
);


// ============================================================
// USER ROUTES
// ============================================================

app.use(
  '/api/users',
  userRoutes
);


// ============================================================
// INFORMATION SERVICE RATE LIMITER
// ============================================================

const informationLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Information service is temporarily rate limited. Please try again shortly.',
  },
});


// ============================================================
// INFORMATION SERVICE ROUTES
// ============================================================

app.use(
  [
    '/api/weather',
    '/api/search',
    '/api/translate',
    '/api/utilities/weather',
    '/api/utilities/search',
    '/api/utilities/translate',
  ],
  informationLimiter
);


// Utility routes
app.use(
  '/api/utilities',
  informationRoutes
);


// Public health check should remain available without auth.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AURA API',
  });
});

// General information routes
app.use(
  '/api',
  informationRoutes
);


// ============================================================
// ERROR HANDLING
// ============================================================

app.use(errorMiddleware);


// ============================================================
// START SERVER
// ============================================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `[AURA API] Server is running on port ${PORT}`
    );

    console.log(
      `[AURA API] Allowing requests from ${CLIENT_URL}`
    );
  });
}

module.exports = app;