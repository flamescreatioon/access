const crypto = require('crypto');
const { Device, User } = require('../models');

// POST /api/v1/devices/register — Hub Manager registers their device
exports.registerDevice = async (req, res) => {
    try {
        const { device_fingerprint, name, location } = req.body;
        const userId = req.user.id;

        // Check if user already has a pending/active device
        const existing = await Device.findOne({
            where: { user_id: userId, status: 'ACTIVE_SCANNER' },
        });
        if (existing) {
            return res.status(409).json({
                message: 'You already have an active scanner device',
                device: existing,
            });
        }

        const device = await Device.create({
            name: name || `${req.user.name}'s Scanner`,
            type: 'mobile_scanner',
            location: location || 'Unassigned',
            status: 'PENDING_ACTIVATION',
            user_id: userId,
            device_fingerprint,
            api_key: crypto.randomBytes(24).toString('hex'),
        });

        res.status(201).json({
            message: 'Device registered. Awaiting admin activation.',
            device: {
                id: device.id,
                name: device.name,
                status: device.status,
                location: device.location,
                createdAt: device.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering device', error: error.message });
    }
};

// GET /api/v1/devices/my-device — Hub Manager checks their device status
exports.getMyDevice = async (req, res) => {
    try {
        const device = await Device.findOne({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']],
        });

        if (!device) {
            return res.status(404).json({ message: 'No device registered', status: 'NONE' });
        }

        res.json({
            id: device.id,
            name: device.name,
            status: device.status,
            location: device.location,
            scanner_token: device.status === 'ACTIVE_SCANNER' ? device.scanner_token : null,
            last_activity: device.last_activity,
            createdAt: device.createdAt,
            activated_at: device.activated_at,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device', error: error.message });
    }
};

// GET /api/v1/devices — Admin: list all devices
exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.findAll({
            include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
            order: [['createdAt', 'DESC']],
        });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching devices', error: error.message });
    }
};

// PUT /api/v1/devices/:id/activate — Admin activates a device
exports.activateDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) return res.status(404).json({ message: 'Device not found' });

        const scannerToken = crypto.randomBytes(32).toString('hex');

        await device.update({
            status: 'ACTIVE_SCANNER',
            scanner_token: scannerToken,
            activated_at: new Date(),
            activated_by: req.user.id,
        });

        res.json({ message: 'Device activated as scanner', device });
    } catch (error) {
        res.status(500).json({ message: 'Error activating device', error: error.message });
    }
};

// PUT /api/v1/devices/:id/suspend — Admin suspends a device
exports.suspendDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) return res.status(404).json({ message: 'Device not found' });

        await device.update({
            status: 'SUSPENDED',
            scanner_token: null,
        });

        res.json({ message: 'Device suspended', device });
    } catch (error) {
        res.status(500).json({ message: 'Error suspending device', error: error.message });
    }
};

// PUT /api/v1/devices/:id/revoke — Admin revokes a device
exports.revokeDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) return res.status(404).json({ message: 'Device not found' });

        await device.update({
            status: 'REVOKED',
            scanner_token: null,
        });

        res.json({ message: 'Device revoked', device });
    } catch (error) {
        res.status(500).json({ message: 'Error revoking device', error: error.message });
    }
};
