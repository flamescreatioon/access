const { User, Membership, AccessTier, AccessLog, Device } = require('../models');
const jwt = require('jsonwebtoken');

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

        // 2. Parse / Verify QR token
        let memberId = null;
        let isLegacy = false;

        // Check if it's a 6-digit manual manual code
        if (qr_token && /^\d{6}$/.test(qr_token)) {
            const { Op } = require('sequelize');
            const userWithCode = await User.findOne({
                where: {
                    access_code: qr_token,
                    access_code_expires: { [Op.gt]: new Date() }
                }
            });
            if (userWithCode) {
                memberId = userWithCode.id;
            } else {
                return res.json({
                    status: 'DENIED',
                    reason: 'invalid_code',
                    message: 'Invalid or expired manual code',
                });
            }
        } else if (qr_token && qr_token.startsWith('IHAP:')) {
            // Legacy IHAP format: IHAP:{userId}:{timestamp}:{hash}
            const parts = qr_token.split(':');
            if (parts.length >= 4) {
                memberId = parts[1];
                const tokenTimestamp = parseInt(parts[2]);
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
                isLegacy = true;
            }
        } else {
            // Modern JWT format
            try {
                const decoded = jwt.verify(qr_token, process.env.JWT_SECRET);
                memberId = decoded.userId;
            } catch (err) {
                const reason = err.name === 'TokenExpiredError' ? 'expired_token' : 'invalid_token';
                await AccessLog.create({
                    user_id: null,
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
                    message: reason === 'expired_token' ? 'QR code has expired' : 'Invalid QR code format',
                });
            }
        }

        if (!memberId) {
            return res.json({
                status: 'DENIED',
                reason: 'invalid_token',
                message: 'Invalid QR code',
            });
        }

        // 4. Look up the member
        const member = await User.findByPk(memberId, {
            attributes: { exclude: ['password_hash'] },
        });

        if (member && member.is_inside) {
            return res.json({
                status: 'DENIED',
                reason: 'already_inside',
                message: 'Member is already checked in',
                member: { id: member.id, name: member.name, role: member.role }
            });
        }
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

        const isMemberPrivileged = member.role === 'Admin' || member.role === 'Hub Manager';

        if (!membership && !isMemberPrivileged) {
            console.log(`Scan DENIED: No membership found for user ${memberId} (${member.name})`);
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
        const isActive = isMemberPrivileged || (membership && (membership.status || '').toLowerCase() === 'active');
        const isExpired = !isMemberPrivileged && membership && membership.expiry_date && new Date(membership.expiry_date) < new Date();

        if (!isActive || isExpired) {
            const reason = isExpired ? 'expired_membership' : 'suspended_membership';
            console.log(`Scan DENIED: Membership ${reason} for user ${memberId} (${member.name}). Status: ${membership?.status}`);
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

        const finalDecision = decision === 'GRANT' ? 'Grant' : (decision === 'EXIT' ? 'Exit' : 'Deny');

        await scanLog.update({
            decision: finalDecision,
            manager_decision: decision,
            override: override || false,
            override_reason: override_reason || null,
        });

        // Update User Session Status
        if (finalDecision === 'Grant' && scanLog.user_id) {
            await User.update({ is_inside: true }, { where: { id: scanLog.user_id } });
        } else if (finalDecision === 'Exit' && scanLog.user_id) {
            await User.update({ is_inside: false }, { where: { id: scanLog.user_id } });
        }

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

// POST /api/v1/scan/checkout-all — Admin clears all active sessions
exports.checkoutAll = async (req, res) => {
    try {
        const { Op } = require('sequelize');

        // 1. Get count of people inside
        const insideCount = await User.count({ where: { is_inside: true } });

        if (insideCount === 0) {
            return res.json({ message: 'Hub is already empty', cleared: 0 });
        }

        // 2. Perform mass update
        await User.update({ is_inside: false }, { where: { is_inside: true } });

        // 3. Log the event
        await AccessLog.create({
            method: 'system_clear',
            decision: 'Exit',
            manager_id: req.user.id,
            backend_decision: 'VALID',
            scan_payload: `SYSTEM_RESET: ${insideCount} members checked out`,
            location_id: req.body.location_id || null
        });

        res.json({
            message: `Successfully checked out ${insideCount} members.`,
            cleared: insideCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error performing mass checkout', error: error.message });
    }
};
