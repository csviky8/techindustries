import api from './client';

export const getProjects = (page = 1) => api.get(`/projects?page=${page}`);
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
