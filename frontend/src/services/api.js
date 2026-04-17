import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    let msg = err.response?.data?.message || err.response?.data || err.message || 'Lỗi kết nối máy chủ';
    
    // Nếu có lỗi validation chi tiết từ server
    if (err.response?.data?.data && typeof err.response.data.data === 'object' && msg === 'Dữ liệu không hợp lệ') {
      const fieldErrors = Object.values(err.response.data.data).join(', ');
      msg = `${msg}: ${fieldErrors}`;
    }

    return Promise.reject(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
);

export default api;
