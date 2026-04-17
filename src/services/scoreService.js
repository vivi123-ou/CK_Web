import api from './api';

export const scoreService = {
  getByThesis: (thesisId) => api.get(`/scores/thesis/${thesisId}`),
  getByCouncil: (councilId) => api.get(`/scores/council/${councilId}`),
  saveScore: (data) => api.post('/scores', data),
  updateScore: (id, data) => api.put(`/scores/${id}`, data),
  getSummary: (thesisId) => api.get(`/scores/thesis/${thesisId}/summary`),
};
