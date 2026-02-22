const express = require('express');
const router = express.Router();
const equipmentCategoryController = require('../controllers/equipmentCategoryController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Public/Member Routes
router.get('/', authenticate, equipmentCategoryController.getAllCategories);

// Admin / Hub Manager Routes
router.post('/', authenticate, authorizeRole(['Admin', 'Hub Manager']), equipmentCategoryController.createCategory);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Hub Manager']), equipmentCategoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRole(['Admin', 'Hub Manager']), equipmentCategoryController.deleteCategory);

module.exports = router;
