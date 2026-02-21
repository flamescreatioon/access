const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// User endpoints
router.get('/status', authenticateToken, onboardingController.getOnboardingStatus);
router.put('/confirm-details', authenticateToken, onboardingController.confirmDetails);
router.put('/select-role', authenticateToken, onboardingController.selectRole);
router.put('/confirm-payment-contact', authenticateToken, onboardingController.confirmPaymentContact);
router.post('/complete/:stepId', authenticateToken, onboardingController.completeStep);

// Admin endpoints
router.put('/admin/approve/:userId', authenticateToken, authorizeRole(['Admin', 'Hub Manager']), onboardingController.adminApprove);
router.put('/admin/reject/:userId', authenticateToken, authorizeRole(['Admin', 'Hub Manager']), onboardingController.adminReject);

module.exports = router;
