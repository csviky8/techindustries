import api from './client';

export const getRoles = () => api.get('/roles');
export const createRole = (data) => api.post('/roles', data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

export const getUsers = (params = {}) => api.get('/users', { params });
export const getUsersLegacy = (page = 1, role = null) => api.get(`/users?page=${page}${role ? `&role=${role}` : ''}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
