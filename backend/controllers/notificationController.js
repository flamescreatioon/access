const { Notification, PushSubscription, User, Sequelize } = require('../models');
const { Op } = Sequelize;
const webpush = require('web-push');

// Set VAPID keys for the helper
if (process.env.VAPID_PUBLIC_KEY) {
    try {
        webpush.setVapidDetails(
            'mailto:admin@hub.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    } catch (err) {
        console.error('VAPID Initialization Error:', err.message);
    }
}

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
        const user = await User.findByPk(user_id);
        if (!user) return null;

        const settings = user.settings || {};
        const notificationSettings = settings.notifications || { push: true, types: {} };

        // Check if user has disabled this notification type
        const typeEnabled = notificationSettings.types?.[type] !== false;
        if (!typeEnabled) return null;

        const notification = await Notification.create({
            user_id,
            title,
            body,
            type: type || 'system',
            data,
            channel: channel || 'in_app'
        });

        // Send Push Notification if enabled and subscription exists
        if (notificationSettings.push !== false) {
            const subscriptions = await PushSubscription.findAll({ where: { user_id } });

            if (subscriptions.length > 0) {
                const payload = JSON.stringify({
                    title,
                    body,
                    icon: '/icon-192.png',
                    data: {
                        url: data?.url || '/notifications',
                        notification_id: notification.id
                    }
                });

                await Promise.allSettled(subscriptions.map(sub => {
                    return webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth }
                    }, payload).catch(err => {
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            // Subscription has expired or is no longer valid
                            return sub.destroy();
                        }
                    });
                }));
            }
        }

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};
