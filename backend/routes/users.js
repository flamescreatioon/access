const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Personal user endpoints (require authentication)
router.get('/profile', authenticate, userController.getProfile);
router.get('/sessions', authenticate, userController.getSessions);
router.delete('/sessions/:id', authenticate, userController.revokeSession);
router.get('/audit-logs', authenticate, userController.getAuditLogs);
router.put('/settings', authenticate, userController.updateSettings);

// Admin / Hub Manager restriction for general user management
router.use(authenticate);
router.use(authorizeRole(['Admin', 'Hub Manager']));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);

module.exports = router;
