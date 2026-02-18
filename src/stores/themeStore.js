import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    dark: true, // Force dark mode by default
    toggle: () => set((state) => {
        const next = !state.dark;
        document.documentElement.classList.toggle('dark', next);
        return { dark: next };
    }),
    init: () => set((state) => {
        document.documentElement.classList.toggle('dark', state.dark);
        return state;
    }),
}));
