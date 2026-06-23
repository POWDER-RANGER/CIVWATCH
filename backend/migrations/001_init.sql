-- CIVWATCH Production Schema
-- Complete initialization with all tables, indexes, triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- Users & Authentication
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'analyst', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token_hash);

-- --------------------------------------------------------
-- Data Sources
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'api', -- api, scrape, upload
    config JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'error', 'paused')),
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    run_interval_minutes INTEGER DEFAULT 60,
    record_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_sources_category ON data_sources(category);
CREATE INDEX idx_data_sources_status ON data_sources(status);

-- --------------------------------------------------------
-- Documents (ingested records)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(255),
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source_category VARCHAR(50) NOT NULL, -- contracts, campaign_finance, legislation, etc.
    source_type VARCHAR(50) DEFAULT 'api',
    published_date TIMESTAMP,
    recorded_date TIMESTAMP,
    amount NUMERIC(15, 2),
    contributor_name VARCHAR(255),
    recipient_name VARCHAR(255),
    awarding_agency VARCHAR(255),
    congress INTEGER,
    bill_number VARCHAR(50),
    bill_type VARCHAR(20),
    state VARCHAR(2),
    session VARCHAR(50),
    latest_action JSONB,
    raw_text TEXT,
    metadata JSONB DEFAULT '{}',
    embedding VECTOR(384), -- For similarity search (if pgvector available)
    anomaly_score NUMERIC(5, 4),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_category ON documents(source_category);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_amount ON documents(amount) WHERE amount IS NOT NULL;
CREATE INDEX idx_documents_contributor ON documents(contributor_name) WHERE contributor_name IS NOT NULL;
CREATE INDEX idx_documents_recipient ON documents(recipient_name) WHERE recipient_name IS NOT NULL;
CREATE INDEX idx_documents_state ON documents(state) WHERE state IS NOT NULL;
CREATE INDEX idx_documents_metadata ON documents USING GIN(metadata);

-- Full-text search index
CREATE INDEX idx_documents_fts ON documents USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(raw_text, '')));

-- --------------------------------------------------------
-- Anomalies (ML-detected)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    record_source VARCHAR(100) NOT NULL,
    record_category VARCHAR(50) NOT NULL,
    method VARCHAR(50) NOT NULL, -- isolation_forest, lof, autoencoder, composite
    score NUMERIC(5, 4) NOT NULL CHECK (score >= 0 AND score <= 1),
    label VARCHAR(255) NOT NULL,
    description TEXT,
    confidence VARCHAR(20) CHECK (confidence IN ('low', 'medium', 'high')),
    features JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'false_positive')),
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anomalies_status ON anomalies(status);
CREATE INDEX idx_anomalies_score ON anomalies(score DESC);
CREATE INDEX idx_anomalies_method ON anomalies(method);
CREATE INDEX idx_anomalies_created ON anomalies(created_at DESC);
CREATE INDEX idx_anomalies_document ON anomalies(document_id);

-- --------------------------------------------------------
-- Alert Rules
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    source_category VARCHAR(50),
    metric VARCHAR(50) NOT NULL, -- count, amount, score, etc.
    operator VARCHAR(10) NOT NULL CHECK (operator IN ('gt', 'lt', 'eq', 'contains')),
    threshold NUMERIC(15, 4) NOT NULL,
    lookback_minutes INTEGER DEFAULT 60,
    channel VARCHAR(20) NOT NULL DEFAULT 'websocket' CHECK (channel IN ('email', 'webhook', 'websocket', 'all')),
    email_recipients TEXT[],
    webhook_url TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX idx_alert_rules_category ON alert_rules(source_category);

-- Alert events (firing history)
CREATE TABLE IF NOT EXISTS alert_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    triggered_value NUMERIC(15, 4) NOT NULL,
    threshold NUMERIC(15, 4) NOT NULL,
    fired_at TIMESTAMP NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(id)
);

CREATE INDEX idx_alert_events_alert ON alert_events(alert_id);
CREATE INDEX idx_alert_events_fired ON alert_events(fired_at DESC);

-- --------------------------------------------------------
-- Audit Log
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- --------------------------------------------------------
-- Triggers
-- --------------------------------------------------------

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'data_sources', 'documents', 'anomalies', 'alert_rules')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- Anomaly notification trigger
CREATE OR REPLACE FUNCTION notify_anomaly_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('anomaly_channel', json_build_object(
        'id', NEW.id,
        'document_id', NEW.document_id,
        'score', NEW.score,
        'label', NEW.label,
        'method', NEW.method,
        'status', NEW.status
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS anomaly_insert_trigger ON anomalies;
CREATE TRIGGER anomaly_insert_trigger
    AFTER INSERT ON anomalies
    FOR EACH ROW
    EXECUTE FUNCTION notify_anomaly_insert();

-- --------------------------------------------------------
-- Default admin user (password: changeme123)
-- bcrypt hash for 'changeme123'
-- --------------------------------------------------------

INSERT INTO users (email, password_hash, role, status)
VALUES (
    'admin@civwatch.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6',
    'admin',
    'active'
)
ON CONFLICT (email) DO NOTHING;
