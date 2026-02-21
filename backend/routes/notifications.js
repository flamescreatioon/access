const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, notificationController.getUserNotifications);
router.put('/read-all', authenticate, notificationController.markAllRead);
router.put('/:id/read', authenticate, notificationController.markRead);

module.exports = router;
