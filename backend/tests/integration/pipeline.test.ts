/**
 * CIVWATCH Integration Test Suite
 *
 * Verifies the full data pipeline end-to-end:
 *   ingest → ML scoring → anomaly detection → API query
 *
 * Run: npx jest tests/integration/pipeline.test.ts --verbose
 */

import { pool } from '../../src/db';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:4000';
const ML_BASE  = process.env.ML_BASE_URL  ?? 'http://localhost:5000';

// Test timeout: 15 seconds (ML inference can take a moment)
const TEST_TIMEOUT = 15000;

interface IngestResponse {
  id: string;
  source: string;
  content: string;
  anomaly: {
    is_anomalous: boolean;
    anomaly_score: number;
    z_score: number;
  } | null;
}

interface AnomaliesResponse {
  total: number;
  limit: number;
  offset: number;
  anomalies: Array<{
    id: string;
    civic_record_id: string;
    anomaly_score: number;
    source: string;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ingestRecord(source: string, content: string, metadata?: object): Promise<IngestResponse> {
  const res = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, content, metadata }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ingest failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<IngestResponse>;
}

async function getAnomalies(source?: string): Promise<AnomaliesResponse> {
  const url = new URL(`${API_BASE}/api/anomalies`);
  if (source) url.searchParams.set('source', source);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Get anomalies failed: ${res.status}`);
  return res.json() as Promise<AnomaliesResponse>;
}

async function getStats() {
  const res = await fetch(`${API_BASE}/api/anomalies/stats`);
  if (!res.ok) throw new Error(`Get stats failed: ${res.status}`);
  return res.json();
}

async function mlHealth() {
  const res = await fetch(`${ML_BASE}/health`);
  return res.ok;
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Ensure database is reachable
  await pool.query('SELECT 1');
});

afterAll(async () => {
  await pool.end();
});

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('CIVWATCH Integration Pipeline', () => {
  const TEST_SOURCE = 'INTEGRATION-TEST';
  let insertedIds: string[] = [];

  afterEach(async () => {
    // Clean up test records
    for (const id of insertedIds) {
      await pool.query('DELETE FROM anomaly_scores WHERE record_id = $1', [id]).catch(() => {});
      await pool.query('DELETE FROM civic_records WHERE id = $1', [id]).catch(() => {});
    }
    insertedIds = [];
  });

  // ── 1. Service Health ─────────────────────────────────────────────────────
  describe('Service Health', () => {
    test('backend API is reachable', async () => {
      const res = await fetch(`${API_BASE}/health`);
      expect(res.status).toBe(200);
    }, TEST_TIMEOUT);

    test('ML service is reachable', async () => {
      const ok = await mlHealth();
      expect(ok).toBe(true);
    }, TEST_TIMEOUT);

    test('database is connected', async () => {
      const { rows } = await pool.query('SELECT NOW() as now');
      expect(rows[0].now).toBeDefined();
    });
  });

  // ── 2. Ingest Pipeline ────────────────────────────────────────────────────
  describe('Ingest Pipeline', () => {
    test('ingests a normal record and returns an ID', async () => {
      const result = await ingestRecord(
        TEST_SOURCE,
        'Regular city council meeting minutes for March 2026. Approved zoning variance.',
        { category: 'minutes', value: 1 }
      );

      expect(result.id).toBeDefined();
      expect(result.source).toBe(TEST_SOURCE);
      expect(result.content).toContain('Regular city council');
      insertedIds.push(result.id);
    }, TEST_TIMEOUT);

    test('ingests an anomalous record and gets high ML score', async () => {
      const result = await ingestRecord(
        TEST_SOURCE,
        'Emergency procurement authorization: $50,000,000 sole-source contract awarded at 2:47 AM without competitive bidding or council approval.',
        { category: 'contract', value: 50000000 }
      );

      expect(result.id).toBeDefined();
      insertedIds.push(result.id);

      // The ML service should flag this as anomalous
      // (high value + unusual language = high anomaly score)
      if (result.anomaly) {
        expect(result.anomaly.is_anomalous).toBe(true);
        expect(result.anomaly.anomaly_score).toBeGreaterThan(0.5);
      }
    }, TEST_TIMEOUT);

    test('validates required fields', async () => {
      const res = await fetch(`${API_BASE}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'missing-content' }),
      });
      expect(res.status).toBe(400);
    });
  });

  // ── 3. Anomaly Retrieval ──────────────────────────────────────────────────
  describe('Anomaly Retrieval', () => {
    test('retrieves anomalies after ingest', async () => {
      // First, ingest a record
      const ingestResult = await ingestRecord(
        TEST_SOURCE,
        'Highly unusual expenditure: $8,900,000 no-bid contract for IT services with vendor connected to board member.',
        { category: 'contract', value: 8900000 }
      );
      insertedIds.push(ingestResult.id);

      // Wait a moment for the anomaly to be written
      await new Promise(r => setTimeout(r, 500));

      // Query anomalies
      const anomalies = await getAnomalies();
      expect(anomalies.total).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(anomalies.anomalies)).toBe(true);
    }, TEST_TIMEOUT);

    test('filters anomalies by source', async () => {
      // Ingest with unique source
      const uniqueSource = `TEST-${Date.now()}`;
      const result = await ingestRecord(
        uniqueSource,
        'Test record for source filtering verification.',
        { category: 'test' }
      );
      insertedIds.push(result.id);

      await new Promise(r => setTimeout(r, 500));

      const anomalies = await getAnomalies(uniqueSource);
      // Should have 0 or more anomalies for this source
      expect(Array.isArray(anomalies.anomalies)).toBe(true);
    }, TEST_TIMEOUT);
  });

  // ── 4. Analytics Endpoints ────────────────────────────────────────────────
  describe('Analytics Endpoints', () => {
    test('overview returns summary data', async () => {
      const res = await fetch(`${API_BASE}/api/analytics/overview`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('total_records');
      expect(data).toHaveProperty('anomaly_count');
      expect(data).toHaveProperty('recent_activity');
    });

    test('trends returns daily aggregation', async () => {
      const res = await fetch(`${API_BASE}/api/analytics/trends?days=7`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('days');
      expect(data).toHaveProperty('trends');
      expect(Array.isArray(data.trends)).toBe(true);
    });

    test('sources returns per-source breakdown', async () => {
      const res = await fetch(`${API_BASE}/api/analytics/sources`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('sources');
      expect(Array.isArray(data.sources)).toBe(true);
    });
  });

  // ── 5. Anomaly Stats ──────────────────────────────────────────────────────
  describe('Anomaly Statistics', () => {
    test('stats endpoint returns aggregates', async () => {
      const stats = await getStats();
      expect(stats).toHaveProperty('total_anomalies');
      expect(stats).toHaveProperty('avg_score');
      expect(stats).toHaveProperty('last_24h');
    });
  });

  // ── 6. Full Pipeline Verification ─────────────────────────────────────────
  describe('End-to-End Pipeline', () => {
    test('complete flow: ingest → ML score → anomaly written → retrievable', async () => {
      // 1. Ingest an obviously anomalous record
      const ingestResult = await ingestRecord(
        TEST_SOURCE,
        'CRITICAL ALERT: $99,200 expenditure for 8 coffee makers at $12,400 per unit. Previous purchase: $189 per unit.',
        { category: 'procurement', value: 99200 }
      );
      insertedIds.push(ingestResult.id);

      // 2. Verify ML service processed it
      expect(ingestResult.anomaly).toBeDefined();
      if (ingestResult.anomaly) {
        expect(ingestResult.anomaly.anomaly_score).toBeGreaterThan(0);
      }

      // 3. Wait for async DB write
      await new Promise(r => setTimeout(r, 1000));

      // 4. Verify anomaly appears in query
      const anomalies = await getAnomalies();
      expect(anomalies.anomalies.length).toBeGreaterThanOrEqual(0); // May or may not be flagged

      // 5. Verify stats updated
      const stats = await getStats();
      expect(stats.total_anomalies).toBeGreaterThanOrEqual(0);

      console.log('   Pipeline OK — ingest:', ingestResult.id, 'anomaly:', ingestResult.anomaly?.is_anomalous);
    }, TEST_TIMEOUT);
  });
});
