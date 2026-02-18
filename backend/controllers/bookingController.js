const { Booking, User, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.createBooking = async (req, res) => {
    try {
        const { resource_id, start_time, end_time } = req.body;
        const user_id = req.user.id;

        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start >= end) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Check for conflicts
        const conflict = await Booking.findOne({
            where: {
                resource_id,
                [Op.or]: [
                    {
                        start_time: {
                            [Op.lt]: end,
                        },
                        end_time: {
                            [Op.gt]: start,
                        },
                    },
                ],
            },
        });

        if (conflict) {
            return res.status(409).json({ message: 'Resource already booked for this time slot' });
        }

        const booking = await Booking.create({
            user_id,
            resource_id,
            start_time: start,
            end_time: end
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { user_id: req.user.id },
            order: [['start_time', 'ASC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await booking.destroy();
        res.json({ message: 'Booking cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
};
