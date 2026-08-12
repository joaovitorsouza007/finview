import axios from 'axios';

// Em produção, defina VITE_API_URL com a URL do backend
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

// Envia o token em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finview_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Se a sessão expirar, volta para o login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('finview_token')) {
      localStorage.removeItem('finview_token');
      localStorage.removeItem('finview_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
