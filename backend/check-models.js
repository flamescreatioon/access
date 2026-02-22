const { Equipment, EquipmentCategory, AccessTier, sequelize } = require('./models');

async function check() {
    try {
        console.log('Checking models...');
        const categories = await EquipmentCategory.findAll();
        console.log(`Found ${categories.length} categories.`);

        const equipment = await Equipment.findAll({
            include: [{ model: EquipmentCategory, as: 'Category' }]
        });
        console.log(`Found ${equipment.length} equipment items.`);

        console.log('Success!');
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
}

check();
