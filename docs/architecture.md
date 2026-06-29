# CIVWATCH architecture overview

This document describes the major components and dataflows in CIVWATCH, focusing on authentication, ingestion, lineage (OpenLineage), ML service, and the outbox reliability pattern.

1) High-level components
- Backend API (Node/TypeScript): handles auth, ingestion endpoints, and business logic.
- Database (Postgres): stores users, civic_records, refresh_tokens, outbox.
- Outbox Worker: background worker responsible for delivering events (OpenLineage) from the transactional outbox.
- OpenLineage collector: external service that receives lineage events (HTTP API).
- ML Service (FastAPI): clustering (DBSCAN ensemble) and NER/topic extraction; used asynchronously from pipeline.
- Frontend: React app using httpOnly refresh cookies and short-lived access tokens.

2) Auth flow (secure rotation)
- Login:
  - User posts credentials to /auth/login.
  - Backend validates credentials and issues an access token (RS256 JWT, short-lived) and a refresh token (cryptographically-random raw token stored hashed in DB).
  - Refresh token is set as a secure, HttpOnly cookie with SameSite=strict.

- Refresh:
  - Client calls /auth/refresh (cookie sent automatically).
  - Backend verifies hashed token in DB; on success rotates the refresh token (revoke old, issue/store new hash) and returns a new access token.
  - Rotation prevents replay of stolen refresh tokens. Reuse detection triggers revoke-all and alerting.

- Logout:
  - Backend revokes the refresh token and clears cookie.

3) Ingestion & Lineage (transactional outbox)
- Ingest endpoint (POST /ingest): validated and sanitized payload inserted into civic_records within a DB transaction.
- As part of the same transaction, an outbox row is written with topic "openlineage" and the lineage payload.
- Outbox Worker:
  - Periodically polls the outbox table, acquiring a Postgres advisory lock for safe single-writer behavior.
  - Attempts delivery to OpenLineage using a circuit-breaker and retries; on success marks outbox row processed.
  - On repeated failures, increments tries and records last_error; metrics emitted for monitoring.

Design guarantees:
- At-least-once delivery for lineage events via transactional outbox.
- Consumers should be idempotent; payloads include record identifiers.

4) ML integration
- After ingest/aggregation, the backend may call the ML service for clustering and NER.
- ML service exposes /cluster and /tune endpoints; calls are wrapped in a circuit breaker with fallback heuristics.
- ML outputs (clusters, NER topics) can be written back to DB or emitted as additional outbox events.

5) Observability
- Metrics (Prometheus via prom-client) include:
  - civic_ingestions_total
  - refresh_attempts_total, refresh_failures_total, refresh_revocations_total
  - outbox_failures_total
- Logs are structured and include correlation/request IDs for traceability.
- OpenTelemetry traces can be added to end-to-end flows (recommended for high-traffic paths).

6) Migrations & zero-downtime upgrades
- Migrations are idempotent SQL files (migrations/).
- Use expand-migrate-contract pattern for schema changes that require zero downtime.
- Migration playbook in PRs should include rollout verification and rollback steps.

7) Deployment and CI
- CI runs lint, tests, and migrations in an isolated Postgres service.
- Worker processes (outbox worker) should be run as separate containers or Kubernetes jobs with leader election (advisory lock used for safety).
- Deploy using immutable images tagged with commit SHA; use feature flags for staged rollouts.

8) Security notes
- Keep JWT keys and other secrets in a secret manager (GitHub Secrets, Vault).
- Rotate JWT keys periodically and design JWT verification to support public key rotation.
- Use httpOnly cookies and CSRF protections for browser-based flows.

9) Operational runbook items
- Monitor outbox queue length and failure rates; alert if backlog grows > X (configurable).
- Monitor refresh failure spikes and token reuse events (security incident potential).
- Health checks for backend, outbox worker, and ML service.

For more details, see individual module docs in /backend and /ml.
