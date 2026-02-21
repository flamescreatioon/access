const { Space, AccessTier, Booking, Membership, User, Sequelize } = require('../models');
const { Op } = Sequelize;

// GET /api/v1/spaces — List all spaces with optional filters
exports.getAllSpaces = async (req, res) => {
    try {
        const { type, min_capacity, tier_id, available_date } = req.query;

        const where = { is_active: true };
        if (type) where.type = type;
        if (min_capacity) where.capacity = { [Op.gte]: parseInt(min_capacity) };
        if (tier_id) where.min_tier_id = { [Op.lte]: parseInt(tier_id) };

        const spaces = await Space.findAll({
            where,
            include: [
                { model: AccessTier, as: 'MinTier', attributes: ['id', 'name', 'color'] },
            ],
            order: [['name', 'ASC']],
        });

        // If checking availability for a specific date, add booking counts
        if (available_date) {
            const dayStart = new Date(available_date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(available_date);
            dayEnd.setHours(23, 59, 59, 999);

            const bookings = await Booking.findAll({
                where: {
                    type: 'space',
                    status: { [Op.in]: ['confirmed', 'pending'] },
                    start_time: { [Op.lt]: dayEnd },
                    end_time: { [Op.gt]: dayStart },
                },
                attributes: ['space_id', 'start_time', 'end_time'],
            });

            const spaceBookings = {};
            bookings.forEach(b => {
                if (!spaceBookings[b.space_id]) spaceBookings[b.space_id] = [];
                spaceBookings[b.space_id].push(b);
            });

            const result = spaces.map(s => ({
                ...s.toJSON(),
                bookings_today: (spaceBookings[s.id] || []).length,
            }));

            return res.json(result);
        }

        res.json(spaces);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching spaces', error: error.message });
    }
};

// GET /api/v1/spaces/:id — Space detail with upcoming bookings
exports.getSpaceById = async (req, res) => {
    try {
        const space = await Space.findByPk(req.params.id, {
            include: [
                { model: AccessTier, as: 'MinTier', attributes: ['id', 'name', 'color', 'price'] },
            ],
        });

        if (!space) return res.status(404).json({ message: 'Space not found' });

        res.json(space);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching space', error: error.message });
    }
};

// GET /api/v1/spaces/:id/availability?date=YYYY-MM-DD — Time slots for a date
exports.getSpaceAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) return res.status(400).json({ message: 'Date parameter required' });

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const bookings = await Booking.findAll({
            where: {
                space_id: id,
                type: 'space',
                status: { [Op.in]: ['confirmed', 'pending'] },
                start_time: { [Op.lt]: dayEnd },
                end_time: { [Op.gt]: dayStart },
            },
            include: [{ model: User, attributes: ['id', 'name'] }],
            order: [['start_time', 'ASC']],
        });

        // Generate hourly slots (8 AM – 8 PM)
        const slots = [];
        for (let hour = 8; hour < 20; hour++) {
            const slotStart = new Date(date);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(date);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            const conflict = bookings.find(b =>
                new Date(b.start_time) < slotEnd && new Date(b.end_time) > slotStart
            );

            slots.push({
                hour,
                label: `${hour.toString().padStart(2, '0')}:00`,
                available: !conflict,
                booking: conflict ? {
                    id: conflict.id,
                    user: conflict.User?.name || 'Reserved',
                    start: conflict.start_time,
                    end: conflict.end_time,
                } : null,
            });
        }

        res.json({ date, space_id: parseInt(id), slots });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability', error: error.message });
    }
};

// POST /api/v1/spaces — Admin: create a new space
exports.createSpace = async (req, res) => {
    try {
        const space = await Space.create(req.body);
        res.status(201).json(space);
    } catch (error) {
        res.status(500).json({ message: 'Error creating space', error: error.message });
    }
};

// PUT /api/v1/spaces/:id — Admin: update space
exports.updateSpace = async (req, res) => {
    try {
        const space = await Space.findByPk(req.params.id);
        if (!space) return res.status(404).json({ message: 'Space not found' });

        await space.update(req.body);
        res.json(space);
    } catch (error) {
        res.status(500).json({ message: 'Error updating space', error: error.message });
    }
};
