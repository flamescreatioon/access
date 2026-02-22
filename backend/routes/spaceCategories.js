const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const spaceCategoryController = require('../controllers/spaceCategoryController');

router.use(authenticate);

router.get('/', spaceCategoryController.getAllCategories);
router.post('/', authorizeRole(['Admin', 'Hub Manager']), spaceCategoryController.createCategory);
router.put('/:id', authorizeRole(['Admin', 'Hub Manager']), spaceCategoryController.updateCategory);
router.delete('/:id', authorizeRole(['Admin', 'Hub Manager']), spaceCategoryController.deleteCategory);

module.exports = router;
