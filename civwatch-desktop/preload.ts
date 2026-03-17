import { contextBridge, ipcRenderer } from 'electron';

// Type-safe IPC surface exposed to renderer (React frontend)
// contextBridge enforces strict boundary — no Node.js in renderer
export type ElectronAPI = typeof api;

const api = {
  // ── Data API ──────────────────────────────────────────────────────────────
  getAnomalies: () =>
    ipcRenderer.invoke('api:getAnomalies'),

  postReport: (data: unknown) =>
    ipcRenderer.invoke('api:postReport', data),

  getHeatmap: () =>
    ipcRenderer.invoke('api:getHeatmap'),

  getTrends: () =>
    ipcRenderer.invoke('api:getTrends'),

  getSummary: () =>
    ipcRenderer.invoke('api:getSummary'),

  getMetrics: () =>
    ipcRenderer.invoke('api:getMetrics'),

  // ── ML ────────────────────────────────────────────────────────────────────
  cluster: (payload: unknown) =>
    ipcRenderer.invoke('ml:cluster', payload),

  // ── UI ────────────────────────────────────────────────────────────────────
  openSettings: () =>
    ipcRenderer.invoke('ui:openSettings'),

  // ── Filesystem ────────────────────────────────────────────────────────────
  readLogs: () =>
    ipcRenderer.invoke('fs:readLogs'),

  openExportsFolder: () =>
    ipcRenderer.invoke('fs:openExportsFolder'),

  // ── Platform info ─────────────────────────────────────────────────────────
  platform: process.platform,
  version: process.env.npm_package_version ?? 'unknown',
};

contextBridge.exposeInMainWorld('api', api);

// Extend Window type for TypeScript renderer files
declare global {
  interface Window {
    api: ElectronAPI;
  }
}
