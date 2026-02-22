const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const onboarding = require('../middleware/onboardingMiddleware');
const { authenticateDevice } = require('../middleware/deviceMiddleware');

// Generate QR Token (User PWA)
// Generate QR Token (User PWA)
router.post('/generate-token', authenticateToken, onboarding, accessController.generateToken);

// Validate Access (IoT/DOOR)
router.post('/validate', authenticateDevice, accessController.validateAccess);

// Get Logs (Admin Only)
router.get('/my-last-scan', authenticateToken, accessController.myLastScan);
router.get('/logs', authenticateToken, authorizeRole(['Admin', 'Security']), accessController.getAllLogs);

// Access Rule Management (Admin Only)
router.get('/rules', authenticateToken, authorizeRole(['Admin']), accessController.getAllRules);
router.post('/rules', authenticateToken, authorizeRole(['Admin']), accessController.createRule);
router.put('/rules/:id', authenticateToken, authorizeRole(['Admin']), accessController.updateRule);
router.delete('/rules/:id', authenticateToken, authorizeRole(['Admin']), accessController.deleteRule);

module.exports = router;
