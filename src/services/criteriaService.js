import api from './api';

export const criteriaService = {
  getAll: () => api.get('/criteria'),
  create: (data) => api.post('/criteria', data),
  update: (id, data) => api.put(`/criteria/${id}`, data),
  delete: (id) => api.delete(`/criteria/${id}`),
};
