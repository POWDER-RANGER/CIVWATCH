import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const BASE     = import.meta.env.VITE_API_BASE_URL ?? '/api';
const ML_BASE  = import.meta.env.VITE_ML_BASE_URL  ?? 'http://localhost:5000';

export const api = axios.create({ baseURL: BASE, timeout: 30000 });
export const ml  = axios.create({ baseURL: ML_BASE, timeout: 15000 });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('cw_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  cfg.headers['X-Request-ID'] = crypto.randomUUID();
  return cfg;
});

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
    const msg = err.response?.data?.error?.message ?? err.response?.data?.error ?? 'Network error';
    toast.error(msg);
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  me:    () => api.get('/auth/me'),
};

// ── Sources ───────────────────────────────────────────────────────────────────
export const sourcesApi = {
  list:   ()             => api.get('/sources'),
  create: (body: object) => api.post('/sources', body),
  remove: (id: string)   => api.delete(`/sources/${id}`),
  run:    (id: string)   => api.post(`/sources/${id}/run`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
// All routes require auth and return user-scoped data
export const analyticsApi = {
  overview: ()          => api.get('/analytics/overview'),
  trends:   (days = 30) => api.get(`/analytics/trends?days=${days}`),
  heatmap:  ()          => api.get('/analytics/heatmap'),
  sources:  ()          => api.get('/analytics/sources'),
};

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alertsApi = {
  list:   ()          => api.get('/alerts'),
  recent: ()          => api.get('/alerts/recent'),
  create: (b: object) => api.post('/alerts', b),
};

// ── Ingest ────────────────────────────────────────────────────────────────────
export const ingestApi = {
  submit: (body: {
    source:    string;
    category:  string;
    value:     number;
    metadata?: Record<string, unknown>;
  }) => api.post('/ingest', body),
};

// ── Anomalies ─────────────────────────────────────────────────────────────────
export const anomaliesApi = {
  list:   (params?: { limit?: number; offset?: number; source?: string; since?: string }) =>
    api.get('/anomalies', { params }),
  stats:  () => api.get('/anomalies/stats'),
  get:    (id: string) => api.get(`/anomalies/${id}`),
  score:  (body: { civic_record_id: number; z_score: number; flags?: string[] }) =>
    api.post('/anomalies/score', body),
};

// ── ML Service (FastAPI) ──────────────────────────────────────────────────────
export const mlApi = {
  health:    ()                  => ml.get('/health'),
  ready:     ()                  => ml.get('/ready'),
  insights:  ()                  => ml.get('/insights'),
  predict:   (records: object[]) => ml.post('/predict', { records }),
  sentiment: (text: string)      => ml.post('/analyze/sentiment', { text }),
  batch:     (items: object[])   => ml.post('/analyze/batch', { items }),
};
