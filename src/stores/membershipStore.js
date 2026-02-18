import { create } from 'zustand';
import api from '../lib/api';
import { MEMBERSHIP_TIERS } from '../lib/mockData';

export const useMembershipStore = create((set, get) => ({
    members: [], // For admin view
    tiers: MEMBERSHIP_TIERS,
    currentMembership: null,
    isLoading: false,
    error: null,

    fetchCurrentMembership: async (userId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/memberships/user/${userId}`);
            // Map backend response to store format
            const backendData = response.data;
            const tier = MEMBERSHIP_TIERS.find(t => t.name === backendData.AccessTier.name) || MEMBERSHIP_TIERS[0];

            const membership = {
                tier: tier,
                status: backendData.status.toLowerCase(),
                expiryDate: backendData.expiry_date,
                joinDate: backendData.createdAt,
                paymentStatus: 'paid', // Mock for now
                privileges: JSON.parse(backendData.AccessTier.permissions || '[]'),
                accessCount: 0, // Need to fetch from logs?
                nextPayment: backendData.expiry_date,
            };
            set({ currentMembership: membership, isLoading: false });
        } catch (error) {
            console.error('Error fetching membership:', error);
            // Fallback for demo if no membership found
            set({ currentMembership: null, isLoading: false, error: 'No active membership' });
        }
    },

    // Admin: Fetch all members
    fetchAllMembers: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/memberships'); // Need to implement this
            set({ members: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
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
            results = results.filter(m =>
                (m.User?.name || '').toLowerCase().includes(q) ||
                (m.User?.email || '').toLowerCase().includes(q)
            );
        }
        if (statusFilter && statusFilter !== 'all') {
            results = results.filter(m => m.status === statusFilter);
        }
        return results;
    },
}));
