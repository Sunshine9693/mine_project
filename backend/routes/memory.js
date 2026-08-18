const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createMemory, getMemory, deleteMemory } = require('../controllers/memoryController');

router.post('/', protect, createMemory);
router.get('/', protect, getMemory);
router.delete('/:id', protect, deleteMemory);

module.exports = router;
