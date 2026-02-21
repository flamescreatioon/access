const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const spaceController = require('../controllers/spaceController');

// All routes require authentication
router.use(authenticate);

// Member routes
router.get('/', spaceController.getAllSpaces);
router.get('/:id', spaceController.getSpaceById);
router.get('/:id/availability', spaceController.getSpaceAvailability);

// Admin routes
router.post('/', authorizeRole(['Admin']), spaceController.createSpace);
router.put('/:id', authorizeRole(['Admin']), spaceController.updateSpace);

module.exports = router;
