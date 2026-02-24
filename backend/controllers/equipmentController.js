const { Equipment, UserCertification, Booking, User, Membership, AccessTier, EquipmentCategory, Sequelize } = require('../models');
const { Op } = Sequelize;
const { format } = require('date-fns');
const { validateBookingRequest } = require('../services/bookingFairnessEngine');

// GET /api/v1/equipment/certifications — Get current user's certifications
exports.getUserCertifications = async (req, res) => {
    try {
        const certifications = await UserCertification.findAll({
            where: { user_id: req.user.id },
            order: [['certified_at', 'DESC']]
        });
        res.json(certifications);
    } catch (error) {
        console.error('Error in getUserCertifications:', error);
        res.status(500).json({ message: 'Error fetching certifications', error: error.message });
    }
};

// GET /api/v1/equipment — List all equipment with filters
exports.getAllEquipment = async (req, res) => {
    try {
        const { category, status, min_tier, requires_cert } = req.query;
        const where = { is_active: true };

        // Sanitize stringified "null"/"undefined" from URL params
        if (category && category !== 'null' && category !== 'undefined') where.category_id = category;
        if (status && status !== 'null' && status !== 'undefined') where.status = status;
        if (min_tier && min_tier !== 'null' && min_tier !== 'undefined') where.min_tier_id = { [Op.gte]: min_tier };
        if (requires_cert === 'true') where.requires_certification = true;

        const equipment = await Equipment.findAll({
            where,
            include: [
                { model: AccessTier, as: 'MinTier', attributes: ['id', 'name', 'color'] },
                { model: EquipmentCategory, as: 'Category' }
            ],
            order: [['name', 'ASC']]
        });

        res.json(equipment);
    } catch (error) {
        console.error('Error in getAllEquipment:', error);
        res.status(500).json({ message: 'Error fetching equipment', error: error.message });
    }
};

// GET /api/v1/equipment/:id — Equipment detail
exports.getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id, {
            include: [
                { model: AccessTier, as: 'MinTier', attributes: ['id', 'name', 'color'] },
                { model: EquipmentCategory, as: 'Category' }
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
        console.error('Error in getEquipmentById:', error);
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
        console.error('Error in getEquipmentAvailability:', error);
        res.status(500).json({ message: 'Error fetching availability', error: error.message });
    }
};

// POST /api/v1/equipment/:id/book — Book equipment
exports.bookEquipment = async (req, res) => {
    const t = await Booking.sequelize.transaction();
    try {
        const { id } = req.params;
        const { start_time, end_time, title, notes } = req.body;
        const user_id = req.user.id;

        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start >= end) {
            await t.rollback();
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // 1. Verify equipment exists
        const equipment = await Equipment.findByPk(id, { transaction: t });
        if (!equipment || !equipment.is_active) {
            await t.rollback();
            return res.status(404).json({ message: 'Equipment not found or inactive' });
        }

        if (equipment.status === 'maintenance') {
            await t.rollback();
            return res.status(400).json({ message: 'Equipment is currently under maintenance' });
        }

        // 2. Check tier requirement
        if (equipment.min_tier_id) {
            const membership = await Membership.findOne({
                where: { user_id, status: 'Active' },
                include: [AccessTier],
                transaction: t
            });

            if (!membership) {
                await t.rollback();
                return res.status(403).json({ message: 'No active membership' });
            }

            if (membership.tier_id < equipment.min_tier_id) {
                await t.rollback();
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
                },
                transaction: t
            });

            if (!cert) {
                await t.rollback();
                return res.status(403).json({ message: `Required certification missing: ${equipment.certification_name}` });
            }
        }

        // 4. Check session limits (equipment-specific, before fairness engine)
        const durationHours = (end - start) / 3600000;
        if (equipment.max_session_hours > 0 && durationHours > equipment.max_session_hours) {
            await t.rollback();
            return res.status(400).json({ message: `Max session duration is ${equipment.max_session_hours} hours` });
        }

        // 5. Run fairness engine (Layers 1-6: availability, lock, usage, cap, cooldown, no-show)
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'Hub Manager';
        const fairnessResult = await validateBookingRequest({
            user_id,
            resource_type: 'equipment',
            resource_id: parseInt(id),
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

        // 6. Create booking
        const isAdminAction = ['Admin', 'Hub Manager'].includes(req.user.role);
        const initialStatus = isAdminAction ? 'confirmed' : 'pending';

        const booking = await Booking.create({
            user_id,
            equipment_id: id,
            type: 'equipment',
            title: title || equipment.name,
            notes,
            start_time: start,
            end_time: end,
            status: initialStatus,
        }, { transaction: t });

        await t.commit();

        // Trigger notification
        const notificationController = require('./notificationController');
        const statusLabel = initialStatus === 'confirmed' ? 'Reserved' : 'Awaiting Approval';
        const statusBody = initialStatus === 'confirmed'
            ? `Your reservation for ${equipment.name} has been confirmed for ${format(start, 'MMM d, h:mm a')}.`
            : `Your reservation for ${equipment.name} has been received and is awaiting admin approval.`;

        await notificationController.createNotification({
            user_id: user_id,
            title: `Equipment ${statusLabel}`,
            body: statusBody,
            type: 'booking',
            data: { booking_id: booking.id, equipment_id: equipment.id }
        });

        res.status(201).json({
            ...booking.toJSON(),
            warning: fairnessResult.warning || null,
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error in bookEquipment:', error);
        res.status(500).json({ message: 'Error booking equipment', error: error.message });
    }
};

// Admin Functions
exports.createEquipment = async (req, res) => {
    try {
        const data = { ...req.body };
        // Sanitize numeric/foreign key fields that might be empty strings from frontend
        if (data.category_id === '') data.category_id = null;
        if (data.min_tier_id === '') data.min_tier_id = null;
        if (data.hourly_cost === '') data.hourly_cost = 0;
        if (data.max_session_hours === '') data.max_session_hours = 4;
        if (data.daily_limit_hours === '') data.daily_limit_hours = 8;
        if (data.pricing_model === '') data.pricing_model = 'hourly';

        const equipment = await Equipment.create(data);
        res.status(201).json(equipment);
    } catch (error) {
        console.error('Error in createEquipment:', error);
        res.status(500).json({ message: 'Error creating equipment', error: error.message });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

        const data = { ...req.body };
        if (data.category_id === '') data.category_id = null;
        if (data.min_tier_id === '') data.min_tier_id = null;
        if (data.pricing_model === '') data.pricing_model = 'hourly';

        await equipment.update(data);
        res.json(equipment);
    } catch (error) {
        console.error('Error in updateEquipment:', error);
        res.status(500).json({ message: 'Error updating equipment', error: error.message });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        await equipment.destroy();
        res.json({ message: 'Equipment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting equipment', error: error.message });
    }
};
