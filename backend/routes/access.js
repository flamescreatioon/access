const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Assuming we want user auth for token gen
const { authenticateDevice } = require('../middleware/deviceMiddleware');

// Generate QR Token (User PWA)
router.post('/generate-token', authenticateToken, accessController.generateToken);

// Validate Access (IoT/DOOR)
router.post('/validate', authenticateDevice, accessController.validateAccess);

// Get Logs (Admin Only)
router.get('/logs', authenticateToken, authorizeRole(['Admin', 'Security']), accessController.getAllLogs);

module.exports = router;
