const { PushSubscription } = require('../models');
const webpush = require('web-push');

// Set VAPID keys
if (process.env.VAPID_PUBLIC_KEY) {
    try {
        webpush.setVapidDetails(
            'mailto:admin@hub.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    } catch (err) {
        console.error('Push Controller VAPID Error:', err.message);
    }
}

// GET /api/v1/push/key — Get VAPID public key
exports.getPublicKey = async (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// POST /api/v1/push/subscribe — Save browser subscription
exports.subscribe = async (req, res) => {
    try {
        const { subscription } = req.body;
        const user_id = req.user.id;

        // Check if subscription already exists for this endpoint
        let pushSub = await PushSubscription.findOne({
            where: { endpoint: subscription.endpoint }
        });

        if (pushSub) {
            // Update user_id if it changed (e.g. login as different user on same browser)
            await pushSub.update({ user_id });
        } else {
            // Create new subscription record
            await PushSubscription.create({
                user_id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            });
        }

        res.status(201).json({ message: 'Push subscription saved' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving push subscription', error: error.message });
    }
};

// POST /api/v1/push/unsubscribe — Remove browser subscription
exports.unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        await PushSubscription.destroy({
            where: { endpoint, user_id: req.user.id }
        });
        res.json({ message: 'Push subscription removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing push subscription', error: error.message });
    }
};

// POST /api/v1/push/test — Send test push
exports.sendTestPush = async (req, res) => {
    try {
        const subscriptions = await PushSubscription.findAll({
            where: { user_id: req.user.id }
        });

        if (subscriptions.length === 0) {
            return res.status(404).json({ message: 'No push subscriptions found for this user' });
        }

        const payload = JSON.stringify({
            title: 'Test Notification',
            body: 'Heads up! Push notifications are working correctly.',
            icon: '/icon-192.png',
            data: { url: '/notifications' }
        });

        const results = await Promise.allSettled(subscriptions.map(sub => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            return webpush.sendNotification(pushConfig, payload);
        }));

        res.json({ message: 'Test push sent', results });
    } catch (error) {
        res.status(500).json({ message: 'Error sending test push', error: error.message });
    }
};
