const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
} = require('../controllers/userController');

const router = express.Router();

// Protect all user routes
router.use(protect);

// Get logged-in user's profile
router.get('/me', getProfile);

// Update logged-in user's profile
router.put('/me', updateProfile);

module.exports = router;