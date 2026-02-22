const { SpaceCategory, Space } = require('../models');

// GET /api/v1/space-categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await SpaceCategory.findAll({ order: [['name', 'ASC']] });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// POST /api/v1/space-categories
exports.createCategory = async (req, res) => {
    try {
        const category = await SpaceCategory.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

// PUT /api/v1/space-categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const category = await SpaceCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        await category.update(req.body);
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};

// DELETE /api/v1/space-categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await SpaceCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const spaceCount = await Space.count({ where: { category_id: req.params.id } });
        if (spaceCount > 0) {
            return res.status(400).json({ message: 'Cannot delete category with associated spaces' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};
