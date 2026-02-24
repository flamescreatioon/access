import { create } from 'zustand';
import api from '../lib/api';

export const useSpaceStore = create((set, get) => ({
    spaces: [],
    categories: [],
    amenities: [],
    currentSpace: null,
    availability: null,
    loading: false,
    error: null,

    fetchSpaces: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.zone) params.append('zone', filters.zone);
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.min_capacity) params.append('min_capacity', filters.min_capacity);
            if (filters.available_date) params.append('available_date', filters.available_date);
            const res = await api.get(`/spaces?${params.toString()}`);
            set({ spaces: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to load spaces', loading: false });
        }
    },

    fetchCategories: async () => {
        try {
            const res = await api.get('/space-categories');
            set({ categories: res.data });
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    },

    fetchAmenities: async () => {
        try {
            const res = await api.get('/amenities');
            set({ amenities: res.data });
        } catch (error) {
            console.error('Failed to load amenities', error);
        }
    },

    createCategory: async (data) => {
        const res = await api.post('/space-categories', data);
        set(state => ({ categories: [...state.categories, res.data] }));
        return res.data;
    },

    updateCategory: async (id, data) => {
        const res = await api.put(`/space-categories/${id}`, data);
        set(state => ({ categories: state.categories.map(c => c.id === id ? res.data : c) }));
        return res.data;
    },

    deleteCategory: async (id) => {
        await api.delete(`/space-categories/${id}`);
        set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
    },

    createAmenity: async (data) => {
        const res = await api.post('/amenities', data);
        set(state => ({ amenities: [...state.amenities, res.data] }));
        return res.data;
    },

    updateAmenity: async (id, data) => {
        const res = await api.put(`/amenities/${id}`, data);
        set(state => ({ amenities: state.amenities.map(a => a.id === id ? res.data : a) }));
        return res.data;
    },

    deleteAmenity: async (id) => {
        await api.delete(`/amenities/${id}`);
        set(state => ({ amenities: state.amenities.filter(a => a.id !== id) }));
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
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/spaces/${spaceId}/availability?date=${date}`);
            set({ availability: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to load availability', loading: false });
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
