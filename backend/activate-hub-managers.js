require('dotenv').config();
const { User } = require('./models');

async function activateManagers() {
    try {
        console.log('Activating existing Hub Managers...');
        const [updatedCount] = await User.update({
            activation_status: 'ACTIVE',
            onboarding_status: 'COMPLETED',
            payment_status: 'NOT_REQUIRED',
            account_status: 'ACTIVE',
            first_login_required: false
        }, {
            where: {
                role: 'Hub Manager'
            }
        });
        console.log(`Successfully activated ${updatedCount} Hub Managers.`);
    } catch (err) {
        console.error('Activation failed:', err);
    } finally {
        process.exit();
    }
}

activateManagers();
