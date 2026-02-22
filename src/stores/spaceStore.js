import { create } from 'zustand';
import api from '../lib/api';

export const useSpaceStore = create((set, get) => ({
    spaces: [],
    currentSpace: null,
    availability: null,
    loading: false,
    error: null,

    fetchSpaces: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.min_capacity) params.append('min_capacity', filters.min_capacity);
            if (filters.available_date) params.append('available_date', filters.available_date);
            const res = await api.get(`/spaces?${params.toString()}`);
            set({ spaces: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to load spaces', loading: false });
        }
    },

    fetchSpaceById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/spaces/${id}`);
            set({ currentSpace: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to load space', loading: false });
        }
    },

    fetchAvailability: async (spaceId, date) => {
        try {
            const res = await api.get(`/spaces/${spaceId}/availability?date=${date}`);
            set({ availability: res.data });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to load availability' });
        }
    },

    clearCurrent: () => set({ currentSpace: null, availability: null }),

    // Admin Actions
    createSpace: async (spaceData) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/spaces', spaceData);
            set(state => ({
                spaces: [...state.spaces, res.data],
                loading: false
            }));
            return res.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to create space', loading: false });
            throw error;
        }
    },

    updateSpace: async (id, spaceData) => {
        set({ loading: true, error: null });
        try {
            const res = await api.put(`/spaces/${id}`, spaceData);
            set(state => ({
                spaces: state.spaces.map(s => s.id === id ? res.data : s),
                loading: false
            }));
            return res.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to update space', loading: false });
            throw error;
        }
    },

    deleteSpace: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/spaces/${id}`);
            set(state => ({
                spaces: state.spaces.filter(s => s.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to delete space', loading: false });
            throw error;
        }
    },
}));
