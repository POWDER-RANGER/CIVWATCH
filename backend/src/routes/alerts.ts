import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { cacheGet, cacheSet, cacheDel } from '../db/redis';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const ALERTS_TTL = 30; // seconds

// ── POST /api/alerts — create alert rule ─────────────────────────────────────
router.post('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { name, source_id, metric = 'avg_sentiment', operator = 'lt', threshold } = req.body;
    if (!name || threshold === undefined)
      throw new AppError(400, 'VALIDATION_ERROR', 'name and threshold are required');

    const rows = await pool.query(
      `INSERT INTO alert_rules (user_id, source_id, name, metric, operator, threshold)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user!.userId, source_id ?? null, name, metric, operator, threshold]
    );

    // Bust cache whenever rules change — next GET /recent re-queries fresh
    await cacheDel('alerts:recent');

    res.status(201).json({ rule: rows.rows[0] });
  } catch (e) { next(e); }
});

// ── GET /api/alerts — list active alert rules (user-scoped, skip cache) ───────
router.get('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const rows = await pool.query(
      'SELECT * FROM alert_rules WHERE user_id = $1 AND active = TRUE ORDER BY created_at DESC',
      [req.user!.userId]
    );
    res.json({ rules: rows.rows });
  } catch (e) { next(e); }
});

// ── GET /api/alerts/recent — recent triggered alerts (CACHED 30s) ─────────────
router.get('/recent', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const CACHE_KEY = 'alerts:recent';

    // 1. Cache hit — serve immediately
    const cached = await cacheGet<object[]>(CACHE_KEY);
    if (cached) {
      return res.json({ alerts: cached, cached: true });
    }

    // 2. Cache miss — query DB + populate cache
    const rows = await pool.query(
      `SELECT al.*, ar.name AS rule_name, ar.threshold
       FROM alerts al
       JOIN alert_rules ar ON ar.id = al.rule_id
       WHERE ar.user_id = $1
       ORDER BY al.triggered_at DESC LIMIT 20`,
      [req.user!.userId]
    );

    await cacheSet(CACHE_KEY, rows.rows, ALERTS_TTL);
    res.json({ alerts: rows.rows, cached: false });
  } catch (e) { next(e); }
});

export default router;
