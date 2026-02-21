const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// All routes require authentication
router.use(authenticate);

// Member routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.modifyBooking);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
