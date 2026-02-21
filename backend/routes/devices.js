const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All device routes require authentication
router.use(authenticateToken);

// Hub Manager routes
router.post('/register', authorizeRole(['Hub Manager', 'Admin']), deviceController.registerDevice);
router.get('/my-device', authorizeRole(['Hub Manager', 'Admin']), deviceController.getMyDevice);

// Admin routes
router.get('/', authorizeRole(['Admin', 'Hub Manager']), deviceController.getAllDevices);
router.put('/:id/activate', authorizeRole(['Admin']), deviceController.activateDevice);
router.put('/:id/suspend', authorizeRole(['Admin']), deviceController.suspendDevice);
router.put('/:id/revoke', authorizeRole(['Admin']), deviceController.revokeDevice);

module.exports = router;
