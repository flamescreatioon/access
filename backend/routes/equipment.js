const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Member Routes
router.get('/', authenticate, equipmentController.getAllEquipment);
router.get('/:id', authenticate, equipmentController.getEquipmentById);
router.get('/:id/availability', authenticate, equipmentController.getEquipmentAvailability);
router.post('/:id/book', authenticate, equipmentController.bookEquipment);

// Admin / Hub Manager Routes
router.post('/', authenticate, authorizeRole(['Admin', 'Hub Manager']), equipmentController.createEquipment);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Hub Manager']), equipmentController.updateEquipment);

module.exports = router;
