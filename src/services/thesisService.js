import api from './api';

export const thesisService = {
  getAll: (params) => api.get('/thesis', { params }),
  getById: (id) => api.get(`/thesis/${id}`),
  create: (data) => api.post('/thesis', data),
  update: (id, data) => api.put(`/thesis/${id}`, data),
  delete: (id) => api.delete(`/thesis/${id}`),
  assignReviewer: (id, lecturerId) =>
    api.put(`/thesis/${id}/assign-reviewer`, { lecturerId }),
  getByStudent: (studentId) => api.get(`/thesis/student/${studentId}`),
  getByLecturer: (lecturerId) => api.get(`/thesis/lecturer/${lecturerId}`),
};
