const { Booking, User, Space, Equipment, Membership, AccessTier, Sequelize } = require('../models');
const { Op } = Sequelize;
const { format } = require('date-fns');

// POST /api/v1/bookings — Create a booking with full validation
exports.createBooking = async (req, res) => {
    try {
        const { space_id, start_time, end_time, title, notes } = req.body;
        const user_id = req.user.id;

        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start >= end) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // 1. Verify space exists
        const space = await Space.findByPk(space_id);
        if (!space || !space.is_active) {
            return res.status(404).json({ message: 'Space not found or inactive' });
        }

        // 2. Check tier requirement
        if (space.min_tier_id) {
            const membership = await Membership.findOne({
                where: { user_id, status: 'Active' },
                include: [AccessTier],
            });

            if (!membership) {
                return res.status(403).json({ message: 'No active membership. Cannot book spaces.' });
            }

            // Compare tier level (higher tier_id = higher tier in our system)
            if (membership.tier_id < space.min_tier_id) {
                return res.status(403).json({
                    message: `This space requires ${space.MinTier?.name || 'a higher'} tier or above`,
                });
            }
        }

        // 3. Check max booking hours per session
        const durationHours = (end - start) / 3600000;
        if (space.max_booking_hours > 0 && durationHours > space.max_booking_hours) {
            return res.status(400).json({
                message: `Max booking duration is ${space.max_booking_hours} hours for this space`,
            });
        }

        // 4. Check for time conflicts (double-booking prevention)
        const conflict = await Booking.findOne({
            where: {
                space_id,
                status: { [Op.in]: ['confirmed', 'pending'] },
                [Op.or]: [{
                    start_time: { [Op.lt]: end },
                    end_time: { [Op.gt]: start },
                }],
            },
        });

        if (conflict) {
            return res.status(409).json({ message: 'This space is already booked for the selected time' });
        }

        // 5. Check monthly booking cap
        const membership = await Membership.findOne({
            where: { user_id, status: 'Active' },
            include: [AccessTier],
        });

        if (membership && membership.AccessTier) {
            const maxHours = membership.AccessTier.max_booking_hours;
            if (maxHours > 0) {
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                const monthBookings = await Booking.findAll({
                    where: {
                        user_id,
                        type: 'space',
                        status: { [Op.in]: ['confirmed', 'pending', 'completed'] },
                        start_time: { [Op.gte]: monthStart },
                    },
                });

                const usedHours = monthBookings.reduce((sum, b) => {
                    return sum + (new Date(b.end_time) - new Date(b.start_time)) / 3600000;
                }, 0);

                if (usedHours + durationHours > maxHours) {
                    return res.status(400).json({
                        message: `Monthly booking limit reached (${maxHours}hrs). Used: ${usedHours.toFixed(1)}hrs`,
                    });
                }
            }
        }

        // 6. Check overlapping bookings for this user
        const userOverlap = await Booking.findOne({
            where: {
                user_id,
                type: 'space',
                status: { [Op.in]: ['confirmed', 'pending'] },
                [Op.or]: [{
                    start_time: { [Op.lt]: end },
                    end_time: { [Op.gt]: start },
                }],
            },
        });

        if (userOverlap) {
            return res.status(409).json({ message: 'You already have a booking during this time' });
        }

        // 7. Create booking
        const booking = await Booking.create({
            user_id,
            space_id,
            type: 'space',
            title: title || space.name,
            notes,
            start_time: start,
            end_time: end,
            status: 'confirmed',
        });

        const fullBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Space },
                { model: User, attributes: ['id', 'name', 'email'] },
            ],
        });

        // Trigger notification
        const notificationController = require('./notificationController');
        await notificationController.createNotification({
            user_id: user_id,
            title: 'Space Booking Confirmed',
            body: `Your booking for ${space.name} has been confirmed for ${format(start, 'MMM d, h:mm a')}.`,
            type: 'booking',
            data: { booking_id: booking.id, space_id: space.id }
        });

        res.status(201).json(fullBooking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// GET /api/v1/bookings — Get user's bookings (upcoming + past)
exports.getUserBookings = async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        const where = { user_id: req.user.id };

        if (status) where.status = status;

        if (upcoming === 'true') {
            where.start_time = { [Op.gte]: new Date() };
            where.status = { [Op.in]: ['confirmed', 'pending'] };
        }

        const bookings = await Booking.findAll({
            where,
            include: [
                { model: Space, attributes: ['id', 'name', 'type', 'location', 'floor', 'photos'] },
                { model: Equipment, attributes: ['id', 'name', 'category', 'photo', 'location'] },
            ],
            order: [['start_time', upcoming === 'true' ? 'ASC' : 'DESC']],
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

// GET /api/v1/bookings/:id — Single booking detail
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: Space },
                { model: User, attributes: ['id', 'name', 'email'] },
            ],
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
};

// PUT /api/v1/bookings/:id — Modify booking (time only)
exports.modifyBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (booking.status !== 'confirmed' && booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only active bookings can be modified' });
        }

        const { start_time, end_time, title, notes } = req.body;
        const start = start_time ? new Date(start_time) : booking.start_time;
        const end = end_time ? new Date(end_time) : booking.end_time;

        // Check for conflicts (excluding this booking)
        const conflict = await Booking.findOne({
            where: {
                id: { [Op.ne]: booking.id },
                space_id: booking.space_id,
                status: { [Op.in]: ['confirmed', 'pending'] },
                [Op.or]: [{
                    start_time: { [Op.lt]: end },
                    end_time: { [Op.gt]: start },
                }],
            },
        });

        if (conflict) {
            return res.status(409).json({ message: 'Time conflict with another booking' });
        }

        await booking.update({
            start_time: start,
            end_time: end,
            title: title || booking.title,
            notes: notes !== undefined ? notes : booking.notes,
        });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error modifying booking', error: error.message });
    }
};

// DELETE /api/v1/bookings/:id — Cancel booking (with cancellation window)
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body || {};
        const booking = await Booking.findByPk(id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        // Check cancellation window (2 hours before start for non-admin)
        const hoursUntilStart = (new Date(booking.start_time) - new Date()) / 3600000;
        const isLateCancellation = hoursUntilStart < 2 && req.user.role !== 'Admin';

        await booking.update({
            status: 'cancelled',
            cancelled_at: new Date(),
            cancel_reason: reason || (isLateCancellation ? 'Late cancellation' : 'User cancelled'),
        });

        res.json({
            message: 'Booking cancelled',
            late_cancellation: isLateCancellation,
            warning: isLateCancellation ? 'Late cancellation recorded. Repeated late cancellations may result in booking restrictions.' : null,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
};
