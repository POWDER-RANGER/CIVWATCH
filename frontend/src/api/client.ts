import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const api = axios.create({ baseURL: BASE, timeout: 30000 });

// Attach JWT on every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('cw_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  cfg.headers['X-Request-ID'] = crypto.randomUUID();
  return cfg;
});

// Retry once on 5xx; surface friendly errors
let _retrying = false;
api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError<any>) => {
    if (!_retrying && (!err.response || err.response.status >= 500)) {
      _retrying = true;
      try { return await api.request(err.config!); } finally { _retrying = false; }
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('cw_token');
      window.location.href = '/login';
    }
    const msg = err.response?.data?.error?.message ?? 'Network error';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export const authApi = {
  login:  (email: string, password: string) => api.post('/auth/login', { email, password }),
  me:     () => api.get('/auth/me'),
};

export const sourcesApi = {
  list:   ()                                => api.get('/sources'),
  create: (body: object)                   => api.post('/sources', body),
  remove: (id: string)                     => api.delete(`/sources/${id}`),
  run:    (id: string)                     => api.post(`/sources/${id}/run`),
};

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
};

export const alertsApi = {
  list:   ()           => api.get('/alerts'),
  recent: ()           => api.get('/alerts/recent'),
  create: (b: object)  => api.post('/alerts', b),
};
