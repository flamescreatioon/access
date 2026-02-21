const { User, RefreshToken } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { recordAuditLog } = require('../utils/auditLogger');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            activation_status: user.activation_status,
            onboarding_status: user.onboarding_status,
            payment_status: user.payment_status
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const userRole = role || 'Member';

        const user = await User.create({
            name,
            email,
            password_hash,
            role: userRole,
            account_status: 'INVITED', // Admins provision, user starts as invited
            onboarding_status: 'NOT_STARTED',
            activation_status: 'INACTIVE',
            first_login_required: true,
            profile_complete: false
        });

        const tokens = generateTokens(user);

        // Persist refresh token
        await RefreshToken.create({
            user_id: user.id,
            token: tokens.refreshToken,
            device_info: req.headers['user-agent'],
            ip_address: req.ip || req.socket.remoteAddress,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await recordAuditLog({
            user_id: user.id,
            action: 'REGISTER',
            resource_type: 'User',
            resource_id: user.id,
            req
        });

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                level: user.level,
                account_status: user.account_status,
                onboarding_status: user.onboarding_status,
                activation_status: user.activation_status,
                payment_status: user.payment_status,
                first_login_required: user.first_login_required,
                profile_complete: user.profile_complete
            },
            ...tokens
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            if (user) {
                await recordAuditLog({
                    user_id: user.id,
                    action: 'LOGIN_FAILURE',
                    status: 'FAILURE',
                    req,
                    details: { reason: 'Invalid password' }
                });
            }
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = generateTokens(user);

        // Persist refresh token session
        await RefreshToken.create({
            user_id: user.id,
            token: tokens.refreshToken,
            device_info: req.headers['user-agent'],
            ip_address: req.ip || req.socket.remoteAddress,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await recordAuditLog({
            user_id: user.id,
            action: 'LOGIN',
            req
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                level: user.level,
                account_status: user.account_status,
                onboarding_status: user.onboarding_status,
                activation_status: user.activation_status,
                payment_status: user.payment_status,
                first_login_required: user.first_login_required,
                profile_complete: user.profile_complete
            },
            ...tokens
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const storedToken = await RefreshToken.findOne({
            where: { token: refreshToken, user_id: decoded.id }
        });

        if (!storedToken || new Date() > new Date(storedToken.expires_at)) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await User.findByPk(decoded.id);
        const tokens = generateTokens(user);

        // Update stored token with new refresh token or rotate? 
        // For simplicity, we rotate: update existing record with new token and expiry
        await storedToken.update({
            token: tokens.refreshToken,
            last_used_at: new Date(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json(tokens);
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        if (refreshToken) {
            await RefreshToken.destroy({ where: { token: refreshToken } });
        }
        if (req.user) {
            await recordAuditLog({ user_id: req.user.id, action: 'LOGOUT', req });
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
            await recordAuditLog({
                user_id: user.id,
                action: 'PASSWORD_CHANGE',
                status: 'FAILURE',
                req,
                details: { reason: 'Current password incorrect' }
            });
            return res.status(401).json({ message: 'Current password incorrect' });
        }

        const password_hash = await bcrypt.hash(newPassword, 10);
        await user.update({ password_hash });

        // Revoke all other sessions on password change for security
        await RefreshToken.destroy({ where: { user_id: user.id } });

        await recordAuditLog({
            user_id: user.id,
            action: 'PASSWORD_CHANGE',
            req,
            details: { info: 'All other sessions revoked' }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password' });
    }
};
