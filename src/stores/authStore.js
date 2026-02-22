import { create } from 'zustand';
import api from '../lib/api';

let inactivityTimer = null;
const INACTIVITY_TIMEOUT_STANDARD = 30 * 60 * 1000; // 30 minutes
const INACTIVITY_TIMEOUT_REMEMBERED = 24 * 60 * 60 * 1000; // 24 hours

export const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loginError: null,
    isLoading: false,

    login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, loginError: null });
        try {
            const response = await api.post('/auth/login', { email, password, rememberMe });
            const { user, accessToken, refreshToken } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('rememberMe', rememberMe.toString());

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

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
            const { user, accessToken, refreshToken } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
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
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // We keep 'rememberMe' and 'rememberedEmail' for the login page
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

        const isRemembered = localStorage.getItem('rememberMe') === 'true';
        const timeout = isRemembered ? INACTIVITY_TIMEOUT_REMEMBERED : INACTIVITY_TIMEOUT_STANDARD;

        inactivityTimer = setTimeout(() => {
            get().logout();
        }, timeout);
    },

    resetInactivityTimer: () => {
        if (get().isAuthenticated) {
            get().startInactivityTimer();
        }
    },
}));
