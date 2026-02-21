const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const onboarding = require('../middleware/onboardingMiddleware');
const bookingController = require('../controllers/bookingController');

// All routes require authentication and active status
router.use(authenticate);
router.use(onboarding);

// Member routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.modifyBooking);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
