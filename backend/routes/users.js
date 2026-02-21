const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeRole } = require('../middleware/auth');
const onboarding = require('../middleware/onboardingMiddleware');

// Personal user endpoints (require authentication)
router.get('/profile', authenticate, onboarding, userController.getProfile);
router.put('/profile', authenticate, onboarding, userController.updateProfile);
router.get('/sessions', authenticate, onboarding, userController.getSessions);
router.delete('/sessions/:id', authenticate, onboarding, userController.revokeSession);
router.get('/audit-logs', authenticate, onboarding, userController.getAuditLogs);
router.put('/settings', authenticate, onboarding, userController.updateSettings);

// Admin / Hub Manager restriction for general user management
router.use(authenticate);
router.use(authorizeRole(['Admin', 'Hub Manager']));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);

module.exports = router;
