const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create Membership (Admin Only)
router.post('/', authenticateToken, authorizeRole(['Admin']), membershipController.createMembership);

// Get All Memberships (Admin Only)
router.get('/', authenticateToken, authorizeRole(['Admin']), membershipController.getAllMemberships);

// Get User Membership
router.get('/user/:userId', authenticateToken, membershipController.getUserMembership);

module.exports = router;
