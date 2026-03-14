import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/** GET /api/sources — list user's sources */
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query(
    `SELECT id, name, type, url, is_active, last_run_at, created_at
     FROM sources WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user!.id]
  );
  res.json({ sources: rows });
});

/** POST /api/sources — create RSS source (admin/analyst) */
router.post('/', requireAuth, requireRole('admin', 'analyst'), async (req: AuthRequest, res: Response) => {
  const { name, type = 'rss', url, config = {} } = req.body;

  if (!name || !url) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name and url are required' } });
    return;
  }
  if (!['rss', 'api', 'upload'].includes(type)) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'type must be rss | api | upload' } });
    return;
  }

  const { rows: [source] } = await pool.query(
    `INSERT INTO sources (user_id, name, type, url, config)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, type, url, is_active, created_at`,
    [req.user!.id, name, type, url, JSON.stringify(config)]
  );

  res.status(201).json({ source });
});

/** POST /api/sources/:id/run — manual ingestion trigger */
router.post('/:id/run', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    'SELECT id FROM sources WHERE id = $1 AND user_id = $2',
    [id, req.user!.id]
  );
  if (!rows.length) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Source not found' } });
    return;
  }

  const { rows: [ingestion] } = await pool.query(
    `INSERT INTO ingestions (source_id, status, started_at)
     VALUES ($1, 'running', NOW())
     RETURNING id, status, started_at`,
    [id]
  );

  // Update source last_run_at
  await pool.query('UPDATE sources SET last_run_at = NOW() WHERE id = $1', [id]);

  res.status(202).json({
    message: 'Ingestion started',
    ingestion_id: ingestion.id,
    status: ingestion.status,
  });
});

export default router;
