const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// All membership routes require authentication
router.use(authenticate);

// Public (Member) Routes
router.get('/user/:userId', membershipController.getUserMembership);
router.get('/history', membershipController.getMembershipHistory);
router.put('/auto-renew', membershipController.toggleAutoRenew);
router.post('/upgrade', membershipController.requestUpgrade);

// Admin Only Routes
router.post('/', authorizeRole(['Admin']), membershipController.createMembership);
router.get('/', authorizeRole(['Admin']), membershipController.getAllMemberships);

module.exports = router;
