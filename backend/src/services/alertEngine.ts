/**
 * Alert Engine — evaluates alert rules after each ingestion batch.
 * Called by the ingestion worker once analyses are written.
 */
import { pool } from '../db';
import { fireWebhook } from './webhook';

export async function evaluateAlerts(sourceId: string): Promise<void> {
  // Get all active rules for this source (or global rules with no source filter)
  const rules = await pool.query<any>(
    `SELECT ar.* FROM alert_rules ar
     WHERE ar.active = TRUE
       AND (ar.source_id = $1 OR ar.source_id IS NULL)`,
    [sourceId]
  );

  if (!rules.rows.length) return;

  // Compute current avg sentiment for this source (last 50 docs)
  const stats = await pool.query<any>(
    `SELECT ROUND(AVG(a.score)::numeric, 6) AS avg_score
     FROM analyses a
     JOIN documents d ON d.id = a.document_id
     WHERE d.source_id = $1 AND a.type = 'sentiment'
     ORDER BY a.created_at DESC
     LIMIT 50`,
    [sourceId]
  );

  const avgScore: number = parseFloat(stats.rows[0]?.avg_score ?? '0');

  for (const rule of rules.rows) {
    const threshold: number = parseFloat(rule.threshold);
    let triggered = false;

    switch (rule.operator) {
      case 'lt':  triggered = avgScore <  threshold; break;
      case 'gt':  triggered = avgScore >  threshold; break;
      case 'lte': triggered = avgScore <= threshold; break;
      case 'gte': triggered = avgScore >= threshold; break;
      case 'eq':  triggered = Math.abs(avgScore - threshold) < 0.001; break;
    }

    if (!triggered) continue;

    // Check we haven't fired this rule in the last 10 minutes (debounce)
    const recent = await pool.query<any>(
      `SELECT id FROM alerts
       WHERE rule_id = $1
         AND triggered_at > NOW() - INTERVAL '10 minutes'
       LIMIT 1`,
      [rule.id]
    );
    if (recent.rows.length) continue;

    // Insert alert record
    const inserted = await pool.query<any>(
      `INSERT INTO alerts (rule_id, value, payload)
       VALUES ($1, $2, $3) RETURNING id`,
      [rule.id, avgScore, JSON.stringify({ sourceId, metric: rule.metric, operator: rule.operator, threshold })]
    );

    console.log(`[alert] Rule "${rule.name}" triggered — avg=${avgScore} ${rule.operator} ${threshold}`);

    // Fire webhook asynchronously (don't block ingestion)
    fireWebhook({
      event:     'alert.triggered',
      alertId:   inserted.rows[0].id,
      ruleName:  rule.name,
      metric:    rule.metric,
      operator:  rule.operator,
      threshold,
      value:     avgScore,
      sourceId,
      timestamp: new Date().toISOString(),
    }).catch((e) => console.error('[webhook] Fire failed:', e.message));

    // Mark as notified
    await pool.query('UPDATE alerts SET notified = TRUE WHERE id = $1', [inserted.rows[0].id]);
  }
}
