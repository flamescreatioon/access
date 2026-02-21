import { create } from 'zustand';
import api from '../lib/api';

export const useEquipmentStore = create((set, get) => ({
    equipment: [],
    currentEquipment: null,
    availability: null,
    loading: false,
    error: null,

    fetchEquipment: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.min_tier) params.append('min_tier', filters.min_tier);
            if (filters.requires_cert) params.append('requires_cert', filters.requires_cert);

            const res = await api.get(`/equipment?${params.toString()}`);
            set({ equipment: res.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch equipment', loading: false });
        }
    },

    fetchEquipmentById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/equipment/${id}`);
            set({ currentEquipment: res.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch equipment detail', loading: false });
        }
    },

    fetchAvailability: async (id, date) => {
        try {
            const res = await api.get(`/equipment/${id}/availability?date=${date}`);
            set({ availability: res.data });
        } catch (err) {
            console.error('Failed to fetch equipment availability', err);
        }
    },

    bookEquipment: async (id, data) => {
        try {
            const res = await api.post(`/equipment/${id}/book`, data);
            return { success: true, data: res.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Booking failed' };
        }
    },

    clearCurrent: () => set({ currentEquipment: null, availability: null })
}));
