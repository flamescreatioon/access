const files = [
    './models/index',
    './models/equipment',
    './models/equipmentCategory',
    './controllers/equipmentController',
    './controllers/equipmentCategoryController',
    './routes/equipment',
    './routes/equipmentCategories',
    './app'
];

files.forEach(file => {
    try {
        console.log(`Checking ${file}...`);
        require(file);
        console.log(`  OK: ${file}`);
    } catch (error) {
        console.error(`  FAILED: ${file}`);
        console.error(error);
    }
});
