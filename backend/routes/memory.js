const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
	createMemory,
	getMemory,
	getMemoryById,
	updateMemory,
	deleteMemory,
	deleteAllMemory,
} = require('../controllers/memoryController');

router.post('/', protect, createMemory);
router.get('/', protect, getMemory);
router.delete('/', protect, deleteAllMemory);
router.get('/:id', protect, getMemoryById);
router.put('/:id', protect, updateMemory);
router.delete('/:id', protect, deleteMemory);

module.exports = router;
