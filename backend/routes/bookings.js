const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
