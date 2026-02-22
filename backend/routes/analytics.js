const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.use(authenticate);
router.use(authorizeRole(['Admin', 'Hub Manager']));

router.get('/stats', analyticsController.getDashboardStats);
router.get('/growth', analyticsController.getGrowthData);
router.get('/trends', analyticsController.getEntryTrends);
router.get('/user-impact', analyticsController.getUserImpact);

module.exports = router;
