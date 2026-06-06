import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const BASE     = import.meta.env.VITE_API_BASE_URL ?? '/api';
const ML_BASE  = import.meta.env.VITE_ML_BASE_URL  ?? '/ml';

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
    const msg = err.response?.data?.error?.message ?? 'Network error';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me:    () => api.get('/auth/me'),
};
export const sourcesApi = {
  list:   ()             => api.get('/sources'),
  create: (body: object) => api.post('/sources', body),
  remove: (id: string)   => api.delete(`/sources/${id}`),
  run:    (id: string)   => api.post(`/sources/${id}/run`),
};
export const analyticsApi = {
  overview:       ()          => api.get('/analytics/overview'),
  anomalyScore:   ()          => api.get('/score/anomaly'),
  alertsRecent:   ()          => api.get('/alerts/recent'),
  trend:          (days = 30) => api.get(`/analytics/trend?days=${days}`),
  clusterSummary: ()          => api.get('/analytics/clusters'),
};
export const alertsApi = {
  list:   ()          => api.get('/alerts'),
  recent: ()          => api.get('/alerts/recent'),
  create: (b: object) => api.post('/alerts', b),
};
export const ingestApi = {
  submit: (body: {
    source:    string;
    content:   string;
    metadata?: Record<string, unknown>;
  }) => api.post('/ingest', body),
};
export const anomaliesApi = {
  list:   (params?: { limit?: number; offset?: number; minScore?: number }) =>
    api.get('/anomalies', { params }),
  get:    (id: string) => api.get(`/anomalies/${id}`),
  create: (body: { score: number; label: string; data: unknown }) =>
    api.post('/anomalies', body),
};

/** ML service — talks directly to the FastAPI engine on VITE_ML_BASE_URL */
export const mlApi = {
  health:   ()                              => ml.get('/health'),
  insights: ()                              => ml.get('/insights'),
  predict:  (records: object[])             => ml.post('/predict', { records }),
  sentiment:(text: string)                  => ml.post('/analyze/sentiment', { text }),
  batch:    (items: object[])               => ml.post('/analyze/batch', { items }),
};
