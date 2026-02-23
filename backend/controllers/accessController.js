const { User, Membership, AccessTier, AccessLog, Device, AccessRule } = require('../models');
const jwt = require('jsonwebtoken');

// Generate a QR Token for a user
exports.generateToken = async (req, res) => {
    try {
        const user = req.user; // From authMiddleware

        // Verify user has active membership, but allow Admins/Hub Managers
        const isAdmin = user.role === 'Admin' || user.role === 'Hub Manager';
        let tierName = 'Basic';

        const membership = await Membership.findOne({
            where: { user_id: user.id, status: 'Active' },
            include: [AccessTier]
        });

        if (membership) {
            tierName = membership.AccessTier.name;
        } else if (!isAdmin) {
            return res.status(403).json({ message: 'Active membership required to generate access token' });
        } else {
            tierName = 'Management'; // Default staff tier
        }

        // Generate short-lived token (e.g., 60 seconds)
        const qrToken = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                tier: tierName,
                timestamp: Date.now()
            },
            process.env.JWT_SECRET, // Using same secret for now, ideally separate
            { expiresIn: '120s' }
        );

        // Generate 6-digit manual access code
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 62000); // 62 seconds to allow slight buffer over JWT

        // Update user with current access code (using ORM properly)
        const userModel = await User.findByPk(user.id);
        await userModel.update({
            access_code: accessCode,
            access_code_expires: expiry
        });

        res.json({
            token: qrToken,
            accessCode: accessCode, // Return to student pass
            expiresIn: 60,
            isInside: userModel.is_inside
        });
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

// GET /api/v1/access/rules
exports.getAllRules = async (req, res) => {
    try {
        const rules = await AccessRule.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rules', error: error.message });
    }
};

// POST /api/v1/access/rules
exports.createRule = async (req, res) => {
    try {
        const rule = await AccessRule.create(req.body);
        res.status(201).json(rule);
    } catch (error) {
        res.status(500).json({ message: 'Error creating rule', error: error.message });
    }
};

// PUT /api/v1/access/rules/:id
exports.updateRule = async (req, res) => {
    try {
        const rule = await AccessRule.findByPk(req.params.id);
        if (!rule) return res.status(404).json({ message: 'Rule not found' });
        await rule.update(req.body);
        res.json(rule);
    } catch (error) {
        res.status(500).json({ message: 'Error updating rule', error: error.message });
    }
};

// DELETE /api/v1/access/rules/:id
exports.deleteRule = async (req, res) => {
    try {
        const rule = await AccessRule.findByPk(req.params.id);
        if (!rule) return res.status(404).json({ message: 'Rule not found' });
        await rule.destroy();
        res.json({ message: 'Rule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting rule', error: error.message });
    }
};
