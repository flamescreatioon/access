const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Member Routes
router.get('/certifications', authenticate, equipmentController.getUserCertifications);
router.get('/', authenticate, equipmentController.getAllEquipment);
router.get('/:id', authenticate, equipmentController.getEquipmentById);
router.get('/:id/availability', authenticate, equipmentController.getEquipmentAvailability);
router.post('/:id/book', authenticate, equipmentController.bookEquipment);

// Admin Routes
router.post('/', authenticate, authorizeRole(['Admin']), equipmentController.createEquipment);
router.put('/:id', authenticate, authorizeRole(['Admin']), equipmentController.updateEquipment);
router.delete('/:id', authenticate, authorizeRole(['Admin']), equipmentController.deleteEquipment);

module.exports = router;
