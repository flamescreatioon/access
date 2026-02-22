const { Booking, User, Space, Equipment, Membership, AccessTier, Sequelize } = require('../models');
const { Op } = Sequelize;
const { format } = require('date-fns');

// POST /api/v1/bookings — Create a booking with full validation
exports.createBooking = async (req, res) => {
    const t = await Booking.sequelize.transaction();
    try {
        const { space_id, start_time, end_time, title, notes } = req.body;
        const user_id = req.user.id;

        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start >= end) {
            await t.rollback();
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // 1. Verify space exists
        const space = await Space.findByPk(space_id, { transaction: t });
        if (!space || !space.is_active) {
            await t.rollback();
            return res.status(404).json({ message: 'Space not found or inactive' });
        }

        // 2. Check tier requirement
        if (space.min_tier_id) {
            const membership = await Membership.findOne({
                where: { user_id, status: 'Active' },
                include: [AccessTier],
                transaction: t
            });

            if (!membership) {
                await t.rollback();
                return res.status(403).json({ message: 'No active membership. Cannot book spaces.' });
            }

            if (membership.tier_id < space.min_tier_id) {
                await t.rollback();
                return res.status(403).json({
                    message: `This space requires ${space.MinTier?.name || 'a higher'} tier or above`,
                });
            }
        }

        // 3. Check for time conflicts (Double-booking prevention with Transaction)
        const conflict = await Booking.findOne({
            where: {
                space_id,
                status: { [Op.in]: ['confirmed', 'pending'] },
                [Op.or]: [{
                    start_time: { [Op.lt]: end },
                    end_time: { [Op.gt]: start },
                }],
            },
            lock: true, // Row-level lock to prevent race conditions
            transaction: t
        });

        if (conflict) {
            await t.rollback();
            return res.status(409).json({ message: 'This space is already reserved for the selected time' });
        }

        // 4. Check monthly booking cap
        const membership = await Membership.findOne({
            where: { user_id, status: 'Active' },
            include: [AccessTier],
            transaction: t
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
                    transaction: t
                });

                const durationHours = (end - start) / 3600000;
                const usedHours = monthBookings.reduce((sum, b) => {
                    return sum + (new Date(b.end_time) - new Date(b.start_time)) / 3600000;
                }, 0);

                if (usedHours + durationHours > maxHours) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `Monthly booking limit reached (${maxHours}hrs). Used: ${usedHours.toFixed(1)}hrs`,
                    });
                }
            }
        }

        // 5. Create booking
        const isAdminAction = ['Admin', 'Hub Manager'].includes(req.user.role);
        const initialStatus = isAdminAction ? 'confirmed' : 'pending';

        const booking = await Booking.create({
            user_id,
            space_id,
            type: 'space',
            title: title || space.name,
            notes,
            start_time: start,
            end_time: end,
            status: initialStatus,
        }, { transaction: t });

        await t.commit();

        const fullBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Space },
                { model: User, attributes: ['id', 'name', 'email'] },
            ],
        });

        // Trigger notification
        const notificationController = require('./notificationController');
        const statusLabel = initialStatus === 'confirmed' ? 'Confirmed' : 'Awaiting Approval';
        const statusBody = initialStatus === 'confirmed'
            ? `Your booking for ${space.name} has been confirmed for ${format(start, 'MMM d, h:mm a')}.`
            : `Your booking for ${space.name} has been received and is awaiting admin approval.`;

        await notificationController.createNotification({
            user_id: user_id,
            title: `Space Booking ${statusLabel}`,
            body: statusBody,
            type: 'booking',
            data: { booking_id: booking.id, space_id: space.id }
        });

        res.status(201).json(fullBooking);
    } catch (error) {
        if (t) await t.rollback();
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

// Admin: GET /api/v1/bookings/admin/all — Get all bookings for all users
exports.getAllBookings = async (req, res) => {
    try {
        const { status, type } = req.query;
        const where = {};

        if (status) where.status = status;
        if (type) where.type = type;

        const bookings = await Booking.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Space, attributes: ['id', 'name', 'type', 'location'] },
                { model: Equipment, attributes: ['id', 'name', 'location'] },
            ],
            order: [['start_time', 'DESC']],
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all bookings', error: error.message });
    }
};

// Admin: PATCH /api/v1/bookings/admin/:id/status — Update any booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const booking = await Booking.findByPk(id, {
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Space },
                { model: Equipment }
            ]
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const oldStatus = booking.status;
        await booking.update({
            status,
            cancel_reason: status === 'cancelled' ? (reason || 'Admin action') : booking.cancel_reason
        });

        // Notify user of status change
        const notificationController = require('./notificationController');
        const resourceName = booking.Space?.name || booking.Equipment?.name || 'Resource';

        await notificationController.createNotification({
            user_id: booking.user_id,
            title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            body: `Your booking for ${resourceName} on ${format(new Date(booking.start_time), 'MMM d')} has been ${status}.`,
            type: 'booking',
            data: { booking_id: booking.id }
        });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error: error.message });
    }
};
