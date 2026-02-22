require('dotenv').config();
const { AccessTier, User, Membership } = require('./models');

async function check() {
    try {
        const tiers = await AccessTier.findAll();
        console.log('--- Access Tiers ---');
        tiers.forEach(t => console.log(`${t.id}: ${t.name} (₦${t.price})`));

        const users = await User.findAll({
            include: [{ model: Membership, required: false }]
        });
        console.log('\n--- User Membership Counts ---');
        let duplicatesFound = false;
        users.forEach(u => {
            // Sequelize might return an array if it's hasMany, but models say hasOne.
            // If it's hasOne and there are multiple, it might return multiple user objects or just one with one membership.
            // But if SQL returns multiple rows, and we don't group, we get multiple objects.
            const userOccurrences = users.filter(usr => usr.id === u.id).length;
            if (userOccurrences > 1) {
                duplicatesFound = true;
                console.log(`User ${u.id} (${u.name}) appears ${userOccurrences} times in the list!`);
            }
        });
        if (!duplicatesFound) console.log('No duplicate users found in the flat list.');

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
