const express = require('express');
const router = express.Router();
const { register, login, me, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, me);
router.post('/logout', logout);

module.exports = router;
