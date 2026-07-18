import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            menus: [],
            setAuth: (user, token, menus = []) => {
                localStorage.setItem('token', token);
                set({ user, token, menus });
            },
            setUser: (user) => set({ user }),
            setMenus: (menus) => set({ menus }),
            clearAuth: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, menus: [] });
            },
        }),
        { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user, menus: s.menus }) }
    )
);
