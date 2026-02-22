const { Amenity } = require('../models');

// GET /api/v1/amenities
exports.getAllAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.findAll({ order: [['name', 'ASC']] });
        res.json(amenities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching amenities', error: error.message });
    }
};

// POST /api/v1/amenities
exports.createAmenity = async (req, res) => {
    try {
        const amenity = await Amenity.create(req.body);
        res.status(201).json(amenity);
    } catch (error) {
        res.status(500).json({ message: 'Error creating amenity', error: error.message });
    }
};

// PUT /api/v1/amenities/:id
exports.updateAmenity = async (req, res) => {
    try {
        const amenity = await Amenity.findByPk(req.params.id);
        if (!amenity) return res.status(404).json({ message: 'Amenity not found' });
        await amenity.update(req.body);
        res.json(amenity);
    } catch (error) {
        res.status(500).json({ message: 'Error updating amenity', error: error.message });
    }
};

// DELETE /api/v1/amenities/:id
exports.deleteAmenity = async (req, res) => {
    try {
        const amenity = await Amenity.findByPk(req.params.id);
        if (!amenity) return res.status(404).json({ message: 'Amenity not found' });
        await amenity.destroy();
        res.json({ message: 'Amenity deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting amenity', error: error.message });
    }
};
