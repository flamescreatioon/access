import { create } from 'zustand';
import api from '../lib/api';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    loading: false,
    error: null,

    fetchNotifications: async (unreadOnly = false) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/notifications?unread_only=${unreadOnly}`);
            set({ notifications: res.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch notifications', loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
            }));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    },

    markAllRead: async () => {
        try {
            await api.put('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, read: true })),
            }));
        } catch (err) {
            console.error('Failed to mark all notifications as read', err);
        }
    },

    getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
    }
}));
