import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  let dbLatencyMs: number;
  try {
    const t = Date.now();
    await pool.query('SELECT 1');
    dbLatencyMs = Date.now() - t;
  } catch {
    return res.status(503).json({ status: 'error', database: 'disconnected' });
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    dbLatencyMs,
  });
});

// Backward-compat alias
router.get('/status', (_req, res) => res.json({ status: 'ok' }));

export default router;
