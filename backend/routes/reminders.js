const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  completeReminder,
  deleteReminder,
} = require('../controllers/reminderController');

router.use(protect);
router.post('/', createReminder);
router.get('/', getReminders);
router.get('/:id', getReminderById);
router.put('/:id', updateReminder);
router.patch('/:id/complete', completeReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
