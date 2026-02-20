// Vercel Serverless Function Entry Point
// Load .env for local testing; on Vercel, env vars are set in the dashboard
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('../app');

// Export the Express app as a serverless function handler
module.exports = app;
