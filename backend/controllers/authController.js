const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
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

        // Default to 'Member' if not specified, or restrict high-privilege roles
        const userRole = role || 'Member';
        // In a real app, you'd want to restrict Admin/Manager creation to Admins only.

        const user = await User.create({
            name,
            email,
            password_hash,
            role: userRole
        });

        const tokens = generateTokens(user);
        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = generateTokens(user);
        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
