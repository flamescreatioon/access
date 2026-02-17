import { create } from 'zustand';
import { ROLES } from '../lib/mockData';

const DEMO_USERS = {
    member: { id: 'u1', firstName: 'Alex', lastName: 'Chen', email: 'alex.chen@example.com', role: ROLES.MEMBER, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Chen&backgroundColor=6366f1' },
    admin: { id: 'u2', firstName: 'Jordan', lastName: 'Williams', email: 'jordan.w@hubadmin.com', role: ROLES.ADMIN, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Jordan+Williams&backgroundColor=8b5cf6' },
    hub_manager: { id: 'u3', firstName: 'Morgan', lastName: 'Rodriguez', email: 'morgan.r@hubadmin.com', role: ROLES.HUB_MANAGER, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Morgan+Rodriguez&backgroundColor=a78bfa' },
    security: { id: 'u4', firstName: 'Taylor', lastName: 'Kim', email: 'taylor.k@hubsecurity.com', role: ROLES.SECURITY, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Taylor+Kim&backgroundColor=4f46e5' },
};

let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loginError: null,

    login: (email, password, role = ROLES.MEMBER) => {
        // Simulate login - accept any credentials with role selection
        const user = DEMO_USERS[role] || DEMO_USERS.member;
        const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        set({ user: { ...user, role }, token, isAuthenticated: true, loginError: null });
        get().startInactivityTimer();
        return true;
    },

    logout: () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        set({ user: null, token: null, isAuthenticated: false, loginError: null });
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
