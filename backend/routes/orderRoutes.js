const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.use(authenticate);

// Admin routes (Put before parameterized routes to avoid matching IDs)
router.get('/admin/all', authorizeRole(['Admin', 'Hub Manager']), orderController.getAllOrders);
router.get('/admin/stats', authorizeRole(['Admin', 'Hub Manager']), orderController.getDashboardStats);
router.patch('/admin/:id/status', authorizeRole(['Admin', 'Hub Manager']), orderController.updateOrderStatus);

// User routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
