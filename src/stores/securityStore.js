import { create } from 'zustand';
import api from '../lib/api';

export const useSecurityStore = create((set, get) => ({
    sessions: [],
    auditLogs: [],
    loading: false,
    error: null,

    fetchSessions: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/users/sessions');
            set({ sessions: response.data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch sessions', loading: false });
        }
    },

    revokeSession: async (sessionId) => {
        try {
            await api.delete(`/users/sessions/${sessionId}`);
            set(state => ({
                sessions: state.sessions.filter(s => s.id !== sessionId)
            }));
            return true;
        } catch (error) {
            set({ error: 'Failed to revoke session' });
            return false;
        }
    },

    fetchAuditLogs: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/users/audit-logs');
            set({ auditLogs: response.data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch activity logs', loading: false });
        }
    },

    updatePassword: async (currentPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
            await api.put('/auth/change-password', { currentPassword, newPassword });
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update password';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateSettings: async (settings) => {
        try {
            const response = await api.put('/users/settings', { settings });
            return response.data;
        } catch (error) {
            set({ error: 'Failed to update settings' });
            return null;
        }
    }
}));
