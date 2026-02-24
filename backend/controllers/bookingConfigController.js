const { BookingConfig } = require('../models');

// GET /api/v1/booking-config — List all configs
exports.getAllConfigs = async (req, res) => {
    try {
        const configs = await BookingConfig.findAll({
            order: [
                ['resource_type', 'ASC'],
                ['resource_id', 'ASC NULLS FIRST'],
            ]
        });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking configs', error: error.message });
    }
};

// GET /api/v1/booking-config/:id — Get single config
exports.getConfigById = async (req, res) => {
    try {
        const config = await BookingConfig.findByPk(req.params.id);
        if (!config) return res.status(404).json({ message: 'Config not found' });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching config', error: error.message });
    }
};

// POST /api/v1/booking-config — Create config
exports.createConfig = async (req, res) => {
    try {
        const config = await BookingConfig.create(req.body);
        res.status(201).json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error creating config', error: error.message });
    }
};

// PUT /api/v1/booking-config/:id — Update config
exports.updateConfig = async (req, res) => {
    try {
        const config = await BookingConfig.findByPk(req.params.id);
        if (!config) return res.status(404).json({ message: 'Config not found' });

        await config.update(req.body);
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error updating config', error: error.message });
    }
};

// DELETE /api/v1/booking-config/:id — Delete config
exports.deleteConfig = async (req, res) => {
    try {
        const config = await BookingConfig.findByPk(req.params.id);
        if (!config) return res.status(404).json({ message: 'Config not found' });

        // Prevent deleting the global config
        if (config.resource_type === 'global' && !config.resource_id) {
            return res.status(400).json({ message: 'Cannot delete the global default config. Update it instead.' });
        }

        await config.destroy();
        res.json({ message: 'Config deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting config', error: error.message });
    }
};
