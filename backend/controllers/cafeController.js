const { CafeItem, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.getAllItems = async (req, res) => {
    try {
        const { category, search, activeOnly } = req.query;
        const where = {};

        if (activeOnly === 'true') {
            where.is_available = true;
        }

        if (category) {
            where.category = category;
        }

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        const items = await CafeItem.findAll({
            where,
            order: [['name', 'ASC']]
        });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cafe items', error: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await CafeItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cafe item', error: error.message });
    }
};

// Admin
exports.createItem = async (req, res) => {
    try {
        const { name, description, category, price, image_url, is_available, stock_quantity } = req.body;

        const newItem = await CafeItem.create({
            name,
            description,
            category,
            price,
            image_url,
            is_available: is_available !== undefined ? is_available : true,
            stock_quantity: stock_quantity || 0
        });

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating cafe item', error: error.message });
    }
};

// Admin
exports.updateItem = async (req, res) => {
    try {
        const item = await CafeItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        await item.update(req.body);
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cafe item', error: error.message });
    }
};

// Admin
exports.deleteItem = async (req, res) => {
    try {
        const item = await CafeItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Soft delete could be better, but we'll use destroy here.
        // For production, maybe just set is_available = false if it has associated order items
        await item.destroy();
        res.json({ message: 'Cafe item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting cafe item', error: error.message });
    }
};
