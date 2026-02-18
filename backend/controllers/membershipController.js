const { Membership, AccessTier, User } = require('../models');

exports.createMembership = async (req, res) => {
    try {
        const { user_id, tier_id, expiry_date } = req.body;

        // Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if tier exists
        const tier = await AccessTier.findByPk(tier_id);
        if (!tier) return res.status(404).json({ message: 'Access Tier not found' });

        // Deactivate existing memberships for this user?
        await Membership.update({ status: 'Inactive' }, { where: { user_id } });

        const membership = await Membership.create({
            user_id,
            tier_id,
            status: 'Active',
            expiry_date
        });

        res.status(201).json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error creating membership', error: error.message });
    }
};

exports.getUserMembership = async (req, res) => {
    try {
        const { userId } = req.params;

        // Security check: only allow viewing own or if Admin
        if (req.user.role !== 'Admin' && req.user.id != userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const membership = await Membership.findOne({
            where: { user_id: userId, status: 'Active' },
            include: [AccessTier]
        });

        if (!membership) {
            return res.status(404).json({ message: 'No active membership found' });
        }

        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching membership', error: error.message });
    }
};

exports.getAllMemberships = async (req, res) => {
    try {
        const memberships = await Membership.findAll({
            include: [User, AccessTier]
        });
        res.json(memberships);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memberships', error: error.message });
    }
};
