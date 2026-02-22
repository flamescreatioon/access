require('dotenv').config();
const { User, Membership, AccessTier } = require('./models');

async function fix() {
    try {
        const activeUsers = await User.findAll({
            where: { activation_status: 'ACTIVE' },
            include: [Membership]
        });

        const freeTier = await AccessTier.findOne({ where: { name: 'Free tier' } });
        if (!freeTier) {
            console.error("Free tier not found in DB");
            return;
        }

        for (const user of activeUsers) {
            if (!user.Membership) {
                console.log(`Fixing user ${user.id} (${user.email}).Creating Free tier membership.`);
                const expiry = new Date();
                expiry.setFullYear(expiry.getFullYear() + 1);

                await Membership.create({
                    user_id: user.id,
                    tier_id: freeTier.id,
                    status: 'Active',
                    payment_status: 'PAID',
                    expiry_date: expiry
                });
            } else {
                console.log(`User ${user.id} already has membership.`);
            }
        }
        console.log("Fix complete.");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
fix();
