import { create } from 'zustand';
import { generateMockMembers, MEMBERSHIP_TIERS } from '../lib/mockData';

const initialMembers = generateMockMembers(24);

export const useMembershipStore = create((set, get) => ({
    members: initialMembers,
    tiers: MEMBERSHIP_TIERS,

    // Current user membership (for member view)
    currentMembership: {
        tier: MEMBERSHIP_TIERS[1], // Pro
        status: 'active',
        expiryDate: new Date(Date.now() + 35 * 86400000).toISOString(),
        joinDate: '2025-03-15T00:00:00.000Z',
        paymentStatus: 'paid',
        privileges: ['24/7 Access', 'Room Booking (12hrs/week)', 'Equipment Access', 'Event Priority', 'Guest Passes (2/month)'],
        accessCount: 142,
        nextPayment: new Date(Date.now() + 35 * 86400000).toISOString(),
    },

    suspendMember: (id) => set((state) => ({
        members: state.members.map(m => m.id === id ? { ...m, status: 'suspended' } : m),
    })),

    reactivateMember: (id) => set((state) => ({
        members: state.members.map(m => m.id === id ? { ...m, status: 'active' } : m),
    })),

    updateMemberTier: (id, tierId) => set((state) => ({
        members: state.members.map(m => m.id === id ? { ...m, tier: MEMBERSHIP_TIERS.find(t => t.id === tierId) || m.tier } : m),
    })),

    getFilteredMembers: (search, statusFilter) => {
        let results = get().members;
        if (search) {
            const q = search.toLowerCase();
            results = results.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
        }
        if (statusFilter && statusFilter !== 'all') {
            results = results.filter(m => m.status === statusFilter);
        }
        return results;
    },
}));
