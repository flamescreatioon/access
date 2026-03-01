const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { sequelize } = require('./models');
const equipmentRoutes = require('./routes/equipment');
const notificationRoutes = require('./routes/notifications');
const pushRoutes = require('./routes/push');

const rateLimit = require('express-rate-limit');

const app = express();

// Security/Proxy settings
app.set('trust proxy', 1); // Trust first-level proxy (Vercel)

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per 15 mins
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false }, // Disable trust proxy validation to prevent 500s on Vercel
});

const cookieParser = require('cookie-parser');

// Middleware
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use('/api/v1', limiter); // Apply rate limit to API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    const skipLog = [
        '/api/v1/onboarding/status',
        '/api/v1/analytics/growth',
        '/api/v1/analytics/trends',
        '/api/v1/analytics/stats',
        '/api/v1/notifications',
        '/api/v1/bookings',
        '/api/v1/access/logs',
        '/api/v1/memberships'
    ].some(path => req.url.includes(path));

    if (!skipLog) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
});

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Uacess Management Backend API is running' });
});

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/access', require('./routes/access'));
app.use('/api/v1/memberships', require('./routes/memberships'));
app.use('/api/v1/bookings', require('./routes/bookings'));
app.use('/api/v1/spaces', require('./routes/spaces'));
app.use('/api/v1/space-categories', require('./routes/spaceCategories'));
app.use('/api/v1/amenities', require('./routes/amenities'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/equipment-categories', require('./routes/equipmentCategories'));
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/push', pushRoutes);
app.use('/api/v1/onboarding', require('./routes/onboarding'));
app.use('/api/v1/scan', require('./routes/scan'));
app.use('/api/v1/devices', require('./routes/devices'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/booking-config', require('./routes/bookingConfig'));
app.use('/api/v1/cafe', require('./routes/cafeRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

module.exports = app;
