import { Request, Response } from 'express';
import { pool } from '../db/pool';

/**
 * GET /api/health
 * Liveness + DB connectivity check. Used by Docker healthcheck.
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const start = Date.now();
  let dbStatus = 'disconnected';

  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    uptime: Math.round(process.uptime()),
    latency_ms: Date.now() - start,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
  });
}

/** GET /api/status — backward-compat alias */
export const statusCheck = healthCheck;
