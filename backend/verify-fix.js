require('dotenv').config();
const { User, Membership, AccessTier } = require('./models');

async function verify() {
    try {
        console.log('--- Verifying Unified User Management joins ---');
        const users = await User.findAll({
            include: [{
                model: Membership,
                where: { status: ['Active', 'Suspended', 'Expired'] },
                include: [AccessTier],
                required: false,
            }],
            order: [['createdAt', 'DESC']],
        });

        console.log(`Total users found: ${users.length}`);

        const duplicates = [];
        const seen = new Set();
        users.forEach(u => {
            if (seen.has(u.id)) {
                duplicates.push(u.id);
            }
            seen.add(u.id);
            console.log(`User ${u.id}: ${u.name} | Memberships: ${u.Memberships?.length || 0} | Role: ${u.role}`);
        });

        if (duplicates.length > 0) {
            console.error(`FAILURE: Duplicate IDs found: ${duplicates.join(', ')}`);
        } else {
            console.log('SUCCESS: No duplicate user rows found in the result set.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

verify();
