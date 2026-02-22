require('dotenv').config();
const { User, sequelize } = require('./models');

async function cleanup() {
    try {
        console.log('Starting deep data cleanup...');

        // Truncate ALL application tables with RESTART IDENTITY CASCADE
        const tables = [
            'AccessLogs',
            'Bookings',
            'AuditLogs',
            'Notifications',
            'RefreshTokens',
            'RejectedAccounts',
            'Memberships',
            'AccessTiers',
            'Spaces',
            'Equipments',
            'UserCertifications',
            'Users'
        ];

        for (const table of tables) {
            await sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
            console.log(`Truncated ${table}`);
        }

        console.log('Deep cleanup complete.');

    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        process.exit();
    }
}

cleanup();
