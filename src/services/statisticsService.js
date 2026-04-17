import api from './api';

export const statisticsService = {
  getScoresByYear: () => api.get('/statistics/scores-by-year'),
  getByMajor: () => api.get('/statistics/by-major'),
  getOverview: () => api.get('/statistics/overview'),
};
