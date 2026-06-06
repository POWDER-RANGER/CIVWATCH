-- CIVWATCH Migration: 002_civic_records.sql
-- Civic records, anomaly scoring, DBSCAN cluster output, and ingest queue

-- ── Civic Records (raw ingest payloads) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS civic_records (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source       TEXT        NOT NULL,                          -- e.g. 'FEC-2026-Q1', 'ICE-FOIA-0042'
  content      TEXT        NOT NULL,
  metadata     JSONB       NOT NULL DEFAULT '{}',
  ingest_hash  TEXT        GENERATED ALWAYS AS
                           (encode(digest(content, 'sha256'), 'hex')) STORED,
  scored       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_civic_records_hash     ON civic_records(ingest_hash);
CREATE        INDEX IF NOT EXISTS idx_civic_records_source   ON civic_records(source);
CREATE        INDEX IF NOT EXISTS idx_civic_records_scored   ON civic_records(scored) WHERE scored = FALSE;
CREATE        INDEX IF NOT EXISTS idx_civic_records_created  ON civic_records(created_at DESC);

-- ── Anomaly Scores ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anomaly_scores (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id     UUID        REFERENCES civic_records(id) ON DELETE CASCADE,
  document_id   UUID        REFERENCES documents(id)     ON DELETE CASCADE,
  score         FLOAT       NOT NULL CHECK (score >= 0 AND score <= 1),
  label         TEXT        NOT NULL DEFAULT 'unlabeled',
  method        TEXT        NOT NULL DEFAULT 'zscore' CHECK (method IN ('zscore','dbscan','ml','manual')),
  data          JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT    chk_one_ref CHECK (
    (record_id IS NOT NULL)::int + (document_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_anomaly_scores_score      ON anomaly_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_scores_record     ON anomaly_scores(record_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_scores_document   ON anomaly_scores(document_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_scores_method     ON anomaly_scores(method);
CREATE INDEX IF NOT EXISTS idx_anomaly_scores_created    ON anomaly_scores(created_at DESC);

-- ── DBSCAN Cluster Output ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clusters (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID        NOT NULL,                          -- groups all clusters from one DBSCAN run
  cluster_index INTEGER     NOT NULL,                          -- -1 = noise
  label         TEXT,
  score         FLOAT       CHECK (score >= 0 AND score <= 1),
  centroid      JSONB       NOT NULL DEFAULT '{}',             -- {x, y} or geographic coords
  hex_ids       TEXT[]      NOT NULL DEFAULT '{}',             -- H3 cell IDs for geo clusters
  member_count  INTEGER     NOT NULL DEFAULT 0,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clusters_run_id    ON clusters(run_id);
CREATE INDEX IF NOT EXISTS idx_clusters_score     ON clusters(score DESC);
CREATE INDEX IF NOT EXISTS idx_clusters_created   ON clusters(created_at DESC);

-- ── Cluster Members (join) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cluster_members (
  cluster_id    UUID  NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  record_id     UUID  REFERENCES civic_records(id) ON DELETE CASCADE,
  document_id   UUID  REFERENCES documents(id)     ON DELETE CASCADE,
  PRIMARY KEY (cluster_id, COALESCE(record_id, document_id)),
  CONSTRAINT chk_member_ref CHECK (
    (record_id IS NOT NULL)::int + (document_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_cluster_members_record   ON cluster_members(record_id);
CREATE INDEX IF NOT EXISTS idx_cluster_members_document ON cluster_members(document_id);

-- ── Ingest Queue ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingest_queue (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id   UUID        NOT NULL REFERENCES civic_records(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','processing','done','failed')),
  attempts    INTEGER     NOT NULL DEFAULT 0,
  last_error  TEXT,
  queued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ingest_queue_status  ON ingest_queue(status) WHERE status IN ('pending','processing');
CREATE INDEX IF NOT EXISTS idx_ingest_queue_queued  ON ingest_queue(queued_at ASC);
