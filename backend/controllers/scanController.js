const { User, Membership, AccessTier, AccessLog, Device } = require('../models');

// POST /api/v1/scan/validate — Validate a scanned QR token
exports.validateScan = async (req, res) => {
    try {
        const { qr_token, device_id, location_id } = req.body;
        const managerId = req.user.id;
        const isAdmin = req.user.role === 'Admin';

        // 1. Verify device is active scanner (Admins bypass this check)
        let device = null;
        let effectiveDeviceId = null;
        if (!isAdmin) {
            device = await Device.findByPk(device_id);
            if (!device || device.status !== 'ACTIVE_SCANNER') {
                return res.status(403).json({
                    status: 'ERROR',
                    reason: 'Device not authorized for scanning',
                });
            }
            if (device.user_id !== managerId) {
                return res.status(403).json({
                    status: 'ERROR',
                    reason: 'Device not bound to your account',
                });
            }
            effectiveDeviceId = device.id;
        }

        // 2. Parse QR token — format: IHAP:{userId}:{timestamp}:{hash}
        const parts = (qr_token || '').split(':');
        if (parts.length < 4 || parts[0] !== 'IHAP') {
            // Create denied log
            await AccessLog.create({
                user_id: null,
                method: 'qr_scan',
                decision: 'Deny',
                device_id: effectiveDeviceId,
                manager_id: managerId,
                scan_payload: qr_token,
                backend_decision: 'DENIED',
                deny_reason: 'invalid_token',
                location_id,
            });
            return res.json({
                status: 'DENIED',
                reason: 'invalid_token',
                message: 'Invalid QR code format',
            });
        }

        const memberId = parts[1];
        const tokenTimestamp = parseInt(parts[2]);

        // 3. Check token freshness (allow 60-second window for scanning)
        const currentTimestamp = Math.floor(Date.now() / 30000);
        if (Math.abs(currentTimestamp - tokenTimestamp) > 2) {
            await AccessLog.create({
                user_id: memberId,
                method: 'qr_scan',
                decision: 'Deny',
                device_id: effectiveDeviceId,
                manager_id: managerId,
                scan_payload: qr_token,
                backend_decision: 'DENIED',
                deny_reason: 'expired_token',
                location_id,
            });
            return res.json({
                status: 'DENIED',
                reason: 'expired_token',
                message: 'QR code has expired. Ask member to refresh.',
            });
        }

        // 4. Look up the member
        const member = await User.findByPk(memberId, {
            attributes: { exclude: ['password_hash'] },
        });
        if (!member) {
            await AccessLog.create({
                user_id: memberId,
                method: 'qr_scan',
                decision: 'Deny',
                device_id: effectiveDeviceId,
                manager_id: managerId,
                scan_payload: qr_token,
                backend_decision: 'DENIED',
                deny_reason: 'user_not_found',
                location_id,
            });
            return res.json({
                status: 'DENIED',
                reason: 'user_not_found',
                message: 'Member not found in system',
            });
        }

        // 5. Check membership
        const membership = await Membership.findOne({
            where: { user_id: memberId },
            include: [AccessTier],
        });

        if (!membership) {
            await AccessLog.create({
                user_id: memberId,
                method: 'qr_scan',
                decision: 'Deny',
                device_id: effectiveDeviceId,
                manager_id: managerId,
                scan_payload: qr_token,
                backend_decision: 'DENIED',
                deny_reason: 'no_membership',
                location_id,
            });
            return res.json({
                status: 'DENIED',
                reason: 'no_membership',
                message: 'No membership found',
                member: { id: member.id, name: member.name },
            });
        }

        // 6. Check membership status
        const isActive = (membership.status || '').toLowerCase() === 'active';
        const isExpired = membership.expiry_date && new Date(membership.expiry_date) < new Date();

        if (!isActive || isExpired) {
            const reason = isExpired ? 'expired_membership' : 'suspended_membership';
            await AccessLog.create({
                user_id: memberId,
                method: 'qr_scan',
                decision: 'Deny',
                device_id: effectiveDeviceId,
                manager_id: managerId,
                scan_payload: qr_token,
                backend_decision: 'DENIED',
                deny_reason: reason,
                location_id,
            });
            return res.json({
                status: 'DENIED',
                reason,
                message: isExpired ? 'Membership has expired' : 'Membership is not active',
                member: {
                    id: member.id,
                    name: member.name,
                    role: member.role,
                },
                membership: {
                    tier: membership.AccessTier?.name,
                    status: membership.status,
                    expiry_date: membership.expiry_date,
                },
            });
        }

        // 7. All checks passed — create pending scan log
        const scanLog = await AccessLog.create({
            user_id: memberId,
            method: 'qr_scan',
            decision: 'Pending',
            device_id: effectiveDeviceId,
            manager_id: managerId,
            scan_payload: qr_token,
            backend_decision: 'VALID',
            location_id,
        });

        // Update device last activity (skip for admin direct scans)
        if (device) {
            await device.update({ last_activity: new Date() });
        }

        return res.json({
            status: 'VALID',
            scan_id: scanLog.id,
            message: 'Member verified. Awaiting your decision.',
            member: {
                id: member.id,
                name: member.name,
                email: member.email,
                role: member.role,
            },
            membership: {
                tier: membership.AccessTier?.name,
                tier_color: membership.AccessTier?.color,
                status: membership.status,
                expiry_date: membership.expiry_date,
            },
        });
    } catch (error) {
        console.error('Scan validation error:', error);
        res.status(500).json({ status: 'ERROR', message: 'Scan validation failed', error: error.message });
    }
};

// POST /api/v1/scan/decision — Manager grants or denies entry
exports.logDecision = async (req, res) => {
    try {
        const { scan_id, decision, override, override_reason } = req.body;
        const managerId = req.user.id;

        const scanLog = await AccessLog.findByPk(scan_id);
        if (!scanLog) {
            return res.status(404).json({ message: 'Scan record not found' });
        }
        if (scanLog.manager_id !== managerId) {
            return res.status(403).json({ message: 'Not authorized to decide on this scan' });
        }

        const finalDecision = decision === 'GRANT' ? 'Grant' : 'Deny';

        await scanLog.update({
            decision: finalDecision,
            manager_decision: decision,
            override: override || false,
            override_reason: override_reason || null,
        });

        res.json({
            message: `Entry ${finalDecision.toLowerCase()}ed`,
            log: {
                id: scanLog.id,
                decision: finalDecision,
                override: scanLog.override,
                timestamp: scanLog.updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging decision', error: error.message });
    }
};

// GET /api/v1/scan/recent — Recent scans for live monitoring
exports.getRecentScans = async (req, res) => {
    try {
        const managerId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const scans = await AccessLog.findAll({
            where: { manager_id: managerId },
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'role'] },
            ],
            order: [['createdAt', 'DESC']],
            limit,
        });

        res.json(scans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scans', error: error.message });
    }
};

// GET /api/v1/scan/stats — Today's scan stats for manager
exports.getScanStats = async (req, res) => {
    try {
        const managerId = req.user.id;
        const { Op } = require('sequelize');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayScans = await AccessLog.findAll({
            where: {
                manager_id: managerId,
                createdAt: { [Op.gte]: todayStart },
            },
        });

        const granted = todayScans.filter(s => s.decision === 'Grant').length;
        const denied = todayScans.filter(s => s.decision === 'Deny').length;
        const pending = todayScans.filter(s => s.decision === 'Pending').length;
        const overrides = todayScans.filter(s => s.override).length;

        res.json({
            total: todayScans.length,
            granted,
            denied,
            pending,
            overrides,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
