import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../api/auth';
import { getMenus } from '../api/menus';

export function useBootstrapAuth() {
    const { token, user, menus, setUser, setMenus, clearAuth } = useAuthStore();

    useEffect(() => {
        if (!token) return;

        let cancelled = false;
        Promise.all([getMe(), getMenus()])
            .then(([meRes, menusRes]) => {
                if (cancelled) return;
                setUser(meRes.data.data);
                setMenus(menusRes);
            })
            .catch(() => {
                if (!cancelled) clearAuth();
            });

        return () => {
            cancelled = true;
        };
    }, [token, setUser, setMenus, clearAuth]);
}
