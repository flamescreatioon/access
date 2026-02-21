const { Equipment, UserCertification, Booking, User, Membership, AccessTier, Sequelize } = require('../models');
const { Op } = Sequelize;
const { format } = require('date-fns');

// GET /api/v1/equipment — List all equipment with filters
exports.getAllEquipment = async (req, res) => {
    try {
        const { category, status, min_tier, requires_cert } = req.query;
        const where = { is_active: true };

        if (category) where.category = category;
        if (status) where.status = status;
        if (min_tier) where.min_tier_id = { [Op.gte]: min_tier };
        if (requires_cert === 'true') where.requires_certification = true;

        const equipment = await Equipment.findAll({
            where,
            include: [
                { model: AccessTier, as: 'MinTier', attributes: ['id', 'name', 'color'] }
            ],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment', error: error.message });
    }
};

// GET /api/v1/equipment/:id — Equipment detail
exports.getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id, {
            include: [
                { model: AccessTier, as: 'MinTier', attributes: ['id', 'name', 'color'] }
            ]
        });

        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

        // Also check if the current user is certified for this equipment
        let isCertified = false;
        if (equipment.requires_certification) {
            const cert = await UserCertification.findOne({
                where: {
                    user_id: req.user.id,
                    certification_name: equipment.certification_name,
                    expires_at: { [Op.or]: [{ [Op.eq]: null }, { [Op.gt]: new Date() }] }
                }
            });
            isCertified = !!cert;
        } else {
            isCertified = true;
        }

        res.json({ ...equipment.toJSON(), isCertified });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment detail', error: error.message });
    }
};

// GET /api/v1/equipment/:id/availability — Check slots for a date
exports.getEquipmentAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ message: 'Date is required' });

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.findAll({
            where: {
                equipment_id: id,
                status: { [Op.in]: ['confirmed', 'pending', 'completed'] },
                start_time: { [Op.lte]: endOfDay },
                end_time: { [Op.gte]: startOfDay }
            }
        });

        // Generate hourly slots (08:00 to 22:00)
        const slots = [];
        for (let h = 8; h < 22; h++) {
            const slotStart = new Date(startOfDay);
            slotStart.setHours(h, 0, 0, 0);
            const slotEnd = new Date(startOfDay);
            slotEnd.setHours(h + 1, 0, 0, 0);

            const isBooked = bookings.some(b => {
                const bStart = new Date(b.start_time);
                const bEnd = new Date(b.end_time);
                return (slotStart < bEnd && slotEnd > bStart);
            });

            slots.push({
                hour: h,
                label: `${h}:00`,
                available: !isBooked && slotStart > new Date()
            });
        }

        res.json({ date, slots });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability', error: error.message });
    }
};

// POST /api/v1/equipment/:id/book — Book equipment
exports.bookEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_time, end_time, title, notes } = req.body;
        const user_id = req.user.id;

        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start >= end) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // 1. Verify equipment exists
        const equipment = await Equipment.findByPk(id);
        if (!equipment || !equipment.is_active) {
            return res.status(404).json({ message: 'Equipment not found or inactive' });
        }

        if (equipment.status === 'maintenance') {
            return res.status(400).json({ message: 'Equipment is currently under maintenance' });
        }

        // 2. Check tier requirement
        if (equipment.min_tier_id) {
            const membership = await Membership.findOne({
                where: { user_id, status: 'Active' },
                include: [AccessTier]
            });

            if (!membership) {
                return res.status(403).json({ message: 'No active membership' });
            }

            if (membership.tier_id < equipment.min_tier_id) {
                return res.status(403).json({ message: `Requires ${equipment.MinTier?.name || 'higher'} tier` });
            }
        }

        // 3. Check certification
        if (equipment.requires_certification) {
            const cert = await UserCertification.findOne({
                where: {
                    user_id,
                    certification_name: equipment.certification_name,
                    expires_at: { [Op.or]: [{ [Op.eq]: null }, { [Op.gt]: new Date() }] }
                }
            });

            if (!cert) {
                return res.status(403).json({ message: `Required certification missing: ${equipment.certification_name}` });
            }
        }

        // 4. Check session limits
        const durationHours = (end - start) / 3600000;
        if (equipment.max_session_hours > 0 && durationHours > equipment.max_session_hours) {
            return res.status(400).json({ message: `Max session duration is ${equipment.max_session_hours} hours` });
        }

        // 5. Check daily limit
        if (equipment.daily_limit_hours > 0) {
            const dayStart = new Date(start);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(start);
            dayEnd.setHours(23, 59, 59, 999);

            const dailyBookings = await Booking.findAll({
                where: {
                    user_id,
                    equipment_id: id,
                    status: { [Op.in]: ['confirmed', 'pending', 'completed'] },
                    start_time: { [Op.gte]: dayStart, [Op.lte]: dayEnd }
                }
            });

            const dailyHours = dailyBookings.reduce((sum, b) => {
                return sum + (new Date(b.end_time) - new Date(b.start_time)) / 3600000;
            }, 0);

            if (dailyHours + durationHours > equipment.daily_limit_hours) {
                return res.status(400).json({ message: `Daily equipment limit reached (${equipment.daily_limit_hours}hrs)` });
            }
        }

        // 6. Check for conflicts
        const conflict = await Booking.findOne({
            where: {
                equipment_id: id,
                status: { [Op.in]: ['confirmed', 'pending'] },
                [Op.or]: [{
                    start_time: { [Op.lt]: end },
                    end_time: { [Op.gt]: start },
                }],
            },
        });

        if (conflict) {
            return res.status(409).json({ message: 'Equipment is already booked for this time' });
        }

        // 7. Create booking
        const booking = await Booking.create({
            user_id,
            equipment_id: id,
            type: 'equipment',
            title: title || equipment.name,
            notes,
            start_time: start,
            end_time: end,
            status: 'confirmed',
        });

        // Trigger notification
        const notificationController = require('./notificationController');
        await notificationController.createNotification({
            user_id: user_id,
            title: 'Equipment Reserved',
            body: `Your reservation for ${equipment.name} has been confirmed for ${format(start, 'MMM d, h:mm a')}.`,
            type: 'booking',
            data: { booking_id: booking.id, equipment_id: equipment.id }
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error booking equipment', error: error.message });
    }
};

// Admin Functions
exports.createEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.create(req.body);
        res.status(201).json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating equipment', error: error.message });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        await equipment.update(req.body);
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating equipment', error: error.message });
    }
};
