const { User, Membership, AccessTier, RejectedAccount } = require('../models');
const { recordAuditLog } = require('../utils/auditLogger');

// GET /api/v1/onboarding/status
exports.getOnboardingStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Build stages
        const stages = [
            {
                id: 'confirm_details',
                title: 'Confirm Details',
                description: 'Update your name, department, level, and phone number.',
                completed: !!user.profile_complete,
            },
            {
                id: 'select_role',
                title: 'Select Role',
                description: 'Choose your role: Student, Lecturer, or Hub Manager.',
                completed: !!user.role,
            },
        ];

        // Students have a payment stage
        if (user.role === 'Student') {
            stages.push({
                id: 'student_payment',
                title: 'Student Community Plan',
                description: 'Contact admin to complete payment.',
                completed: user.payment_status === 'PAID',
            });
        }

        // Activation stage (only for those who need manual approval)
        if (user.role !== 'Admin' && user.role !== 'Hub Manager') {
            stages.push({
                id: 'activation',
                title: 'Account Activation',
                description: 'Admin verifies and activates your account.',
                completed: user.activation_status === 'ACTIVE',
            });
        }

        const completedCount = stages.filter(s => s.completed).length;
        const completion = Math.round((completedCount / stages.length) * 100);

        // Determine next step
        let nextStep = 'READY';

        // Hard-fix for Hub Managers and Admins
        const isPrivileged = user.role === 'Admin' || user.role === 'Hub Manager';

        if (!user.profile_complete) {
            nextStep = 'CONFIRM_DETAILS';
        } else if (!user.role) {
            nextStep = 'SELECT_ROLE';
        } else if (user.role === 'Student' && user.payment_status !== 'PAID') {
            if (user.payment_status === 'AWAITING_ADMIN_CONFIRMATION') {
                nextStep = 'WAITING_ACTIVATION';
            } else if (user.payment_status === 'REJECTED') {
                nextStep = 'PAYMENT_REJECTED';
            } else {
                nextStep = 'STUDENT_PAYMENT';
            }
        } else if (user.role === 'Lecturer') {
            if (user.activation_status !== 'ACTIVE') {
                nextStep = 'LECTURER_WAITLIST';
            }
        } else if (user.activation_status !== 'ACTIVE' && !isPrivileged) {
            nextStep = 'WAITING_ACTIVATION';
        }

        if (isPrivileged) {
            nextStep = 'READY'; // Force discovery
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                level: user.level,
                account_status: user.account_status,
                onboarding_status: user.onboarding_status,
                activation_status: user.activation_status,
                payment_status: user.payment_status,
                first_login_required: user.first_login_required,
                profile_complete: user.profile_complete,
                phone: user.phone
            },
            role: user.role,
            department: user.department,
            level: user.level,
            accountStatus: user.account_status,
            onboardingStatus: user.onboarding_status,
            activationStatus: user.activation_status,
            paymentStatus: user.payment_status,
            profileComplete: user.profile_complete,
            firstLogin: user.first_login_required,
            completion,
            stages,
            nextStep,
            userName: user.name,
            userPhone: user.phone,
            matricNumber: user.matric_number,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching onboarding status', error: error.message });
    }
};

// PUT /api/v1/onboarding/confirm-details
exports.confirmDetails = async (req, res) => {
    try {
        const { name, department, level, phone, matric_number } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and phone are required' });
        }

        await user.update({
            name,
            department: department || user.department,
            level: level || user.level,
            phone,
            matric_number: matric_number || user.matric_number,
            profile_complete: true,
            onboarding_status: 'IN_PROGRESS',
        });

        await recordAuditLog({
            user_id: user.id,
            action: 'ONBOARDING_CONFIRM_DETAILS',
            resource_type: 'User',
            resource_id: user.id,
            req,
        });

        res.json({ message: 'Details confirmed', user });
    } catch (error) {
        res.status(500).json({ message: 'Error confirming details', error: error.message });
    }
};

// PUT /api/v1/onboarding/select-role
exports.selectRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const validRoles = ['Student', 'Lecturer', 'Hub Manager'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Choose Student, Lecturer, or Hub Manager.' });
        }

        const updates = { role };

        if (role === 'Lecturer') {
            updates.activation_status = 'WAITLIST';
            updates.payment_status = 'NOT_REQUIRED';
        } else if (role === 'Hub Manager') {
            updates.activation_status = 'ACTIVE';
            updates.payment_status = 'NOT_REQUIRED';
            updates.onboarding_status = 'COMPLETED';
            updates.account_status = 'ACTIVE';
            updates.first_login_required = false;
        }

        await user.update(updates);

        await recordAuditLog({
            user_id: user.id,
            action: 'ONBOARDING_SELECT_ROLE',
            resource_type: 'User',
            resource_id: user.id,
            req,
            details: { role },
        });

        res.json({ message: `Role set to ${role}`, role });
    } catch (error) {
        res.status(500).json({ message: 'Error selecting role', error: error.message });
    }
};

// PUT /api/v1/onboarding/confirm-payment-contact
exports.confirmPaymentContact = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role !== 'Student') {
            return res.status(400).json({ message: 'Only students need payment confirmation' });
        }

        await user.update({
            payment_status: 'AWAITING_ADMIN_CONFIRMATION',
            activation_status: 'PENDING_VERIFICATION',
            onboarding_status: 'AWAITING_VERIFICATION',
        });

        await recordAuditLog({
            user_id: user.id,
            action: 'ONBOARDING_PAYMENT_CONTACT',
            resource_type: 'User',
            resource_id: user.id,
            req,
        });

        res.json({ message: 'Payment contact confirmed. Awaiting admin verification.' });
    } catch (error) {
        res.status(500).json({ message: 'Error confirming payment contact', error: error.message });
    }
};

// PUT /api/v1/onboarding/admin/approve/:userId
exports.adminApprove = async (req, res) => {
    try {
        const { userId } = req.params;
        const { tier_id } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({
            payment_status: 'PAID',
            activation_status: 'ACTIVE',
            first_login_required: false,
            onboarding_status: 'COMPLETED',
            account_status: 'ACTIVE',
        });

        // Handle Membership
        let finalTierId = tier_id;

        // If tier_id not provided, check for a pending membership or use default for students
        if (!finalTierId) {
            const pendingMembership = await Membership.findOne({
                where: { user_id: userId, status: 'Pending' }
            });
            if (pendingMembership) {
                finalTierId = pendingMembership.tier_id;
                await pendingMembership.update({
                    status: 'Active',
                    payment_status: 'PAID'
                });
            } else if (user.role === 'Student') {
                // Automatic assignment for students if no pending membership found
                const studentTier = await AccessTier.findOne({ where: { name: 'Student Club Tier' } });
                if (studentTier) {
                    finalTierId = studentTier.id;
                }
            }

            // Absolute fallback: assign Free tier if still nothing
            if (!finalTierId) {
                const freeTier = await AccessTier.findOne({ where: { name: 'Free tier' } });
                if (freeTier) finalTierId = freeTier.id;
            }
        }

        if (finalTierId) {
            // Deactivate existing memberships for this user to prevent duplicates surfacing in the join
            await Membership.update({ status: 'Inactive' }, { where: { user_id: userId } });

            const tier = await AccessTier.findByPk(finalTierId);
            const expiryDate = new Date();

            if (tier && tier.period === 'monthly') {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else {
                // Default to yearly for others
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }

            await Membership.create({
                user_id: user.id,
                tier_id: finalTierId,
                status: 'Active',
                payment_status: 'PAID',
                expiry_date: expiryDate,
                auto_renew: true
            });
        }

        await recordAuditLog({
            user_id: req.user.id,
            action: 'ADMIN_APPROVE_PAYMENT',
            resource_type: 'User',
            resource_id: userId,
            req,
            details: {
                approvedUser: user.name,
                assignedTierId: finalTierId
            },
        });

        res.json({
            message: 'User approved and activated',
            activation_status: 'ACTIVE',
            payment_status: 'PAID',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error approving user', error: error.message });
    }
};

// PUT /api/v1/onboarding/admin/reject/:userId
exports.adminReject = async (req, res) => {
    try {
        const { userId } = req.params;
        const { note } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Archive to RejectedAccounts
        await RejectedAccount.create({
            name: user.name,
            email: user.email,
            phone: user.phone,
            department: user.department,
            level: user.level,
            role: user.role,
            reason: note || 'Rejected by Admin',
            rejected_by: req.user.id
        });

        // 2. Log the action
        await recordAuditLog({
            user_id: req.user.id,
            action: 'ADMIN_REJECT_DELETE',
            resource_type: 'User',
            resource_id: userId,
            req,
            details: { rejectedUser: user.name, note: note || '' },
        });

        // 3. Delete the user (Smoothly thanks to CASCADE)
        await user.destroy();

        res.json({
            message: 'User rejected and permanently archived.',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting user', error: error.message });
    }
};

// GET /api/v1/onboarding/admin/rejected-accounts — Get archived rejections
exports.getRejectedAccounts = async (req, res) => {
    try {
        const archived = await RejectedAccount.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json(archived);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rejected accounts', error: error.message });
    }
};

// Legacy: keep completeStep for backward compat
exports.completeStep = async (req, res) => {
    try {
        const { stepId } = req.params;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (stepId === 'profile') {
            await user.update({ profile_complete: true });
        }

        res.json({ message: `Step ${stepId} marked as complete`, user });
    } catch (error) {
        res.status(500).json({ message: 'Error completing step', error: error.message });
    }
};
