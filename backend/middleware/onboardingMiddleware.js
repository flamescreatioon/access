const onboardingMiddleware = (req, res, next) => {
    const { user } = req;

    if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // Role-specific activation checks
    if (user.activation_status !== 'ACTIVE') {
        const allowedPaths = [
            '/api/v1/auth/logout',
            '/api/v1/auth/refresh-token',
            '/api/v1/users/profile',
            '/api/v1/memberships/user',
            '/api/v1/onboarding/status',
            '/api/v1/onboarding/complete'
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
