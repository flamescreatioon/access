const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header (Bearer <token>)
 */
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error('FATAL: JWT_SECRET is not defined in environment variables.');
            return res.status(500).json({ message: 'Internal Server Configuration Error' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Compatibility Alias
exports.authenticate = exports.authenticateToken;

/**
 * Role-based authorization middleware
 * @param {Array} roles - Allowed roles (e.g., ['Admin', 'Hub Manager'])
 */
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};
