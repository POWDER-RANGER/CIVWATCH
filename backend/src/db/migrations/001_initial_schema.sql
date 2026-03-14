-- ============================================================
-- CIVWATCH — Migration 001: Initial Schema
-- Run order: 001 → applied first on clean DB
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'analyst'
                            CHECK (role IN ('admin', 'analyst', 'viewer')),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ============================================================
-- SOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  type         TEXT        NOT NULL CHECK (type IN ('rss', 'api', 'upload')),
  url          TEXT,
  config       JSONB       NOT NULL DEFAULT '{}',
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  last_run_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_user_id  ON sources (user_id);
CREATE INDEX IF NOT EXISTS idx_sources_type     ON sources (type);
CREATE INDEX IF NOT EXISTS idx_sources_active   ON sources (is_active);

-- ============================================================
-- INGESTIONS (run tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS ingestions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID        NOT NULL REFERENCES sources (id) ON DELETE CASCADE,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  documents_found INTEGER     NOT NULL DEFAULT 0,
  documents_new   INTEGER     NOT NULL DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingestions_source_id ON ingestions (source_id);
CREATE INDEX IF NOT EXISTS idx_ingestions_status    ON ingestions (status);
CREATE INDEX IF NOT EXISTS idx_ingestions_created   ON ingestions (created_at DESC);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id    UUID        NOT NULL REFERENCES sources (id) ON DELETE CASCADE,
  ingestion_id UUID        REFERENCES ingestions (id) ON DELETE SET NULL,
  external_id  TEXT,                          -- Original ID from source feed
  title        TEXT,
  content      TEXT        NOT NULL,
  url          TEXT,
  author       TEXT,
  published_at TIMESTAMPTZ,
  metadata     JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_source_id    ON documents (source_id);
CREATE INDEX IF NOT EXISTS idx_documents_ingestion_id ON documents (ingestion_id);
CREATE INDEX IF NOT EXISTS idx_documents_published    ON documents (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_external     ON documents (source_id, external_id);

-- ============================================================
-- ANALYSES  (sentiment results)
-- ============================================================
CREATE TABLE IF NOT EXISTS analyses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID        NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  analysis_type   TEXT        NOT NULL DEFAULT 'sentiment'
                              CHECK (analysis_type IN ('sentiment', 'ner', 'topic', 'summary', 'anomaly')),
  score           NUMERIC(6,4),              -- sentiment: -1.0000 to 1.0000
  confidence      NUMERIC(6,4),
  label           TEXT,
  result          JSONB       NOT NULL DEFAULT '{}',  -- Raw ML output
  model_version   TEXT,
  processing_ms   INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_document_id   ON analyses (document_id);
CREATE INDEX IF NOT EXISTS idx_analyses_type          ON analyses (analysis_type);
CREATE INDEX IF NOT EXISTS idx_analyses_score         ON analyses (score);
CREATE INDEX IF NOT EXISTS idx_analyses_created       ON analyses (created_at DESC);

-- ============================================================
-- ALERT RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS alert_rules (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  rule_type       TEXT        NOT NULL DEFAULT 'avg_sentiment'
                              CHECK (rule_type IN ('avg_sentiment', 'doc_count', 'keyword')),
  threshold       NUMERIC(6,4) NOT NULL,
  operator        TEXT        NOT NULL DEFAULT 'gt'
                              CHECK (operator IN ('gt', 'lt', 'gte', 'lte')),
  source_id       UUID        REFERENCES sources (id) ON DELETE CASCADE,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  notification_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id  ON alert_rules (user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active   ON alert_rules (is_active);

-- ============================================================
-- ALERTS  (triggered events)
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_rule_id   UUID        NOT NULL REFERENCES alert_rules (id) ON DELETE CASCADE,
  ingestion_id    UUID        REFERENCES ingestions (id) ON DELETE SET NULL,
  actual_value    NUMERIC(10,4),
  threshold_value NUMERIC(10,4),
  message         TEXT,
  notified        BOOLEAN     NOT NULL DEFAULT FALSE,
  notified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_rule_id   ON alerts (alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created   ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_notified  ON alerts (notified);

-- ============================================================
-- MONITORS  (scheduled ingestion runners — M2)
-- ============================================================
CREATE TABLE IF NOT EXISTS monitors (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  source_id    UUID        NOT NULL REFERENCES sources (id) ON DELETE CASCADE,
  schedule     TEXT        NOT NULL DEFAULT 'hourly'
                           CHECK (schedule IN ('hourly', 'daily', 'weekly')),
  filters      JSONB       NOT NULL DEFAULT '{}',
  is_active    BOOLEAN     NOT NULL DEFAULT FALSE,
  last_run_at  TIMESTAMPTZ,
  next_run_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitors_user_id    ON monitors (user_id);
CREATE INDEX IF NOT EXISTS idx_monitors_active     ON monitors (is_active);
CREATE INDEX IF NOT EXISTS idx_monitors_next_run   ON monitors (next_run_at);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','sources','alert_rules','monitors'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
       CREATE TRIGGER trg_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t
    );
  END LOOP;
END $$;
