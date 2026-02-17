import { create } from 'zustand';
import { generateMockNotifications } from '../lib/mockData';

export const useNotificationStore = create((set, get) => ({
    notifications: generateMockNotifications(),

    unreadCount: () => get().notifications.filter(n => !n.read).length,

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    })),

    markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
    })),

    clearAll: () => set({ notifications: [] }),

    addNotification: (notification) => set((state) => ({
        notifications: [{ ...notification, id: `n${Date.now()}`, time: new Date().toISOString(), read: false }, ...state.notifications],
    })),
}));
