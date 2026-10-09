const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getOverview } = require('../services/analyticsService');

const router = express.Router();

router.use(protect);

router.get('/overview', async (req, res) => {
  try {
    const analytics = await getOverview(req.user.id);
    return res.status(200).json({ success: true, ...analytics });
  } catch (error) {
    console.error('[AURA Analytics Overview Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics overview' });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const analytics = await getOverview(req.user.id);
    return res.status(200).json({ success: true, activity: analytics.activity });
  } catch (error) {
    console.error('[AURA Activity Feed Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch activity history' });
  }
});

router.get('/privacy', async (req, res) => {
  try {
    const analytics = await getOverview(req.user.id);
    return res.status(200).json({ success: true, privacy: analytics.privacy });
  } catch (error) {
    console.error('[AURA Privacy Overview Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch privacy settings' });
  }
});

module.exports = router;
