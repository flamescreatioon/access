const { User, Membership, AccessTier, AccessLog, Device } = require('../models');
const jwt = require('jsonwebtoken');

// Generate a QR Token for a user
exports.generateToken = async (req, res) => {
    try {
        const user = req.user; // From authMiddleware

        // Verify user has active membership
        const membership = await Membership.findOne({
            where: { user_id: user.id },
            include: [AccessTier]
        });

        if (!membership || membership.status !== 'Active') {
            return res.status(403).json({ message: 'Active membership required to generate access token' });
        }

        // Generate short-lived token (e.g., 60 seconds)
        const qrToken = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                tier: membership.AccessTier.name,
                timestamp: Date.now()
            },
            process.env.JWT_SECRET, // Using same secret for now, ideally separate
            { expiresIn: '60s' }
        );

        res.json({ token: qrToken, expiresIn: 60 });
    } catch (error) {
        res.status(500).json({ message: 'Error generating token', error: error.message });
    }
};

// Validate Access (called by Door Controller / Scanner)
exports.validateAccess = async (req, res) => {
    const { token } = req.body;
    const device = req.device; // From deviceMiddleware

    if (!token) {
        return res.status(400).json({ message: 'Token required' });
    }

    let decision = 'Deny';
    let userId = null;
    let reason = 'Unknown';

    try {
        // 1. Verify Token Signature & Expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;

        // 2. Check User & Membership Status (Real-time check)
        const membership = await Membership.findOne({
            where: { user_id: userId },
            include: [AccessTier]
        });

        if (!membership) {
            reason = 'No Membership';
        } else if (membership.status !== 'Active') {
            reason = 'Membership Suspended/Inactive';
        } else if (new Date(membership.expiry_date) < new Date()) {
            reason = 'Membership Expired';
        } else {
            // 3. (Optional) Check Device/Location permissions based on Tier
            // For MVP, assuming all active members can access
            decision = 'Grant';
            reason = 'Access Granted';
        }

    } catch (err) {
        reason = err.name === 'TokenExpiredError' ? 'Token Expired' : 'Invalid Token';
    }

    // 4. Log the attempt
    try {
        await AccessLog.create({
            user_id: userId,
            device_id: device.id,
            method: 'QR',
            decision: decision === 'Grant' ? 'Grant' : `Deny: ${reason}`
        });
    } catch (logError) {
        console.error('Failed to log access attempt:', logError);
    }

    if (decision === 'Grant') {
        res.json({ access: 'Granted', userId, device: device.name });
    } else {
        res.status(403).json({ access: 'Denied', reason });
    }
};

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await AccessLog.findAll({
            include: [User, Device],
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
};

exports.myLastScan = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        // Look for any scan logs from the last 60 seconds
        const lastScan = await AccessLog.findOne({
            where: {
                user_id: req.user.id,
                createdAt: { [Op.gte]: new Date(Date.now() - 60000) }
            },
            order: [['createdAt', 'DESC']]
        });

        if (!lastScan) {
            return res.json({ status: 'No scan detected' });
        }

        res.json({
            status: lastScan.decision, // Pending, Grant, Deny
            scan_id: lastScan.id,
            timestamp: lastScan.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scan status', error: error.message });
    }
};
