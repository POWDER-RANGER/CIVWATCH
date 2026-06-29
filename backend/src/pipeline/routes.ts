import { Router } from 'express';
import { validateBody } from '../middleware/validation';
import { ingestSchema } from '../schemas/ingest.schema';
import { pool } from '../db';
import { sanitize } from '../utils/sanitize';
import { aggregate } from '../utils/aggregate';
import logger from '../utils/logger';

const router = Router();

router.post('/ingest',
  validateBody(ingestSchema),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const report = sanitize(req.body.raw_text);
      if (!report?.valid) throw new Error('Sanitization failed');

      const aggregateMeta = aggregate({ text: report.text });

      const insertText = `INSERT INTO civic_records (source, category, raw_text, geocell, recorded_at, metadata) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;
      const { rows } = await client.query(insertText, [req.body.source, req.body.category, report.text, req.body.geocell || null, req.body.recorded_at || new Date().toISOString(), aggregateMeta]);
      const recordId = rows[0].id;

      // Write an outbox event instead of calling lineage directly
      const event = {
        eventType: 'COMPLETE',
        eventTime: new Date().toISOString(),
        producer: 'civic-backend',
        job: { name: `ingest-${req.body.source}` },
        input: { facets: { source: req.body.source } },
        output: { facets: { recordId } }
      };

      await client.query(`INSERT INTO outbox (topic, payload) VALUES ($1, $2)`, ['openlineage', event]);

      await client.query('COMMIT');
      logger.info('Ingestion complete', { recordId });
      res.json({ success: true, recordId });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

export default router;
