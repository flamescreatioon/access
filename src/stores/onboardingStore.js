import { create } from 'zustand';
import api from '../lib/api';

export const useOnboardingStore = create((set, get) => ({
    status: null,
    isLoading: false,
    error: null,

    fetchStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/onboarding/status');
            set({ status: res.data, isLoading: false });
            return res.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to load onboarding status',
                isLoading: false
            });
            return null;
        }
    },

    confirmDetails: async (data) => {
        try {
            await api.put('/onboarding/confirm-details', data);
            await get().fetchStatus();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to confirm details' };
        }
    },

    selectRole: async (role) => {
        try {
            await api.put('/onboarding/select-role', { role });
            await get().fetchStatus();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to select role' };
        }
    },

    confirmPaymentContact: async () => {
        try {
            await api.put('/onboarding/confirm-payment-contact');
            await get().fetchStatus();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to confirm contact' };
        }
    },

    completeStep: async (stepId, data = {}) => {
        try {
            await api.post(`/onboarding/complete/${stepId}`, data);
            await get().fetchStatus();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to complete step' };
        }
    }
}));
