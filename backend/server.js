require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully (NeonDB/PostgreSQL).');

        // Sync models (optional, use migrations in production)
        // await sequelize.sync({ alter: true });
        // console.log('Database synced (alter: true).');

        // Only start the server if not in a serverless environment
        // Vercel handles the listening part for us
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        if (process.env.NODE_ENV !== 'production') process.exit(1);
    }
}

// Final fallback for unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, you might want to restart the process gracefully
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env.NODE_ENV !== 'production') process.exit(1);
});

// Export app for Vercel Serverless Functions
module.exports = app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    startServer();
}
