const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const cafeController = require('../controllers/cafeController');

router.get('/', authenticate, cafeController.getAllItems);
router.get('/:id', authenticate, cafeController.getItemById);

// Admin only routes
router.post('/', authenticate, authorizeRole(['Admin', 'Hub Manager']), cafeController.createItem);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Hub Manager']), cafeController.updateItem);
router.delete('/:id', authenticate, authorizeRole(['Admin', 'Hub Manager']), cafeController.deleteItem);

module.exports = router;
