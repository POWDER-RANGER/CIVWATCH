import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { startBackendService, startMLService, stopAllServices } from './services';
import { initAutoUpdater } from './updater';

let mainWindow: BrowserWindow | null = null;

// ─── Window Factory ───────────────────────────────────────────────────────────
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // required for contextBridge
      nodeIntegration: false,   // never expose Node to renderer
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false, // show after ready-to-show to avoid white flash
  });

  // Load React frontend (built) or dev server
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:4000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../resources/app/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

// Anomaly data from Node backend
ipcMain.handle('api:getAnomalies', async () => {
  const res = await fetch('http://127.0.0.1:3000/api/anomalies');
  return res.json();
});

// Submit report through pipeline
ipcMain.handle('api:postReport', async (_event, data) => {
  const res = await fetch('http://127.0.0.1:3000/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
});

// Heatmap / trends / summary
ipcMain.handle('api:getHeatmap', async () => {
  const res = await fetch('http://127.0.0.1:3000/heatmap');
  return res.json();
});

ipcMain.handle('api:getTrends', async () => {
  const res = await fetch('http://127.0.0.1:3000/trends');
  return res.json();
});

ipcMain.handle('api:getSummary', async () => {
  const res = await fetch('http://127.0.0.1:3000/summary');
  return res.json();
});

ipcMain.handle('api:getMetrics', async () => {
  const res = await fetch('http://127.0.0.1:3000/metrics');
  return res.json();
});

// ML service
ipcMain.handle('ml:cluster', async (_event, payload) => {
  const res = await fetch('http://127.0.0.1:8000/cluster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
});

// Settings window
ipcMain.handle('ui:openSettings', async () => {
  const settingsWindow = new BrowserWindow({
    width: 600,
    height: 500,
    parent: mainWindow ?? undefined,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  settingsWindow.loadFile(path.join(__dirname, '../resources/app/settings.html'));
});

// Filesystem
ipcMain.handle('fs:readLogs', async () => {
  const logPath = path.join(app.getPath('userData'), 'logs', 'civwatch.log');
  const { readFile } = await import('fs/promises');
  try {
    return await readFile(logPath, 'utf-8');
  } catch {
    return '';
  }
});

ipcMain.handle('fs:openExportsFolder', async () => {
  shell.openPath(path.join(app.getPath('userData'), 'exports'));
});

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Start embedded services before window
  await Promise.all([startBackendService(), startMLService()]);

  createWindow();
  initAutoUpdater(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', async () => {
  await stopAllServices();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async () => {
  await stopAllServices();
});
