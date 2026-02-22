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
    },

    // Push Notification Logic
    isPushSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    pushStatus: 'idle', // idle, granted, denied, loading

    initPush: async () => {
        if (!get().isPushSupported) return;

        const permission = Notification.permission;
        set({ pushStatus: permission });

        if (permission === 'granted') {
            await get().subscribeToPush();
        }
    },

    requestPushPermission: async () => {
        if (!get().isPushSupported) return false;

        set({ pushStatus: 'loading' });
        try {
            const permission = await Notification.requestPermission();
            set({ pushStatus: permission });

            if (permission === 'granted') {
                return await get().subscribeToPush();
            }
            return false;
        } catch (error) {
            console.error('Error requesting push permission', error);
            set({ pushStatus: 'denied' });
            return false;
        }
    },

    subscribeToPush: async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const resKey = await api.get('/push/key');
            const publicKey = resKey.data.publicKey;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            await api.post('/push/subscribe', { subscription });
            console.log('Push subscription successful');
            return true;
        } catch (error) {
            console.error('Push subscription failed', error);
            return false;
        }
    },

    unsubscribeFromPush: async () => {
        try {
            const registration = await navigator.serviceWorker.read();
            if (!registration) return;

            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
            }
            set({ pushStatus: 'default' });
            return true;
        } catch (error) {
            console.error('Unsubscribe failed', error);
            return false;
        }
    }
}));

// Utility
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
