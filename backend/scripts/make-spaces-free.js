const { Space } = require('../models');

async function makeSpacesFree() {
    try {
        console.log('Updating all spaces to hourly_rate: 0...');
        const [updatedCount] = await Space.update(
            { hourly_rate: 0 },
            { where: {} }
        );
        console.log(`Successfully updated ${updatedCount} spaces.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating spaces:', error);
        process.exit(1);
    }
}

makeSpacesFree();
