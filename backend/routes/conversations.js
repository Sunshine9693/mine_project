const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
} = require('../controllers/conversationController');

router.post('/', protect, createConversation);
router.get('/', protect, getConversations);
router.get('/:id', protect, getConversationById);
router.put('/:id', protect, updateConversation);
router.delete('/:id', protect, deleteConversation);

module.exports = router;
