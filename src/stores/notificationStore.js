import { create } from 'zustand';
import api from '../lib/api';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async (unreadOnly = false) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/notifications?unread_only=${unreadOnly}`);
            set({
                notifications: res.data,
                unreadCount: res.data.filter(n => !n.read).length,
                loading: false
            });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch notifications', loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            set((state) => {
                const notifications = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
                return {
                    notifications,
                    unreadCount: notifications.filter(n => !n.read).length
                };
            });
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    },

    markAllRead: async () => {
        try {
            await api.put('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, read: true })),
                unreadCount: 0
            }));
        } catch (err) {
            console.error('Failed to mark all notifications as read', err);
        }
    }
}));
