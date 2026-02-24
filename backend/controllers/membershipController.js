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
        if (req.user.role !== 'Admin' && req.user.id !== parseInt(userId, 10)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const membership = await Membership.findOne({
            where: { user_id: userId, status: 'Active' },
            include: [AccessTier]
        });

        if (!membership) {
            return res.json(null);
        }

        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching membership', error: error.message });
    }
};

exports.getAllMemberships = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 1000;
        const offset = parseInt(req.query.offset, 10) || 0;

        const memberships = await Membership.findAll({
            include: [User, AccessTier],
            limit,
            offset
        });
        res.json(memberships);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memberships', error: error.message });
    }
};

// PUT /api/v1/membership/auto-renew — Toggle auto-renew
exports.toggleAutoRenew = async (req, res) => {
    try {
        const membership = await Membership.findOne({
            where: { user_id: req.user.id, status: 'Active' }
        });

        if (!membership) return res.status(404).json({ message: 'No active membership' });

        await membership.update({ auto_renew: !membership.auto_renew });
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling auto-renew', error: error.message });
    }
};

// POST /api/v1/membership/upgrade — Request a tier upgrade
exports.requestUpgrade = async (req, res) => {
    try {
        const { target_tier_id } = req.body;
        const user_id = req.user.id;

        const tier = await AccessTier.findByPk(target_tier_id);
        if (!tier) return res.status(404).json({ message: 'Target tier not found' });

        // In a real system, this would trigger a payment or admin approval.
        // For this Hub Access System, we'll simulate an immediate upgrade.

        await Membership.update({ status: 'Inactive' }, { where: { user_id, status: 'Active' } });

        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);

        const newMembership = await Membership.create({
            user_id,
            tier_id: target_tier_id,
            status: 'Active',
            expiry_date: expiry,
            auto_renew: true
        });

        res.json({ message: `Successfully upgraded to ${tier.name}`, membership: newMembership });
    } catch (error) {
        res.status(500).json({ message: 'Error processing upgrade', error: error.message });
    }
};

// GET /api/v1/membership/history — Get user membership history
exports.getMembershipHistory = async (req, res) => {
    try {
        const history = await Membership.findAll({
            where: { user_id: req.user.id },
            include: [AccessTier],
            order: [['createdAt', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};

// GET /api/v1/memberships/tiers — Get all access tiers
exports.getAllTiers = async (req, res) => {
    try {
        const tiers = await AccessTier.findAll();
        res.json(tiers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tiers', error: error.message });
    }
};

// PUT /api/v1/memberships/:id/suspend
exports.suspendMember = async (req, res) => {
    try {
        const membership = await Membership.findByPk(req.params.id);
        if (!membership) return res.status(404).json({ message: 'Membership not found' });

        await membership.update({ status: 'Suspended' });
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error suspending membership', error: error.message });
    }
};

// PUT /api/v1/memberships/:id/reactivate
exports.reactivateMember = async (req, res) => {
    try {
        const membership = await Membership.findByPk(req.params.id);
        if (!membership) return res.status(404).json({ message: 'Membership not found' });

        await membership.update({ status: 'Active' });
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error reactivating membership', error: error.message });
    }
};

// PUT /api/v1/memberships/:id/tier
exports.updateMemberTier = async (req, res) => {
    try {
        const { tier_id } = req.body;
        const membership = await Membership.findByPk(req.params.id);
        if (!membership) return res.status(404).json({ message: 'Membership not found' });

        const tier = await AccessTier.findByPk(tier_id);
        if (!tier) return res.status(404).json({ message: 'Tier not found' });

        await membership.update({ tier_id });
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error updating membership tier', error: error.message });
    }
};

// POST /api/v1/memberships/tiers
exports.createTier = async (req, res) => {
    try {
        const tier = await AccessTier.create(req.body);
        res.status(201).json(tier);
    } catch (error) {
        res.status(500).json({ message: 'Error creating tier', error: error.message });
    }
};

// PUT /api/v1/memberships/tiers/:id
exports.updateTier = async (req, res) => {
    try {
        const tier = await AccessTier.findByPk(req.params.id);
        if (!tier) return res.status(404).json({ message: 'Tier not found' });
        await tier.update(req.body);
        res.json(tier);
    } catch (error) {
        res.status(500).json({ message: 'Error updating tier', error: error.message });
    }
};

// DELETE /api/v1/memberships/tiers/:id
exports.deleteTier = async (req, res) => {
    try {
        const tier = await AccessTier.findByPk(req.params.id);
        if (!tier) return res.status(404).json({ message: 'Tier not found' });
        await tier.destroy();
        res.json({ message: 'Tier deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tier', error: error.message });
    }
};
