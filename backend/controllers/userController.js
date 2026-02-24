const { User, Membership, AccessTier, AccessLog, RefreshToken, AuditLog, UserCertification } = require('../models');
const bcrypt = require('bcrypt');

// GET /api/v1/users/profile — Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Membership, include: [AccessTier] },
                { model: UserCertification }
            ]
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// PUT /api/v1/users/profile — Update current user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, department, level } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (department !== undefined) updates.department = department;
        if (level !== undefined) updates.level = level;

        await user.update(updates);

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// GET /api/v1/users/sessions — Get active sessions
exports.getSessions = async (req, res) => {
    try {
        const sessions = await RefreshToken.findAll({
            where: { user_id: req.user.id },
            order: [['last_used_at', 'DESC']]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions' });
    }
};

// DELETE /api/v1/users/sessions/:id — Revoke a session
exports.revokeSession = async (req, res) => {
    try {
        const session = await RefreshToken.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        await session.destroy();
        res.json({ message: 'Session revoked' });
    } catch (error) {
        res.status(500).json({ message: 'Error revoking session' });
    }
};

// GET /api/v1/users/audit-logs — Get personal activity logs
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            where: { user_id: req.user.id },
            limit: 50,
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching audit logs' });
    }
};

// PUT /api/v1/users/settings — Update user preferences
exports.updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Merge or replace settings
        const newSettings = { ...user.settings, ...settings };
        await user.update({ settings: newSettings });

        res.json({ message: 'Settings updated', settings: user.settings });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings' });
    }
};

// GET /api/v1/users — Admin: list all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [{
                model: Membership,
                where: { status: ['Active', 'Suspended', 'Expired'] },
                include: [AccessTier],
                required: false,
            }],
            order: [['createdAt', 'DESC']],
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// GET /api/v1/users/:id — Admin: get single user with full details
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Membership,
                    where: { status: ['Active', 'Suspended', 'Expired'] },
                    include: [AccessTier],
                    required: false,
                },
                {
                    model: AccessLog,
                    limit: 20,
                    order: [['createdAt', 'DESC']],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// POST /api/v1/users — Admin: create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, level, tier_id, matric_number } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        // Staff Protection: Hub Managers cannot create other administrative roles
        if (req.user.role === 'Hub Manager' && (role === 'Admin' || role === 'Hub Manager')) {
            return res.status(403).json({ message: 'Forbidden: Hub Managers cannot create other administrative accounts' });
        }

        const isAdminRole = ['Admin', 'Hub Manager', 'Security'].includes(role);

        const user = await User.create({
            name,
            email,
            password_hash,
            role: role || null,
            department: department || null,
            level: level || null,
            matric_number: matric_number || null,
            account_status: isAdminRole ? 'ACTIVE' : 'INVITED',
            activation_status: isAdminRole ? 'ACTIVE' : 'INCOMPLETE',
            payment_status: isAdminRole ? 'NOT_REQUIRED' : 'NOT_REQUESTED',
            first_login_required: !isAdminRole,
            profile_complete: isAdminRole,
            onboarding_status: isAdminRole ? 'COMPLETED' : 'NOT_STARTED'
        });

        // If tier_id is provided, create a pending membership
        if (tier_id) {
            await Membership.create({
                user_id: user.id,
                tier_id,
                status: 'Pending',
                payment_status: 'UNPAID',
                auto_renew: true
            });
        }

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            level: user.level,
            payment_status: user.payment_status,
            activation_status: user.activation_status,
            createdAt: user.createdAt,
        };

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// PUT /api/v1/users/:id — Admin: update user
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Staff Protection: Hub Managers cannot modify Admins or Hub Managers
        const isStaff = user.role === 'Admin' || user.role === 'Hub Manager';
        if (req.user.role === 'Hub Manager') {
            if (isStaff) {
                return res.status(403).json({ message: 'Forbidden: You cannot modify other administrative accounts' });
            }
            if (role && (role === 'Admin' || role === 'Hub Manager')) {
                return res.status(403).json({ message: 'Forbidden: You cannot promote users to administrative roles' });
            }
        }

        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (role) {
            const validRoles = ['Member', 'Admin', 'Hub Manager', 'Security', 'Instructor'];
            if (validRoles.includes(role)) updates.role = role;
        }
        if (password) {
            updates.password_hash = await bcrypt.hash(password, 10);
        }

        await user.update(updates);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// DELETE /api/v1/users/:id — Admin: delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Extra safety check: Only Admins can delete
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden: Only Admins can delete users' });
        }

        // Prevent self-deletion
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }

        // Prevent deleting the last admin
        if (user.role === 'Admin') {
            const adminCount = await User.count({ where: { role: 'Admin' } });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last remaining Admin account' });
            }
        }

        await user.destroy();
        res.json({ message: 'User permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

exports.adminResetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Staff Protection: Hub Managers cannot reset passwords for other staff
        const isStaff = user.role === 'Admin' || user.role === 'Hub Manager';
        if (req.user.role === 'Hub Manager' && isStaff) {
            return res.status(403).json({ message: 'Forbidden: Hub Managers cannot reset staff passwords' });
        }

        const password_hash = await bcrypt.hash(newPassword, 10);
        await user.update({ password_hash });

        // Revoke all sessions for security
        await RefreshToken.destroy({ where: { user_id: user.id } });

        res.json({ message: 'Password reset successfully. All sessions revoked.' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

exports.toggleUserDeactivation = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Staff Protection: Hub Managers cannot deactivate staff
        const isStaff = user.role === 'Admin' || user.role === 'Hub Manager';
        if (req.user.role === 'Hub Manager' && isStaff) {
            return res.status(403).json({ message: 'Forbidden: Hub Managers cannot deactivate staff accounts' });
        }

        const newStatus = user.account_status === 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED';
        await user.update({ account_status: newStatus });

        // If deactivated, revoke all sessions
        if (newStatus === 'DEACTIVATED') {
            await RefreshToken.destroy({ where: { user_id: user.id } });
        }

        res.json({
            message: `User ${newStatus === 'DEACTIVATED' ? 'deactivated' : 'activated'} successfully`,
            account_status: newStatus
        });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling deactivation', error: error.message });
    }
};
