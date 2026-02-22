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
router.put('/:id/suspend', authorizeRole(['Admin']), membershipController.suspendMember);
router.put('/:id/reactivate', authorizeRole(['Admin']), membershipController.reactivateMember);
router.put('/:id/tier', authorizeRole(['Admin']), membershipController.updateMemberTier);

// Access Tier Management
router.post('/tiers', authorizeRole(['Admin']), membershipController.createTier);
router.put('/tiers/:id', authorizeRole(['Admin']), membershipController.updateTier);
router.delete('/tiers/:id', authorizeRole(['Admin']), membershipController.deleteTier);

module.exports = router;
