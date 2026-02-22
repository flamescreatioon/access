require('dotenv').config();
const { User, sequelize } = require('./models');

async function cleanup() {
    try {
        console.log('Starting data cleanup...');

        // 1. Delete all users except Admin
        const deletedUsers = await User.destroy({
            where: {
                email: {
                    [require('sequelize').Op.ne]: 'admin@hub.com'
                }
            }
        });
        console.log(`Deleted ${deletedUsers} mock/demo users.`);

        // 2. Clear out logs and audit tables (Smoothly because of CASCADE if associated)
        // Since we deleted users, CASCADE should have handled associated logs/memberships for those users.
        // But for absolute fresh start, we can truncate or delete all remaining.

        await sequelize.query('TRUNCATE TABLE "AccessLogs" RESTART IDENTITY CASCADE;');
        await sequelize.query('TRUNCATE TABLE "Bookings" RESTART IDENTITY CASCADE;');
        await sequelize.query('TRUNCATE TABLE "AuditLogs" RESTART IDENTITY CASCADE;');
        await sequelize.query('TRUNCATE TABLE "Notifications" RESTART IDENTITY CASCADE;');
        await sequelize.query('TRUNCATE TABLE "RefreshTokens" RESTART IDENTITY CASCADE;');
        await sequelize.query('TRUNCATE TABLE "RejectedAccounts" RESTART IDENTITY CASCADE;');
        await sequelize.query('TRUNCATE TABLE "Memberships" RESTART IDENTITY CASCADE;');
        await sequelize.query('TRUNCATE TABLE "AccessTiers" RESTART IDENTITY CASCADE;');

        console.log('Cleared all logs, bookings, and audit records.');
        console.log('Cleanup complete.');

    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        process.exit();
    }
}

cleanup();
