import axios from 'axios';

const API_BASE_URL = 'https://d1mvv9oxjyn6w4.cloudfront.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to automatically include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { API_BASE_URL };
