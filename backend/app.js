const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Innovation Hub Access Management Backend API is running' });
});

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/access', require('./routes/access'));
app.use('/api/v1/memberships', require('./routes/memberships'));
app.use('/api/v1/bookings', require('./routes/bookings'));

module.exports = app;
