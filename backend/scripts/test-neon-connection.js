/**
 * Test NeonDB Connection
 * Run: node scripts/test-neon-connection.js
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
}

console.log('🔌 Connecting to NeonDB...');
console.log(`   Host: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown'}`);

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection authenticated successfully!');

        const [results] = await sequelize.query('SELECT NOW() as current_time;');
        console.log(`✅ Query succeeded — Server time: ${results[0].current_time}`);

        const [version] = await sequelize.query('SELECT version();');
        console.log(`✅ PostgreSQL version: ${version[0].version}`);

        console.log('\n🎉 NeonDB connection is working perfectly!');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
})();
