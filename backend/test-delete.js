require('dotenv').config();
const { User } = require('./models');

async function testDelete() {
    try {
        // Find a non-admin user to test deletion (ideally one with some related data)
        const user = await User.findOne({
            where: { role: 'Student' },
            order: [['createdAt', 'DESC']]
        });

        if (!user) {
            console.log("No student user found to test deletion.");
            return;
        }

        console.log(`Attempting to delete user: ${user.name} (ID: ${user.id}, Email: ${user.email})`);
        await user.destroy();
        console.log("Deletion successful!");
    } catch (err) {
        console.error("DELETION FAILED:");
        if (err.parent) {
            console.error("DB ERROR DETAILS:");
            console.error(err.parent.detail);
        } else {
            console.error(err.message);
        }
    } finally {
        process.exit();
    }
}
testDelete();
