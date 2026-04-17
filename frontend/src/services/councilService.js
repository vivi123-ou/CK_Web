import api from './api';

export const councilService = {
  getAll: (params) => api.get('/councils', { params }),
  getById: (id) => api.get(`/councils/${id}`),
  create: (data) => api.post('/councils', data),
  update: (id, data) => api.put(`/councils/${id}`, data),
  delete: (id) => api.delete(`/councils/${id}`),
  lock: (id) => api.put(`/councils/${id}/lock`),
  unlock: (id) => api.put(`/councils/${id}/unlock`),
  assignThesis: (id, thesisIds) =>
    api.put(`/councils/${id}/assign-thesis`, { thesisIds }),
};
