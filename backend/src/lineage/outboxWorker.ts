import { pool } from '../db';
import { emitLineageEvent } from './openlineageClient';
import logger from '../utils/logger';
import { ingestionCounter } from '../metrics/instrumentation';

// Simple outbox worker using PG advisory lock to ensure a single worker acts at a time.
const LOCK_KEY = BigInt(0xC1V1C00); // arbitrary
const POLL_INTERVAL_MS = 3000;
const BATCH_SIZE = 25;

async function acquireLock(client: any) {
  const res = await client.query('SELECT pg_try_advisory_lock($1) AS locked', [LOCK_KEY]);
  return res.rows[0]?.locked === true;
}

async function releaseLock(client: any) {
  await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]);
}

export async function startOutboxWorker() {
  const client = await pool.connect();
  logger.info('Outbox worker starting');
  try {
    while (true) {
      try {
        const locked = await acquireLock(client);
        if (!locked) {
          await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
          continue;
        }

        const { rows } = await client.query(
          `SELECT id, topic, payload, tries FROM outbox WHERE processed = FALSE ORDER BY created_at ASC LIMIT $1 FOR UPDATE SKIP LOCKED`,
          [BATCH_SIZE]
        );

        for (const row of rows) {
          try {
            await emitLineageEvent(row.payload);
            await client.query('UPDATE outbox SET processed = TRUE, processed_at = NOW() WHERE id = $1', [row.id]);
          } catch (err) {
            logger.warn('Outbox item failed', { id: row.id, err: err?.message || err });
            await client.query('UPDATE outbox SET tries = tries + 1, last_error = $2 WHERE id = $1', [row.id, String(err?.message || err)]);
          }
        }

        await releaseLock(client);
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      } catch (loopErr) {
        logger.error('Outbox worker loop error', { err: loopErr });
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS * 2));
      }
    }
  } finally {
    client.release();
  }
}
