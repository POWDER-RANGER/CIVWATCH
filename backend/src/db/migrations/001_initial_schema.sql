-- CIVWATCH Initial Schema
-- Migration: 001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,  -- bcrypt hash
  role        TEXT        NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin','analyst','viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Sources ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'rss' CHECK (type IN ('rss','api','upload')),
  url         TEXT,
  config      JSONB       NOT NULL DEFAULT '{}',
  active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_user_id ON sources(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_type    ON sources(type);

-- ── Ingestions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingestions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID        NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  status          TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  documents_count INTEGER     NOT NULL DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingestions_source_id ON ingestions(source_id);
CREATE INDEX IF NOT EXISTS idx_ingestions_status    ON ingestions(status);

-- ── Documents ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id    UUID        NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  ingestion_id UUID        REFERENCES ingestions(id) ON DELETE SET NULL,
  title        TEXT,
  body         TEXT        NOT NULL,
  url          TEXT,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_source_id    ON documents(source_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at   ON documents(created_at DESC);

-- ── Analyses ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID    NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  type         TEXT    NOT NULL DEFAULT 'sentiment' CHECK (type IN ('sentiment','ner','topic','summary','anomaly')),
  score        FLOAT,
  confidence   FLOAT,
  label        TEXT,
  payload      JSONB   NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON analyses(document_id);
CREATE INDEX IF NOT EXISTS idx_analyses_type        ON analyses(type);
CREATE INDEX IF NOT EXISTS idx_analyses_score       ON analyses(score);

-- ── Alert Rules ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_rules (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id   UUID    REFERENCES sources(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  metric      TEXT    NOT NULL DEFAULT 'avg_sentiment',
  operator    TEXT    NOT NULL DEFAULT 'lt' CHECK (operator IN ('lt','gt','lte','gte','eq')),
  threshold   FLOAT   NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);

-- ── Alerts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id       UUID    NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  triggered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value         FLOAT   NOT NULL,
  notified      BOOLEAN NOT NULL DEFAULT FALSE,
  payload       JSONB   NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_alerts_rule_id       ON alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at  ON alerts(triggered_at DESC);
