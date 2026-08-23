const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardSummary } = require('../services/productivityService');

router.use(protect);

router.get('/summary', async (req, res) => {
  try {
    const summary = await getDashboardSummary(req.user.id);
    return res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error('[AURA Dashboard Summary Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary' });
  }
});

module.exports = router;
