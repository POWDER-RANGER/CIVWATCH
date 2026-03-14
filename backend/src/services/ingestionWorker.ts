/**
 * Ingestion Worker — fetches RSS, persists documents, triggers ML analysis.
 * Called via POST /api/sources/:id/run
 */
import { pool } from '../db';
import https from 'https';
import http from 'http';
import { evaluateAlerts } from './alertEngine';
import { env } from '../config/env';

interface ParsedItem {
  title: string;
  body: string;
  url: string;
  publishedAt: string | null;
}

/** Minimal RSS/Atom parser using regex — swap for a proper lib in M2 */
function parseRss(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRx = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRx.exec(xml)) !== null) {
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i');
      const match = r.exec(m![1]);
      return (match?.[1] ?? match?.[2] ?? '').trim();
    };
    const title = get('title');
    const body  = get('description') || get('summary') || title;
    const url   = get('link');
    const pub   = get('pubDate') || get('published') || null;
    if (body) items.push({ title, body, url, publishedAt: pub });
  }
  return items.slice(0, 50);
}

async function fetchUrl(rawUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url  = new URL(rawUrl);
    const mod  = url.protocol === 'https:' ? https : http;
    let data   = '';
    const req  = mod.get(rawUrl, { headers: { 'User-Agent': 'CIVWATCH/0.1.0' } }, (res) => {
      res.on('data', (c) => { data += c; });
      res.on('end',  () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('RSS fetch timeout')));
  });
}

async function analyzeSentiment(text: string): Promise<{ score: number; confidence: number; label: string }> {
  return new Promise((resolve, reject) => {
    const body    = JSON.stringify({ text: text.slice(0, 2000) });
    const mlUrl   = new URL(`${env.ML_SERVICE_URL}/analyze/sentiment`);
    const isHttps = mlUrl.protocol === 'https:';
    const mod     = isHttps ? https : http;
    const options = {
      hostname: mlUrl.hostname,
      port:     mlUrl.port || (isHttps ? 443 : 80),
      path:     mlUrl.pathname,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    let data = '';
    const req = mod.request(options, (res) => {
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error('ML parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('ML timeout')));
    req.write(body); req.end();
  });
}

export async function runIngestion(sourceId: string): Promise<{ count: number }> {
  const srcRows = await pool.query<any>('SELECT * FROM sources WHERE id = $1', [sourceId]);
  const source  = srcRows.rows[0];
  if (!source) throw new Error('Source not found');
  if (!source.url) throw new Error('Source has no URL');

  // Create ingestion record
  const ing = await pool.query<any>(
    `INSERT INTO ingestions (source_id, status, started_at)
     VALUES ($1, 'running', NOW()) RETURNING id`,
    [sourceId]
  );
  const ingestionId = ing.rows[0].id;

  try {
    const xml   = await fetchUrl(source.url);
    const items = parseRss(xml);
    let count   = 0;

    for (const item of items) {
      // Insert document (skip duplicates by URL)
      const docRes = await pool.query<any>(
        `INSERT INTO documents (source_id, ingestion_id, title, body, url, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING RETURNING id`,
        [sourceId, ingestionId, item.title, item.body, item.url || null,
         item.publishedAt ? new Date(item.publishedAt) : null]
      );
      if (!docRes.rows.length) continue;
      const docId = docRes.rows[0].id;
      count++;

      // Run sentiment analysis
      try {
        const result = await analyzeSentiment(item.body);
        await pool.query(
          `INSERT INTO analyses (document_id, type, score, confidence, label)
           VALUES ($1, 'sentiment', $2, $3, $4)`,
          [docId, result.score, result.confidence, result.label]
        );
      } catch (e: any) {
        console.warn('[ingestion] Sentiment failed for doc', docId, e.message);
      }
    }

    // Mark ingestion complete
    await pool.query(
      `UPDATE ingestions SET status='completed', documents_count=$1, completed_at=NOW() WHERE id=$2`,
      [count, ingestionId]
    );

    // Evaluate alert rules
    await evaluateAlerts(sourceId);

    console.log(`[ingestion] Source ${sourceId} — ${count} new documents`);
    return { count };

  } catch (err: any) {
    await pool.query(
      `UPDATE ingestions SET status='failed', error_message=$1, completed_at=NOW() WHERE id=$2`,
      [err.message, ingestionId]
    );
    throw err;
  }
}
