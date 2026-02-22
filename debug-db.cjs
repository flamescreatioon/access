require('dotenv').config({ path: './backend/.env' });
const { AccessTier, User, Membership } = require('./backend/models');

async function check() {
    try {
        const tiers = await AccessTier.findAll();
        console.log('--- Access Tiers ---');
        tiers.forEach(t => console.log(`${t.id}: ${t.name} (₦${t.price})`));

        const users = await User.findAll({
            include: [{ model: Membership, required: false }]
        });
        console.log('\n--- User Membership Counts ---');
        users.forEach(u => {
            const memberships = u.Memberships || (u.Membership ? [u.Membership] : []);
            if (memberships.length > 1) {
                console.log(`User ${u.id} (${u.name}) has ${memberships.length} memberships!`);
            }
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
