const { User } = require('../models');

// Simple in-memory cache to avoid hitting DB for the same user within a short window (e.g., dashboard refresh)
const statusCache = new Map();
const CACHE_TTL = 5000; // 5 seconds

const onboardingMiddleware = async (req, res, next) => {
    let { user } = req;

    if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // Skip all checks for Admin, Hub Manager, and Security
    const skipRoles = ['Admin', 'Hub Manager', 'Security'];
    if (skipRoles.includes(user.role)) {
        return next();
    }

    // If token says inactive, check cache or double check DB for most current status
    if (user.activation_status !== 'ACTIVE') {
        const now = Date.now();
        const cached = statusCache.get(user.id);

        if (cached && (now - cached.timestamp) < CACHE_TTL) {
            if (cached.status === 'ACTIVE') {
                req.user.activation_status = 'ACTIVE';
                req.user.role = cached.role;
                return next();
            }
        } else {
            try {
                const dbUser = await User.findByPk(user.id);
                if (dbUser) {
                    statusCache.set(user.id, {
                        status: dbUser.activation_status,
                        role: dbUser.role,
                        timestamp: now
                    });

                    if (dbUser.activation_status === 'ACTIVE') {
                        req.user.activation_status = 'ACTIVE';
                        req.user.role = dbUser.role;
                        return next();
                    }
                }
            } catch (error) {
                console.error('Onboarding middleware DB check error:', error);
            }
        }

        const allowedPaths = [
            '/api/v1/auth/logout',
            '/api/v1/auth/refresh-token',
            '/api/v1/users/profile',
            '/api/v1/memberships/user',
            '/api/v1/memberships/history',
            '/api/v1/memberships/tiers',
            '/api/v1/onboarding/status',
            '/api/v1/onboarding/complete',
            '/api/v1/onboarding/confirm-details',
            '/api/v1/onboarding/select-role',
            '/api/v1/onboarding/confirm-payment-contact',
            '/api/v1/access'
        ];

        // Normalize path for comparison - handle query params and trailing slashes
        const url = new URL(req.originalUrl, `http://${req.headers.host}`);
        const requestPath = url.pathname.replace(/\/$/, "");

        const isAllowed = allowedPaths.some(path => {
            const normalizedPath = path.replace(/\/$/, "");
            return requestPath === normalizedPath || requestPath.startsWith(`${normalizedPath}/`);
        });

        if (!isAllowed) {
            return res.status(403).json({
                message: 'Feature Locked: Please complete your setup flow.',
                onboardingRequired: true,
                path: requestPath,
                activationStatus: user.activation_status,
                onboardingStatus: user.onboarding_status
            });
        }
    }

    next();
};

module.exports = onboardingMiddleware;
