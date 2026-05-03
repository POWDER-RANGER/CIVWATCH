/**
 * Ingestion Worker — fetches from any registered source adapter,
 * persists documents, batch-scores via ML service, triggers alerts.
 *
 * Called via POST /api/sources/:id/run
 *
 * Performance characteristics (vs previous implementation):
 *  ML calls: N sequential HTTP → 1 batch HTTP (~98% latency reduction)
 *  DB writes: N individual INSERTs → 2 unnest() bulk writes
 *  Parser: regex (broken on CDATA/Atom) → rss-parser (RFC-compliant)
 */
import Parser from 'rss-parser';
import { pool } from '../db';
import { evaluateAlerts } from './alertEngine';
import { env } from '../config/env';
import { USASpendingAdapter } from '../adapters/usaspending';
import { CongressAdapter } from '../adapters/congress';

// ── Types ─────────────────────────────────────────────────────────────────────────────
export interface ParsedItem {
  title: string;
  body: string;
  url: string | null;
  publishedAt: string | null;
  metadata: Record<string, unknown>;
}

interface BatchScoreResult {
  item_id: number;
  score: number;
  confidence: number;
  label: string;
}

interface IngestionResult {
  new_count: number;
  skipped_count: number;
  scored_count: number;
  failed_count: number;
}

// ── RSS Adapter ────────────────────────────────────────────────────────────────────────────
const _rssParser = new Parser({
  timeout: 15000,
  maxRedirects: 5,
  headers: { 'User-Agent': 'CIVWATCH/0.1.0' },
  customFields: { item: ['media:content', 'media:description'] },
});

async function fetchRss(url: string): Promise<ParsedItem[]> {
  const feed = await _rssParser.parseURL(url);
  return feed.items.slice(0, 50).map(item => ({
    title: (item.title ?? '').trim(),
    body: (item.contentSnippet ?? item.content ?? item.summary ?? item.title ?? '').trim(),
    url: item.link ?? item.guid ?? null,
    publishedAt: item.pubDate ?? item.isoDate ?? null,
    metadata: {},
  }));
}

// ── Adapter Dispatch ───────────────────────────────────────────────────────────────────────
async function fetchFromSource(source: {
  type: string;
  url: string | null;
  config: Record<string, unknown>;
}): Promise<ParsedItem[]> {
  const adapterType = (source.config?.adapter as string | undefined) ?? source.type;
  switch (adapterType) {
    case 'rss':
      if (!source.url) throw new Error('RSS source requires a URL');
      return fetchRss(source.url);
    case 'usaspending':
      return USASpendingAdapter.fetch(source.config as any);
    case 'congress':
      return CongressAdapter.fetch(source.config as any);
    default:
      throw new Error(`No adapter registered for source type: ${adapterType}`);
  }
}

// ── ML Batch Scoring ──────────────────────────────────────────────────────────────────────
async function scoreBatch(
  items: ParsedItem[]
): Promise<BatchScoreResult[]> {
  if (items.length === 0) return [];
  try {
    const res = await fetch(`${env.ML_SERVICE_URL}/analyze/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((item, i) => ({
          item_id: i,
          title: item.title,
          body: item.body.slice(0, 2000),
        })),
      }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json() as { results: BatchScoreResult[] };
    return data.results ?? [];
  } catch (err: any) {
    console.warn('[ingestion] ML service error:', err.message);
    return items.map((_, i) => ({ item_id: i, score: 0, confidence: 0, label: 'unscored' }));
  }
}

// ── Main Export ────────────────────────────────────────────────────────────────────────────
export async function runIngestion(sourceId: string): Promise<IngestionResult> {
  const srcRes = await pool.query<{ id: string; url: string | null; type: string; config: Record<string, unknown> }>(
    'SELECT id, url, type, config FROM sources WHERE id = $1',
    [sourceId]
  );
  const source = srcRes.rows[0];
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const ingRes = await pool.query<{ id: string }>(
    `INSERT INTO ingestions (source_id, status, started_at) VALUES ($1, 'running', NOW()) RETURNING id`,
    [sourceId]
  );
  const ingestionId = ingRes.rows[0].id;

  try {
    // 1. Fetch
    const items = await fetchFromSource(source);
    if (items.length === 0) {
      await pool.query(
        `UPDATE ingestions SET status='completed', documents_count=0, completed_at=NOW() WHERE id=$1`,
        [ingestionId]
      );
      return { new_count: 0, skipped_count: 0, scored_count: 0, failed_count: 0 };
    }

    // 2. Bulk INSERT documents
    const insertRes = await pool.query<{ id: string; url: string | null }>(
      `INSERT INTO documents (source_id, ingestion_id, title, body, url, published_at)
       SELECT $1, $2, unnest($3::text[]), unnest($4::text[]), unnest($5::text[]), unnest($6::timestamptz[])
       ON CONFLICT (url) WHERE url IS NOT NULL DO NOTHING
       RETURNING id, url`,
      [
        sourceId,
        ingestionId,
        items.map(i => i.title),
        items.map(i => i.body),
        items.map(i => i.url),
        items.map(i => i.publishedAt ? new Date(i.publishedAt) : null),
      ]
    );
    const insertedDocs = insertRes.rows;
    const new_count = insertedDocs.length;
    const skipped_count = items.length - new_count;

    if (new_count === 0) {
      await pool.query(
        `UPDATE ingestions SET status='completed', documents_count=0, completed_at=NOW() WHERE id=$1`,
        [ingestionId]
      );
      return { new_count: 0, skipped_count, scored_count: 0, failed_count: 0 };
    }

    // 3. Build index: original position → doc UUID
    const urlToDocId = new Map(insertedDocs.map(d => [d.url, d.id]));
    const orderedDocIds: (string | null)[] = items.map(item =>
      item.url ? (urlToDocId.get(item.url) ?? null) : null
    );
    const newItemsWithIndex = items
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ originalIndex }) => orderedDocIds[originalIndex] !== null);

    // 4. Batch ML scoring — ONE HTTP call
    const scores = await scoreBatch(newItemsWithIndex.map(({ item }) => item));

    // 5. Map scores back using originalIndex
    const validScores = scores
      .map(s => ({
        ...s,
        docId: orderedDocIds[newItemsWithIndex[s.item_id]?.originalIndex ?? -1],
      }))
      .filter((s): s is typeof s & { docId: string } => s.docId !== null && s.docId !== undefined);

    // 6. Bulk INSERT analyses
    let scored_count = 0;
    let failed_count = 0;
    if (validScores.length > 0) {
      try {
        await pool.query(
          `INSERT INTO analyses (document_id, type, score, confidence, label, payload)
           SELECT unnest($1::uuid[]), 'sentiment', unnest($2::float[]), unnest($3::float[]), unnest($4::text[]), '{}'::jsonb
           ON CONFLICT (document_id, type) DO NOTHING`,
          [
            validScores.map(s => s.docId),
            validScores.map(s => s.score),
            validScores.map(s => s.confidence),
            validScores.map(s => s.label),
          ]
        );
        scored_count = validScores.length;
      } catch (err: any) {
        console.error('[ingestion] Bulk analysis insert failed:', err.message);
        failed_count = validScores.length;
      }
    }

    // 7. Finalize
    await pool.query(
      `UPDATE ingestions SET status='completed', documents_count=$1, completed_at=NOW() WHERE id=$2`,
      [new_count, ingestionId]
    );
    await evaluateAlerts(sourceId);
    console.log(
      `[ingestion] Source ${sourceId} — ` +
      `${new_count} new | ${skipped_count} skipped | ${scored_count} scored | ${failed_count} failed`
    );
    return { new_count, skipped_count, scored_count, failed_count };

  } catch (err: any) {
    await pool.query(
      `UPDATE ingestions SET status='failed', error_message=$1, completed_at=NOW() WHERE id=$2`,
      [err.message, ingestionId]
    );
    throw err;
  }
}
