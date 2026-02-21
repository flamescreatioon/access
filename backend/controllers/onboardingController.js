const { User, Membership, AccessTier } = require('../models');

exports.getOnboardingStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Membership, include: [AccessTier] }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const role = user.role;
        // Defined Refined 4-Stage Onboarding Flow
        const stages = [
            {
                id: 'profile',
                title: 'Verify Identity',
                description: 'Confirm your phone number for hub updates.',
                completed: !!user.phone,
                action: 'COMPLETE_PROFILE'
            },
            {
                id: 'registration',
                title: 'Registration Form',
                description: 'Your initial registration has been recorded.',
                completed: true, // Auto-complete as they are logged in
                action: 'VIEW_FORM'
            },
            {
                id: 'membership',
                title: 'Club Membership',
                description: 'Payment verification for hub access.',
                completed: user.Membership?.payment_status === 'PAID',
                action: 'SELECT_PLAN'
            },
            {
                id: 'activation',
                title: 'Account Activation',
                description: 'Final manual verification by Hub Administrator.',
                completed: user.activation_status === 'ACTIVE',
                action: 'WAITING_FOR_APPROVAL'
            }
        ];

        const completedCount = stages.filter(s => s.completed).length;
        const completion = Math.round((completedCount / stages.length) * 100);

        // Calculate Next Step
        let nextStep = 'READY';
        if (!user.phone) {
            nextStep = 'COMPLETE_PROFILE';
        } else if (user.Membership?.payment_status !== 'PAID') {
            nextStep = user.Membership ? 'COMPLETE_PAYMENT' : 'SELECT_PLAN';
        } else if (user.activation_status !== 'ACTIVE') {
            nextStep = 'WAITING_FOR_APPROVAL';
        }

        res.json({
            role,
            accountStatus: user.account_status,
            onboardingStatus: user.onboarding_status,
            activationStatus: user.activation_status,
            paymentStatus: user.Membership?.payment_status || 'UNPAID',
            completion,
            stages,
            nextStep,
            firstLogin: user.first_login_required,
            hubAccount: {
                bankName: 'Zenith Bank',
                accountNumber: '0123456789',
                accountName: 'Innovation Hub'
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching onboarding status', error: error.message });
    }
};

exports.completeStep = async (req, res) => {
    try {
        const { stepId } = req.params;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (stepId === 'profile') {
            await user.update({ profile_complete: true });
        } else if (stepId === 'security') {
            // Assume 2FA or password rotation is done
            // For now just toggle
            await user.update({ onboarding_status: 'IN_PROGRESS' });
        }

        // Auto-activate if all criteria met (simple logic for now)
        // Usually payment is the final trigger, handled elsewhere

        res.json({ message: `Step ${stepId} marked as complete`, user });
    } catch (error) {
        res.status(500).json({ message: 'Error completing step', error: error.message });
    }
};

exports.adminActivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, paymentStatus } = req.body;

        const user = await User.findByPk(userId, {
            include: [{ model: Membership }]
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (status) {
            await user.update({ activation_status: status });
        }

        if (paymentStatus && user.Membership) {
            await user.Membership.update({ payment_status: paymentStatus });
        }

        res.json({
            message: 'User status updated successfully',
            activation_status: user.activation_status,
            payment_status: user.Membership?.payment_status
        });
    } catch (error) {
        res.status(500).json({ message: 'Error activating user', error: error.message });
    }
};
