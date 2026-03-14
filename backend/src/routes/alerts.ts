import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/** POST /api/alerts — create threshold alert rule */
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, rule_type = 'avg_sentiment', threshold, operator = 'lt', source_id, notification_url } = req.body;

  if (!name || threshold === undefined) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name and threshold are required' } });
    return;
  }

  const { rows: [rule] } = await pool.query(
    `INSERT INTO alert_rules (user_id, name, rule_type, threshold, operator, source_id, notification_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, name, rule_type, threshold, operator, is_active, created_at`,
    [req.user!.id, name, rule_type, threshold, operator, source_id ?? null, notification_url ?? null]
  );

  res.status(201).json({ alert_rule: rule });
});

/** GET /api/alerts — list user's alert rules + recent triggers */
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows: rules } = await pool.query(
    `SELECT id, name, rule_type, threshold, operator, is_active, created_at
     FROM alert_rules WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user!.id]
  );

  const { rows: recent } = await pool.query(
    `SELECT al.id, al.message, al.actual_value, al.created_at, ar.name AS rule_name
     FROM alerts al
     JOIN alert_rules ar ON ar.id = al.alert_rule_id
     WHERE ar.user_id = $1
     ORDER BY al.created_at DESC LIMIT 20`,
    [req.user!.id]
  );

  res.json({ alert_rules: rules, recent_alerts: recent });
});

export default router;
