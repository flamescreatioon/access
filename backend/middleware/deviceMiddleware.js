const { Device } = require('../models');

exports.authenticateDevice = async (req, res, next) => {
    const apiKey = req.headers['x-device-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'Device API key required' });
    }

    try {
        const device = await Device.findOne({ where: { api_key: apiKey } });
        if (!device) {
            return res.status(401).json({ message: 'Invalid Device API key' });
        }

        req.device = device;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error authenticating device', error: error.message });
    }
};
