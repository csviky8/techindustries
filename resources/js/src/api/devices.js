import api from './client';

export const getDevices = (params = {}) => api.get('/settings/devices', { params });
export const createDevice = (data) => api.post('/settings/devices', data);
