const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
} = require('../controllers/noteController');

router.use(protect);
router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.patch('/:id/pin', togglePinNote);
router.delete('/:id', deleteNote);

module.exports = router;
