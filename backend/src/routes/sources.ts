import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { runIngestion } from '../services/ingestionWorker';

const router = Router();

// GET /api/sources
router.get('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const rows = await pool.query(
      'SELECT id, name, type, url, active, created_at FROM sources WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.userId]
    );
    res.json({ sources: rows.rows });
  } catch (e) { next(e); }
});

// POST /api/sources
router.post('/', requireAuth, requireRole('admin', 'analyst'), async (req: Request, res: Response, next) => {
  try {
    const { name, type = 'rss', url, config = {} } = req.body;
    if (!name) throw new AppError(400, 'VALIDATION_ERROR', 'name is required');
    if (type === 'rss' && !url) throw new AppError(400, 'VALIDATION_ERROR', 'url is required for RSS sources');
    const rows = await pool.query(
      `INSERT INTO sources (user_id, name, type, url, config)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, type, url, active, created_at`,
      [req.user!.userId, name, type, url, JSON.stringify(config)]
    );
    res.status(201).json({ source: rows.rows[0] });
  } catch (e) { next(e); }
});

// POST /api/sources/:id/run — trigger ingestion
router.post('/:id/run', requireAuth, requireRole('admin', 'analyst'), async (req: Request, res: Response, next) => {
  try {
    const result = await runIngestion(req.params.id);
    res.json({
      message: 'Ingestion complete',
      documentsIngested: result.new_count,
      skipped: result.skipped_count,
      scored: result.scored_count,
      failed: result.failed_count,
    });
  } catch (e) { next(e); }
});

// DELETE /api/sources/:id
router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM sources WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user!.userId]
    );
    if (!result.rows.length) throw new AppError(404, 'NOT_FOUND', 'Source not found');
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
