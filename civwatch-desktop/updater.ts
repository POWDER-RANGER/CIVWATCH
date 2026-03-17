import { autoUpdater } from 'electron-updater';
import { dialog, BrowserWindow } from 'electron';

export function initAutoUpdater(mainWindow: BrowserWindow | null): void {
  // Only run in production
  if (process.env.NODE_ENV === 'development') return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] Checking for updates...');
  });

  autoUpdater.on('update-available', async (info) => {
    if (!mainWindow) return;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `CIVWATCH ${info.version} is available.`,
      detail: 'Download and install now, or update later.',
      buttons: ['Download Update', 'Later'],
      defaultId: 0,
    });
    if (response === 0) autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[updater] Up to date.');
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update:progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', async () => {
    if (!mainWindow) return;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart to apply.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    });
    if (response === 0) autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater] Error:', err.message);
  });

  // Check 5s after launch, then every 4 hours
  setTimeout(() => autoUpdater.checkForUpdates(), 5_000);
  setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1_000);
}
