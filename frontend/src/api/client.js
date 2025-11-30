import axios from 'axios';

// Vite에서는 import.meta.env.VITE_... 로 읽어야 함
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use(config => {
  // 나중에 JWT 쓰면 여기서 Authorization 헤더 붙이면 됨
  return config;
});

export default api;
