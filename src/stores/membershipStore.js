import { create } from 'zustand';
import api from '../lib/api';

export const useMembershipStore = create((set, get) => ({
    members: [],
    currentMembership: null,
    history: [],
    isLoading: false,
    error: null,

    fetchCurrentMembership: async (userId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/memberships/user/${userId}`);
            set({ currentMembership: response.data, isLoading: false });
        } catch (error) {
            console.error('Error fetching membership:', error);
            set({ currentMembership: null, isLoading: false, error: 'No active membership' });
        }
    },

    fetchHistory: async () => {
        try {
            const response = await api.get('/memberships/history');
            set({ history: response.data });
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    },

    toggleAutoRenew: async () => {
        try {
            const response = await api.put('/memberships/auto-renew');
            set({ currentMembership: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Update failed' };
        }
    },

    requestUpgrade: async (tierId) => {
        try {
            const response = await api.post('/memberships/upgrade', { target_tier_id: tierId });
            set({ currentMembership: response.data.membership });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Upgrade failed' };
        }
    },

    // Admin: Fetch all members
    fetchAllMembers: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/memberships');
            set({ members: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

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

    generateQrToken: async () => {
        try {
            const response = await api.post('/access/generate-token');
            return response.data.token;
        } catch (error) {
            console.error('Error generating QR token:', error);
            return null;
        }
    },
}));
