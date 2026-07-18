import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../api/auth';
import { getMenus } from '../api/menus';

export function useBootstrapAuth() {
    const { token, user, menus, setUser, setMenus, clearAuth } = useAuthStore();

    useEffect(() => {
        if (!token) return;
        // Already have user + menus cached, skip API call
        if (user && menus?.length > 0) return;

        Promise.all([getMe(), getMenus()])
            .then(([meRes, menusRes]) => {
                setUser(meRes.data.data);
                setMenus(menusRes);
            })
            .catch(() => clearAuth());
    }, [token]);
}
