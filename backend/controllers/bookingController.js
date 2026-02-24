const { Booking, User, Space, Equipment, Membership, AccessTier, Sequelize } = require('../models');
const { Op } = Sequelize;
const { format } = require('date-fns');
const { validateBookingRequest } = require('../services/bookingFairnessEngine');
const { addToWaitlist, processWaitlist, claimSlot } = require('../services/waitlistService');
const { getEffectiveConfig } = require('../services/bookingFairnessEngine');

// POST /api/v1/bookings — Create a booking with full fairness validation
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

        // 1b. Restrict visibility for non-admins
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'Hub Manager';
        const restrictedNames = ['Admin Office', 'Tech Transfer Office', 'Server room', 'Admin office', 'Tech transfer office'];
        if (!isAdmin && restrictedNames.includes(space.name)) {
            await t.rollback();
            return res.status(403).json({ message: 'Access denied: restricted space' });
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

        // 3. Run fairness engine (Layers 1-6)
        const fairnessResult = await validateBookingRequest({
            user_id,
            resource_type: 'space',
            resource_id: space_id,
            start,
            end,
            transaction: t,
            req,
            is_admin: isAdmin,
        });

        if (!fairnessResult.valid) {
            await t.rollback();
            return res.status(fairnessResult.statusCode || 400).json({
                message: fairnessResult.message,
                rule: fairnessResult.rule,
            });
        }

        // 4. Create booking
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

        res.status(201).json({
            ...fullBooking.toJSON(),
            warning: fairnessResult.warning || null,
        });
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
                { model: Space, attributes: ['id', 'name', 'type', 'location', 'photos'] },
                { model: Equipment, attributes: ['id', 'name', 'category', 'photo', 'location'] },
            ],
            order: [['start_time', upcoming === 'true' ? 'ASC' : 'DESC']],
        });

        const isAdmin = req.user.role === 'Admin' || req.user.role === 'Hub Manager';
        const restrictedNames = ['Admin Office', 'Tech Transfer Office', 'Server room', 'Admin office', 'Tech transfer office'];

        let result = bookings;
        if (!isAdmin) {
            result = bookings.filter(b => !b.Space || !restrictedNames.includes(b.Space.name));
        }

        res.json(result);
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
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
};

// PUT /api/v1/bookings/:id — Modify booking (time only) with fairness re-validation
exports.modifyBooking = async (req, res) => {
    const t = await Booking.sequelize.transaction();
    try {
        const booking = await Booking.findByPk(req.params.id, { transaction: t });
        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user_id !== req.user.id && req.user.role !== 'Admin') {
            await t.rollback();
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'confirmed' && booking.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: 'Only active bookings can be modified' });
        }

        if (new Date(booking.start_time) < new Date()) {
            await t.rollback();
            return res.status(400).json({ message: 'Cannot modify a booking that has already started or is in the past' });
        }

        const { start_time, end_time, title, notes } = req.body;
        const start = start_time ? new Date(start_time) : booking.start_time;
        const end = end_time ? new Date(end_time) : booking.end_time;

        const isAdmin = req.user.role === 'Admin' || req.user.role === 'Hub Manager';

        // Determine resource type and id
        const resource_type = booking.type || 'space';
        const resource_id = resource_type === 'space' ? booking.space_id : booking.equipment_id;

        // Re-validate through fairness engine (excluding current booking)
        const fairnessResult = await validateBookingRequest({
            user_id: booking.user_id,
            resource_type,
            resource_id,
            start: new Date(start),
            end: new Date(end),
            transaction: t,
            req,
            exclude_booking_id: booking.id,
            is_admin: isAdmin,
        });

        if (!fairnessResult.valid) {
            await t.rollback();
            return res.status(fairnessResult.statusCode || 400).json({
                message: fairnessResult.message,
                rule: fairnessResult.rule,
            });
        }

        await booking.update({
            start_time: start,
            end_time: end,
            title: title || booking.title,
            notes: notes !== undefined ? notes : booking.notes,
        }, { transaction: t });

        await t.commit();

        res.json({
            ...booking.toJSON(),
            warning: fairnessResult.warning || null,
        });
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: 'Error modifying booking', error: error.message });
    }
};

// DELETE /api/v1/bookings/:id — Cancel booking (with cancellation window + waitlist processing)
exports.cancelBooking = async (req, res) => {
    const t = await Booking.sequelize.transaction();
    try {
        const { id } = req.params;
        const { reason } = req.body || {};
        const booking = await Booking.findByPk(id, { transaction: t });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user_id !== req.user.id && req.user.role !== 'Admin') {
            await t.rollback();
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            await t.rollback();
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        if (new Date(booking.start_time) < new Date()) {
            await t.rollback();
            return res.status(400).json({ message: 'Cannot cancel a booking that has already started or is in the past' });
        }

        // Check cancellation window (2 hours before start for non-admin)
        const hoursUntilStart = (new Date(booking.start_time) - new Date()) / 3600000;
        const isLateCancellation = hoursUntilStart < 2 && req.user.role !== 'Admin';

        await booking.update({
            status: 'cancelled',
            cancelled_at: new Date(),
            cancel_reason: reason || (isLateCancellation ? 'Late cancellation' : 'User cancelled'),
        }, { transaction: t });

        // Process waitlist for this slot
        const resource_type = booking.type || 'space';
        const resource_id = resource_type === 'space' ? booking.space_id : booking.equipment_id;

        try {
            const config = await getEffectiveConfig(resource_type, resource_id);
            if (config.waitlist_enabled) {
                const offered = await processWaitlist(
                    resource_type,
                    resource_id,
                    booking.start_time,
                    booking.end_time,
                    t
                );

                if (offered) {
                    // Notify the waitlisted user
                    const notificationController = require('./notificationController');
                    await notificationController.createNotification({
                        user_id: offered.user_id,
                        title: 'Slot Available!',
                        body: `A slot you were waiting for is now available. Claim it within ${config.waitlist_claim_minutes} minutes.`,
                        type: 'waitlist',
                        data: { waitlist_id: offered.id, resource_type, resource_id }
                    });
                }
            }
        } catch (waitlistErr) {
            console.error('Waitlist processing error (non-fatal):', waitlistErr);
        }

        await t.commit();

        res.json({
            message: 'Booking cancelled',
            late_cancellation: isLateCancellation,
            warning: isLateCancellation ? 'Late cancellation recorded. Repeated late cancellations may result in booking restrictions.' : null,
        });
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
};

// POST /api/v1/bookings/:id/check-in — Member check-in (for no-show tracking)
exports.checkInBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Allow check-in by the user or admin
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'Hub Manager';
        if (booking.user_id !== req.user.id && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Only confirmed bookings can be checked in' });
        }

        if (booking.check_in_time) {
            return res.status(400).json({ message: 'Already checked in' });
        }

        await booking.update({
            check_in_time: new Date(),
            status: 'completed',
        });

        res.json({ message: 'Checked in successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error checking in', error: error.message });
    }
};

// POST /api/v1/bookings/waitlist — Join waitlist
exports.joinWaitlist = async (req, res) => {
    try {
        const { resource_type, resource_id, start_time, end_time } = req.body;
        const user_id = req.user.id;

        if (!resource_type || !resource_id || !start_time || !end_time) {
            return res.status(400).json({ message: 'resource_type, resource_id, start_time, and end_time are required' });
        }

        // Check if waitlist is enabled
        const config = await getEffectiveConfig(resource_type, resource_id);
        if (!config.waitlist_enabled) {
            return res.status(400).json({ message: 'Waitlist is not enabled for this resource' });
        }

        const result = await addToWaitlist({
            resource_type,
            resource_id,
            start_time: new Date(start_time),
            end_time: new Date(end_time),
            user_id,
        });

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.status(201).json({
            message: `Added to waitlist at position ${result.position}`,
            data: result.data,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error joining waitlist', error: error.message });
    }
};

// POST /api/v1/bookings/waitlist/:id/claim — Claim waitlisted slot
exports.claimWaitlistSlot = async (req, res) => {
    try {
        const result = await claimSlot(req.params.id, req.user.id);

        if (!result.success) {
            return res.status(result.statusCode || 400).json({ message: result.message });
        }

        res.json({
            message: 'Slot claimed! Please complete your booking.',
            data: result.data,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error claiming slot', error: error.message });
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
