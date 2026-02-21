import { create } from 'zustand';
import api from '../lib/api';

let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loginError: null,
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true, loginError: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, accessToken } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, token: accessToken, isAuthenticated: true, loginError: null, isLoading: false });
            get().startInactivityTimer();
            return true;
        } catch (error) {
            set({
                loginError: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            return false;
        }
    },

    register: async (name, email, password, role) => {
        set({ isLoading: true, loginError: null });
        try {
            const response = await api.post('/auth/register', { name, email, password, role });
            const { user, accessToken } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, token: accessToken, isAuthenticated: true, loginError: null, isLoading: false });
            get().startInactivityTimer();
            return true;
        } catch (error) {
            set({
                loginError: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            return false;
        }
    },

    logout: () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, loginError: null });
    },

    updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
    },

    startInactivityTimer: () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            get().logout();
        }, INACTIVITY_TIMEOUT);
    },

    resetInactivityTimer: () => {
        if (get().isAuthenticated) {
            get().startInactivityTimer();
        }
    },
}));
