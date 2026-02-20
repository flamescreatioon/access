// Vercel Serverless Function Entry Point
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Force production environment on Vercel
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const app = require('../app');

// Export the Express app as a serverless function handler
module.exports = app;
