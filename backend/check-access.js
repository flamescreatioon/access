require('dotenv').config();
const { User, AccessLog, Device } = require('./models');

async function check() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'name', 'role', 'access_code', 'access_code_expires']
        });
        console.log("USERS:");
        console.log(JSON.stringify(users.map(u => u.toJSON()), null, 2));

        const logs = await AccessLog.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [User, Device]
        });
        console.log("\nLATEST LOGS:");
        console.log(JSON.stringify(logs.map(l => ({
            id: l.id,
            user: l.User?.name,
            device: l.Device?.name,
            decision: l.decision,
            createdAt: l.createdAt
        })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
check();
