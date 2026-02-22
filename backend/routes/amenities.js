const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const amenityController = require('../controllers/amenityController');

router.use(authenticate);

router.get('/', amenityController.getAllAmenities);
router.post('/', authorizeRole(['Admin', 'Hub Manager']), amenityController.createAmenity);
router.put('/:id', authorizeRole(['Admin', 'Hub Manager']), amenityController.updateAmenity);
router.delete('/:id', authorizeRole(['Admin', 'Hub Manager']), amenityController.deleteAmenity);

module.exports = router;
