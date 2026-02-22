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

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per 15 mins (was 100)
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
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
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/equipment-categories', require('./routes/equipmentCategories'));
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/push', pushRoutes);
app.use('/api/v1/onboarding', require('./routes/onboarding'));
app.use('/api/v1/scan', require('./routes/scan'));
app.use('/api/v1/devices', require('./routes/devices'));
app.use('/api/v1/analytics', require('./routes/analytics'));

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
