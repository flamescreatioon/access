const { Notification, Sequelize } = require('../models');
const { Op } = Sequelize;

// GET /api/v1/notifications — Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const { unread_only, limit = 50 } = req.query;
        const where = { user_id: req.user.id };

        if (unread_only === 'true') where.read = false;

        const notifications = await Notification.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

// PUT /api/v1/notifications/:id/read — Mark a notification as read
exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        await notification.update({ read: true });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};

// PUT /api/v1/notifications/read-all — Mark all as read
exports.markAllRead = async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { user_id: req.user.id, read: false } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
    }
};

// Helper function (Internal use only)
exports.createNotification = async ({ user_id, title, body, type, data, channel }) => {
    try {
        return await Notification.create({
            user_id,
            title,
            body,
            type: type || 'system',
            data,
            channel: channel || 'in_app'
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};
