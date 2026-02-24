import { create } from 'zustand';
import api from '../lib/api';

let inactivityTimer = null;
const INACTIVITY_TIMEOUT_STANDARD = 30 * 60 * 1000; // 30 minutes
const INACTIVITY_TIMEOUT_REMEMBERED = 24 * 60 * 60 * 1000; // 24 hours

export const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('user'),
    loginError: null,
    isLoading: false,

    login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, loginError: null });
        try {
            const response = await api.post('/auth/login', { email, password, rememberMe });
            const { user } = response.data;

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('rememberMe', rememberMe.toString());

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            set({ user, isAuthenticated: true, loginError: null, isLoading: false });
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
            const { user } = response.data;

            localStorage.setItem('user', JSON.stringify(user));

            set({ user, isAuthenticated: true, loginError: null, isLoading: false });
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

    logout: async () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        localStorage.removeItem('user');
        // We keep 'rememberMe' and 'rememberedEmail' for the login page
        set({ user: null, isAuthenticated: false, loginError: null });
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // ignore
        }
    },

    updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser };
        Object.keys(userData).forEach(key => {
            if (
                typeof userData[key] === 'object' &&
                userData[key] !== null &&
                !Array.isArray(userData[key]) &&
                typeof currentUser[key] === 'object' &&
                currentUser[key] !== null &&
                !Array.isArray(currentUser[key])
            ) {
                updatedUser[key] = { ...currentUser[key], ...userData[key] };
            } else {
                updatedUser[key] = userData[key];
            }
        });
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
