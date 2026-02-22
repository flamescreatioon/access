const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/key', pushController.getPublicKey);
router.post('/subscribe', pushController.subscribe);
router.post('/unsubscribe', pushController.unsubscribe);
router.post('/test', pushController.sendTestPush);

module.exports = router;
