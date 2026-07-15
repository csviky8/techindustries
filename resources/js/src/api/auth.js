import api from './client';

export const login = (credentials) => api.post('/login', credentials);
export const logout = () => api.post('/logout');
export const getMe = () => api.get('/me');
