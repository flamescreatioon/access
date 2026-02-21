const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const onboarding = require('../middleware/onboardingMiddleware');

// All scan routes require authentication and activation
router.use(authenticateToken);
router.use(onboarding);

// Hub Manager scans
router.post('/validate', authorizeRole(['Hub Manager', 'Admin']), scanController.validateScan);
router.post('/decision', authorizeRole(['Hub Manager', 'Admin']), scanController.logDecision);
router.get('/recent', authorizeRole(['Hub Manager', 'Admin']), scanController.getRecentScans);
router.get('/stats', authorizeRole(['Hub Manager', 'Admin']), scanController.getScanStats);

module.exports = router;
