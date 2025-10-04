# CIVWATCH Architecture

## Overview
CIVWATCH is a modular, cloud-native platform composed of frontend, backend, and ML services orchestrated via Docker and optionally Kubernetes. It follows a microservices-friendly, API-first design with strict security and observability.

## Component Diagram (Mermaid)
```mermaid
graph TB
  UI[Web UI (React+TS)] --> API[API Gateway (Express)]
  API --> SVC_MON[Monitoring Service]
  API --> SVC_ANALYTICS[Analytics Service]
  API --> SVC_ALERTS[Alerts Service]
  SVC_MON --> KAFKA[(Event Stream)]
  SVC_ANALYTICS --> DB[(PostgreSQL)]
  SVC_ALERTS --> REDIS[(Redis)]
  SVC_ANALYTICS --> ML[ML Engine (TensorFlow/FastAPI)]
  ML --> REG[Model Registry]
```

## Core Components
- Web UI: React 18 + TypeScript + Tailwind
- API Gateway: Node.js + Express + TypeScript
- Services: Modular services for monitoring, analytics, alerts, reporting
- Data Store: PostgreSQL (OLTP) + optional time-series extension
- Cache/Queue: Redis for caching, rate-limiting, queues
- Stream: Kafka (optional for large-scale streaming)
- ML Engine: Python (FastAPI) hosting TensorFlow/PyTorch models

## Data Flow
1. Ingestion: Sources (API/RSS/Scraper/Upload) feed Monitoring Service
2. Stream: Events optionally published to Kafka for scale
3. Processing: Analytics Service enriches data (NLP, sentiment, topics)
4. Storage: Normalized into Postgres; cache hot sets in Redis
5. Serving: API provides REST endpoints; UI renders dashboards
6. Alerts: Rules engine evaluates metrics and triggers notifications

## Deployment Topologies
- Local Dev: docker-compose up with Postgres, Redis, services
- Staging/Prod: Kubernetes manifests with Helm or Kustomize
- Cloud: AWS/GCP/Azure with managed Postgres/Redis and object storage

## Security
- Zero-trust network segmentation; services authenticate via JWT/MTLS (optional)
- Secrets in environment variables or sealed secrets
- Role-Based Access Control (RBAC) enforced in API layer
- End-to-end TLS; CSP and security headers on UI
- Audit logging for privileged actions

## Observability
- Metrics: Prometheus; Dashboards: Grafana
- Logs: Structured JSON to ELK/Opensearch
- Traces: OpenTelemetry to Jaeger/Tempo
- Alerts: PagerDuty/Email/Webhooks

## Scalability
- Stateless services horizontally scalable behind load balancer
- Read replicas for Postgres; partitioning for large datasets
- Caching layers to reduce DB pressure
- Queue-based backpressure for ingestion and ML jobs

## Configuration & Environments
- Config via .env and per-environment overrides
- Feature flags for gradual rollouts
- Migrations via Prisma/Knex (Node) and Alembic (Python) if applicable

## API Contracts
- RESTful JSON, pagination, filtering, and error envelopes
- OpenAPI spec published at /api/openapi.json

## Security Model
- Authentication: JWT (short-lived access, refresh tokens)
- Authorization: Roles (admin, analyst, viewer) + resource scopes
- Rate limiting and IP allowlists per token

## Backup & DR
- Nightly Postgres backups; point-in-time recovery
- Redis snapshotting for critical queues (if needed)
- Object storage for reports and ML artifacts

## Roadmap
- Replace docker-compose with Helm charts
- Add streaming-first pipeline with Kafka by default
- Extend plugin runtime sandboxing (WASM)

## References
- ./api.md
- ./plugins.md
- ./testing.md
