const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { authenticate, authorizeRole } = require('../middleware/auth');
const onboarding = require('../middleware/onboardingMiddleware');

// All membership routes require authentication and activation
router.use(authenticate);
router.use(onboarding);

// Public (Member) Routes
router.get('/user/:userId', membershipController.getUserMembership);
router.get('/history', membershipController.getMembershipHistory);
router.get('/tiers', membershipController.getAllTiers);
router.put('/auto-renew', membershipController.toggleAutoRenew);
router.post('/upgrade', membershipController.requestUpgrade);

// Admin Only Routes
router.post('/', authorizeRole(['Admin']), membershipController.createMembership);
router.get('/', authorizeRole(['Admin']), membershipController.getAllMemberships);

module.exports = router;
