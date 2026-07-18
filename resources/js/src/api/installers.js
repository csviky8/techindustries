import api from './client';

export const getInstallers    = (params = {}) => api.get('/installers', { params });
export const createInstaller  = (data)        => api.post('/installers', data);
export const updateInstaller  = (id, data)    => api.put(`/installers/${id}`, data);
export const deleteInstaller  = (id)          => api.delete(`/installers/${id}`);
export const getDealers       = ()            => api.get('/dealers');
