const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const configController = require('../controllers/bookingConfigController');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorizeRole(['Admin', 'Hub Manager']));

router.get('/', configController.getAllConfigs);
router.get('/:id', configController.getConfigById);
router.post('/', configController.createConfig);
router.put('/:id', configController.updateConfig);
router.delete('/:id', configController.deleteConfig);

module.exports = router;
