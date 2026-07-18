import api from './client';

export const getRtos    = (params = {}) => api.get('/rtos', { params });
export const createRto  = (data)        => api.post('/rtos', data);
export const updateRto  = (id, data)    => api.put(`/rtos/${id}`, data);
export const deleteRto  = (id)          => api.delete(`/rtos/${id}`);
