import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// POST /api/alerts  — create alert rule
router.post('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { name, source_id, metric = 'avg_sentiment', operator = 'lt', threshold } = req.body;
    if (!name || threshold === undefined) throw new AppError(400, 'VALIDATION_ERROR', 'name and threshold are required');

    const rows = await pool.query(
      `INSERT INTO alert_rules (user_id, source_id, name, metric, operator, threshold)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user!.userId, source_id ?? null, name, metric, operator, threshold]
    );
    res.status(201).json({ rule: rows.rows[0] });
  } catch (e) { next(e); }
});

// GET /api/alerts  — list active alert rules
router.get('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const rows = await pool.query(
      'SELECT * FROM alert_rules WHERE user_id = $1 AND active = TRUE ORDER BY created_at DESC',
      [req.user!.userId]
    );
    res.json({ rules: rows.rows });
  } catch (e) { next(e); }
});

// GET /api/alerts/recent  — recent triggered alerts
router.get('/recent', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const rows = await pool.query(
      `SELECT al.*, ar.name AS rule_name, ar.threshold
       FROM alerts al
       JOIN alert_rules ar ON ar.id = al.rule_id
       WHERE ar.user_id = $1
       ORDER BY al.triggered_at DESC LIMIT 20`,
      [req.user!.userId]
    );
    res.json({ alerts: rows.rows });
  } catch (e) { next(e); }
});

export default router;
