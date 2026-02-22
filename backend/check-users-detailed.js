require('dotenv').config();
const { User, Membership, AccessTier } = require('./models');

async function check() {
    try {
        const users = await User.findAll({
            include: [{
                model: Membership,
                include: [AccessTier]
            }]
        });
        console.log(JSON.stringify(users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            activation_status: u.activation_status,
            onboarding_status: u.onboarding_status,
            membership: u.Membership ? {
                status: u.Membership.status,
                tier: u.Membership.AccessTier?.name
            } : null
        })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
check();
