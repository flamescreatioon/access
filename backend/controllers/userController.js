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
        const { name, phone } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;

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
                    include: [AccessTier],
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
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }

        const validRoles = ['Member', 'Admin', 'Hub Manager', 'Security', 'Instructor'];
        const userRole = validRoles.includes(role) ? role : 'Member';

        const password_hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password_hash,
            role: userRole,
        });

        // Return user without password_hash
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
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
