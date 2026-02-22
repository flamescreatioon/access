require('dotenv').config();
const { User, Membership, AccessTier } = require('./models');

async function check() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'name', 'role', 'activation_status'],
            include: [{
                model: Membership,
                include: [AccessTier]
            }]
        });
        console.log(JSON.stringify(users.map(u => ({
            id: u.id,
            name: u.name,
            role: u.role,
            activation_status: u.activation_status,
            memberships: u.Memberships?.map(m => ({
                id: m.id,
                status: m.status,
                tier: m.AccessTier?.name
            }))
        })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
check();
