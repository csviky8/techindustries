import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../api/auth';

export function useBootstrapAuth() {
    const { token, setUser, clearAuth } = useAuthStore();

    useEffect(() => {
        if (!token) return;
        getMe()
            .then((res) => setUser(res.data.data))
            .catch(() => clearAuth());
    }, [token]);
}
