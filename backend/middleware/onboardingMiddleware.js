const { User } = require('../models');

const onboardingMiddleware = async (req, res, next) => {
    let { user } = req;

    if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // If token says inactive, double check DB for most current status
    if (user.activation_status !== 'ACTIVE') {
        try {
            const dbUser = await User.findByPk(user.id);
            if (dbUser && dbUser.activation_status === 'ACTIVE') {
                // Update req.user with actual status for subsequent middleware/controllers
                req.user.activation_status = 'ACTIVE';
                req.user.role = dbUser.role;
                return next();
            }
        } catch (error) {
            console.error('Onboarding middleware DB check error:', error);
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
            '/api/v1/onboarding/confirm-payment-contact'
        ];

        // Normalize path for comparison
        const requestPath = req.originalUrl.split('?')[0];
        const isAllowed = allowedPaths.some(path => requestPath === path || requestPath.startsWith(`${path}/`));

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
