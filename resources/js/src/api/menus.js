import api from './client';

export const getMenus = () => api.get('/menus').then(r => r.data.data);
