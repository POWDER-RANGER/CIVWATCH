-- Migration 002: Unique index on documents.url (partial — excludes NULLs)
-- Required by: ingestionWorker.ts ON CONFLICT (url) WHERE url IS NOT NULL
-- Without this index, every ingestion run with a duplicate URL throws:
--   ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification
-- Run BEFORE deploying ingestionWorker.ts from PR #106.

BEGIN;

-- Dedup any existing duplicate URLs before creating the index.
-- Keeps the oldest row (lowest ctid) for each duplicate URL.
DELETE FROM documents
WHERE id NOT IN (
  SELECT DISTINCT ON (url) id
  FROM documents
  WHERE url IS NOT NULL
  ORDER BY url, created_at ASC
);

-- Partial unique index: only enforces uniqueness where url IS NOT NULL.
-- NULL urls (url-less ingestion items) are never considered duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_url_unique
  ON documents(url)
  WHERE url IS NOT NULL;

-- Prevent duplicate sentiment rows on ingestion retries.
-- ON CONFLICT DO NOTHING in ingestionWorker.ts requires this to be meaningful.
CREATE UNIQUE INDEX IF NOT EXISTS idx_analyses_doc_type
  ON analyses(document_id, type);

COMMIT;
