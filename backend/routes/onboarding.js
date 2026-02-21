const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/status', authenticateToken, onboardingController.getOnboardingStatus);
router.post('/complete/:stepId', authenticateToken, onboardingController.completeStep);

// Admin bypass/activation
router.put('/admin/activate/:userId', authenticateToken, authorizeRole(['Admin', 'Hub Manager']), onboardingController.adminActivateUser);

module.exports = router;
