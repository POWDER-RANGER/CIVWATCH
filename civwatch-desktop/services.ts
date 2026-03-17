import { app } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface ServiceHandle {
  process: ChildProcess;
  name: string;
}

const runningServices: ServiceHandle[] = [];

// ─── Path resolution ──────────────────────────────────────────────────────────
const resourcesPath = (): string => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev
    ? path.join(process.cwd(), 'resources')
    : path.join(process.resourcesPath);
};

// ─── Log setup ────────────────────────────────────────────────────────────────
const logDir = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function makeLogStream(name: string) {
  return fs.createWriteStream(path.join(logDir, `${name}.log`), { flags: 'a' });
}

// ─── Service launchers ────────────────────────────────────────────────────────

/**
 * Start the Node.js Express/Fastify backend on port 3000.
 * In production: spawns bundled index.js via embedded Node.
 * In dev: assumes `npm run dev` already running.
 */
export async function startBackendService(): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) return; // dev server managed externally

  const backendEntry = path.join(resourcesPath(), 'backend', 'index.js');
  const nodeExe = path.join(resourcesPath(), 'node', 'node.exe');

  const proc = spawn(nodeExe, [backendEntry], {
    cwd: path.join(resourcesPath(), 'backend'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3000',
      DB_PATH: path.join(app.getPath('userData'), 'civwatch.db'),
    },
  });

  const log = makeLogStream('backend');
  proc.stdout?.pipe(log);
  proc.stderr?.pipe(log);

  runningServices.push({ process: proc, name: 'backend' });

  // Wait for backend to be ready (poll /health)
  await waitForPort(3000, 10_000);
}

/**
 * Start the Python FastAPI ML service on port 8000.
 * Spawns civwatch-ml.exe (PyInstaller binary) or python.exe in dev.
 */
export async function startMLService(): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development';

  const mlExe = isDev
    ? path.join(resourcesPath(), 'python', 'python.exe')
    : path.join(resourcesPath(), 'ml', 'civwatch-ml.exe');

  const args = isDev
    ? [path.join(resourcesPath(), 'ml', 'main.py')]
    : [];

  const proc = spawn(mlExe, args, {
    cwd: path.join(resourcesPath(), 'ml'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ML_PORT: '8000',
      ML_HOST: '127.0.0.1',
    },
  });

  const log = makeLogStream('ml');
  proc.stdout?.pipe(log);
  proc.stderr?.pipe(log);

  runningServices.push({ process: proc, name: 'ml' });

  await waitForPort(8000, 15_000);
}

/**
 * Gracefully stop all running services.
 */
export async function stopAllServices(): Promise<void> {
  for (const svc of runningServices) {
    svc.process.kill('SIGTERM');
  }
  // Give them 2s to die gracefully
  await new Promise((r) => setTimeout(r, 2000));
  for (const svc of runningServices) {
    if (!svc.process.killed) svc.process.kill('SIGKILL');
  }
  runningServices.length = 0;
}

// ─── Port readiness probe ─────────────────────────────────────────────────────
async function waitForPort(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Service on port ${port} did not start within ${timeoutMs}ms`);
}
