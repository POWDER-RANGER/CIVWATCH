# CIVWATCH Architecture Reference

> **Standard**: C4 Model | **Source**: [c4model.com](https://c4model.com/)  
> **Status**: Phase 1 (Electron + Ingestion Pipeline) — In Progress

---

## Canonical Port Map

| Service | Internal Port | External (dev) | Env Override | Notes |
|---------|--------------|----------------|--------------|-------|
| Frontend | 5173 | 5173 | — | Vite dev server |
| Backend | 3000 | 3000 | `PORT` | Express API |
| ML Service | 5000 | 5000 | `FASTAPI_PORT` | FastAPI / Uvicorn |
| PostgreSQL | 5432 | 5432 | `POSTGRES_PORT` | Postgres 15 |
| Redis | 6379 | 6379 | `REDIS_PORT` | Redis 7 |

> **Electron mode:** Backend (3000) and ML (5000) bind to `127.0.0.1` only. Frontend is served from Electron's `loadFile()` — no external port.

All ports configurable via root `.env`. See `.env.example`.

---

## C4 Model: System Context (Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CIVWATCH SYSTEM                                    │
│                                                                              │
│   ┌──────────────┐    HTTPS/WSS     ┌──────────────────────────────────┐   │
│   │   Analyst    │◄───────────────►│                                  │   │
│   │  (Browser)   │                  │         CIVWATCH Platform        │   │
│   └──────────────┘                  │                                  │   │
│                                     │  ┌──────────┐  ┌──────────────┐ │   │
│   ┌──────────────┐    HTTPS/WSS     │  │  Web UI  │  │  REST API    │ │   │
│   │   Citizen    │◄───────────────►│  │ (React)  │  │  (Express)   │ │   │
│   │  (Browser)   │                  │  └──────────┘  └──────────────┘ │   │
│   └──────────────┘                  │                                  │   │
│                                     │  ┌──────────┐  ┌──────────────┐ │   │
│   ┌──────────────┐    WebSocket     │  │   ML     │  │   Alert      │ │   │
│   │  External    │◄───────────────►│  │ Pipeline │  │  Dispatch    │ │   │
│   │   Systems    │                  │  │(FastAPI) │  │              │ │   │
│   │(Slack/PD/    │                  │  └──────────┘  └──────────────┘ │   │
│   │ Discord)     │                  │                                  │   │
│   └──────────────┘                  └──────────────────────────────────┘   │
│           ▲                                                                  │
│           │ Webhooks                                                         │
│   ┌───────┴──────┐                                                           │
│   │              │                                                           │
│   ▼              ▼                                                           │
│ ┌──────────┐  ┌──────────┐                                                   │
│ │  RSS/    │  │  Civic   │                                                   │
│ │  APIs    │  │  Portals │                                                   │
│ └──────────┘  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Primary Users:**
- **Analysts**: Power users who configure monitors, review anomalies, generate reports
- **Citizens**: General public accessing transparency dashboards and published reports
- **External Systems**: Slack, PagerDuty, Discord receiving webhook notifications

**External Data Sources:**
- RSS feeds (government websites, news outlets)
- REST APIs (OpenFEC, Census Bureau, Open311, SEC EDGAR)
- Web scrapers (civic portals, meeting minutes)
- File uploads (CSV, JSON, XML bulk data)

---

## C4 Model: Container Diagram (Level 2)

### Docker / Web Deployment Mode

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        civwatch_net (Docker Network)                         │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Nginx Reverse Proxy                            │   │
│  │                    (TLS termination, rate limiting)                    │   │
│  └─────────────────────────────┬────────────────────────────────────────┘   │
│                                │                                             │
│        ┌───────────────────────┼───────────────────────┐                     │
│        ▼                       ▼                       ▼                     │
│  ┌──────────┐          ┌──────────────┐        ┌──────────────┐            │
│  │ Frontend │          │   Backend    │        │  ML Service  │            │
│  │ (React)  │          │  (Express)   │        │  (FastAPI)   │            │
│  │          │◄────────►│              │◄──────►│              │            │
│  │ - Vite   │   HTTP   │ - Auth       │  HTTP  │ - Sentiment  │            │
│  │ - MUI    │          │ - API routes │        │ - NER        │            │
│  │ - Charts │          │ - WebSocket  │        │ - Anomaly    │            │
│  └──────────┘          │ - Webhooks   │        │ - Topics     │            │
│                        └──────┬───────┘        └──────────────┘            │
│                               │                                             │
│              ┌────────────────┼────────────────┐                           │
│              ▼                ▼                ▼                           │
│        ┌──────────┐   ┌──────────┐    ┌──────────────┐                    │
│        │PostgreSQL│   │  Redis   │    │ Object Store │                    │
│        │          │   │          │    │ (S3/MinIO)   │                    │
│        │ - Users  │   │ - Cache  │    │ - Reports    │                    │
│        │ - Docs   │   │ - Queue  │    │ - Exports    │                    │
│        │ - Alerts │   │ - Pub/Sub│    │ - Artifacts  │                    │
│        └──────────┘   └──────────┘    └──────────────┘                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Electron / Standalone Desktop Mode

```
civwatch.exe (Electron Main Process)
├── Renderer Process (Chromium + React)
│   └── loadFile() → local UI (no external port)
│
├── Node.js Backend Subprocess (:3000 → 127.0.0.1 ONLY)
│   ├── Express API server
│   ├── SQLite database (%APPDATA%/CIVWATCH/civwatch.db)
│   └── IPC handlers via contextBridge
│
└── Python ML Subprocess (:5000 → 127.0.0.1 ONLY)
    ├── FastAPI / Uvicorn
    ├── TensorFlow.js / ONNX Runtime models
    └── Direct HTTP from backend (localhost only)

No external ports. No Docker. No Python/Node install required.
```

---

## C4 Model: Component Diagram (Level 3)

### Backend Service Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend (:3000)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Source     │  │   Monitor    │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  │              │  │              │  │              │      │
│  │ - JWT issue  │  │ - CRUD       │  │ - Scheduler  │      │
│  │ - bcrypt     │  │ - Validate   │  │ - Rules      │      │
│  │ - RBAC       │  │ - Test conn  │  │ - Lifecycle  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │   Ingestion  │  │   Analytics  │  │   Alert      │      │
│  │   Pipeline   │  │   Engine     │  │   Dispatcher │      │
│  │              │  │              │  │              │      │
│  │ - sanitize() │  │ - Aggregate  │  │ - Evaluate   │      │
│  │ - aggregate()│  │ - Timeseries │  │ - Escalate   │      │
│  │ - Normalize  │  │ - Heatmap    │  │ - Notify     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │   Report     │  │   WebSocket  │  │   Webhook    │      │
│  │   Generator  │  │   Manager    │  │   Manager    │      │
│  │              │  │              │  │              │      │
│  │ - PDF/CSV    │  │ - Real-time  │  │ - HMAC sig   │      │
│  │ - Templates  │  │ - Subscribe  │  │ - Retry      │      │
│  │ - Schedule   │  │ - Broadcast  │  │ - Delivery   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                         │   │
│  │  RateLimit │ CORS │ Helmet │ Validation │ AuditLog   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### ML Service Components

```
┌─────────────────────────────────────────────────────────────┐
│                   ML Service (:5000)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Sentiment  │  │      NER     │  │    Topic     │      │
│  │   Analyzer   │  │  Extraction  │  │  Classifier  │      │
│  │              │  │              │  │              │      │
│  │ - vader+ML   │  │ - spaCy      │  │ - LDA/BERT   │      │
│  │ - Confidence │  │ - Custom     │  │ - Hierarchical│      │
│  │ - [-1,1]     │  │ - GPE/ORG/PER│  │ - Confidence │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │              Anomaly Detection Engine                  │    │
│  │                                                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │  DBSCAN  │  │ Isolation│  │   Statistical    │   │    │
│  │  │ Cluster  │  │  Forest  │  │   Z-Score        │   │    │
│  │  │          │  │          │  │                  │   │    │
│  │  │ eps:     │  │ contam:  │  │ threshold:       │   │    │
│  │  │ 0.5      │  │ 0.05-0.1 │  │ 2.5-3.0 sigma    │   │    │
│  │  │ minPts:  │  │          │  │                  │   │    │
│  │  │ 5        │  │          │  │                  │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  │                                                        │    │
│  │  Ensemble: weighted voting across all three detectors  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Model Registry (MLflow)                  │   │
│  │  - Version tracking │ A/B testing │ Rollback support  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Ingestion Pipeline

```
External Source (RSS/API/Scraper/File)
    │
    ▼
┌──────────────┐
│   Fetcher    │ ──► Rate-limited, respects robots.txt, retry with backoff
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Sanitize   │ ──► Deduplication, PII scrubbing, encoding normalization
│   (sanitize) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Validate   │ ──► JSON Schema validation, field type checking
│   (schema)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Enrich     │ ──► NER extraction, geocoding, entity linking
│   (NLP/ML)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Store      │ ──► PostgreSQL (documents), Redis (cache/index)
│   (persist)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Aggregate  │ ──► Roll-up stats, confidence scoring, trend detection
│   (aggregate)│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Alert      │ ──► Rule evaluation, threshold checks, notification dispatch
│   (evaluate) │
└──────────────┘
```

### Anomaly Detection Flow

```
Ingested Documents
    │
    ▼
Feature Extraction ──► numerical, categorical, temporal, textual features
    │
    ▼
┌─────────────────────────────────────────┐
│         Feature Store (Feast)            │
│  - Historical feature serving           │
│  - Point-in-time correct joins          │
│  - Online + offline consistency         │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│ DBSCAN │  │ Isolation│  │ Z-Score  │
│        │  │ Forest   │  │          │
│ Density│  │ Ensemble │  │ Stat.    │
│ -based │  │ trees    │  │ outlier  │
└────┬───┘  └────┬─────┘  └────┬─────┘
     │           │             │
     └───────────┼─────────────┘
                 ▼
         Ensemble Voting
         (weighted average)
                 │
                 ▼
     ┌───────────────────────┐
     │   Anomaly Score [0,1]  │
     │   + Confidence [0,1]   │
     └───────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
  Store      Evaluate     Notify
  (DB)      (Rules)      (Alerts)
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite + MUI | Dashboard UI, data visualization |
| **Backend** | Express.js (Node 20) | REST API, WebSocket, job scheduling |
| **ML** | FastAPI + Uvicorn (Python 3.11) | NLP models, anomaly detection |
| **Database** | PostgreSQL 15 | Primary data store |
| **Cache/Queue** | Redis 7 | Caching, pub/sub, job queue |
| **Storage** | MinIO / S3 | Report exports, file uploads |
| **Message Queue** | BullMQ (Redis-backed) | Reliable background job processing |
| **Auth** | NextAuth.js + JWT | OAuth + session management |
| **ORM** | Prisma | Type-safe database access |
| **ML Framework** | TensorFlow.js + ONNX Runtime | Model inference and portability |
| **Feature Store** | Feast | ML feature serving |
| **Model Registry** | MLflow | Model versioning and tracking |
| **Monitoring** | Prometheus + Grafana | Metrics and dashboards |
| **Tracing** | OpenTelemetry | Distributed tracing |
| **Logging** | Pino (Node) + structlog (Python) | Structured logging |

---

## Planned vs Implemented

| Feature | Status | Target Phase |
|--------|--------|-------------|
| Docker Compose stack (5 services) | ✅ Complete | Phase 0 |
| `.env.example` templates | ✅ Complete | Phase 0 |
| CI/CD pipeline (GitHub Actions) | ✅ Complete | Phase 0 |
| Security scanning (CodeQL, Bandit, Semgrep) | ✅ Complete | Phase 0 |
| Ingestion pipeline (schema + sanitize + aggregate) | ✅ Complete | Phase 1 |
| Electron shell + IPC bridge | ✅ Complete | Phase 1 |
| JWT authentication | 🟡 In Progress | Phase 1 |
| RSS source CRUD | 🟡 In Progress | Phase 1 |
| FastAPI ML service — sentiment | ✅ Scaffold live | Phase 1 |
| PostgreSQL schema + migrations | 🟡 In Progress | Phase 1 |
| React dashboard | 🟡 In Progress | Phase 1 |
| Security hardening (bcrypt, rate limits) | 🟡 In Progress | Phase 1 |
| API polling source type | ⏳ Planned | Phase 2 |
| NER / topic classification | ⏳ Planned | Phase 2 |
| Report export (PDF/CSV/JSON) | ⏳ Planned | Phase 2 |
| PyInstaller ML binary | ⏳ Planned | Phase 2 |
| DBSCAN anomaly detection (tunable) | ⏳ Planned | Phase 2 |
| Monitor scheduling engine | ⏳ Planned | Phase 2 |
| SQLite migration (Electron) | ⏳ Planned | Phase 3 |
| Settings UI | ⏳ Planned | Phase 3 |
| Prometheus metrics | ⏳ Planned | Phase 3 |
| Sentry error tracking | ⏳ Planned | Phase 3 |
| NSIS installer + code signing | ⏳ Planned | Phase 4 |
| Auto-updater | ⏳ Planned | Phase 4 |

---

## Data Model (Simplified)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────►│   Source     │────►│  Document    │
│              │     │              │     │              │
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ email        │     │ userId (FK)  │     │ sourceId(FK) │
│ role         │     │ type         │     │ content      │
│ orgId        │     │ config       │     │ metadata     │
│ createdAt    │     │ status       │     │ sentiment    │
└──────────────┘     └──────────────┘     │ entities     │
                                          │ topics       │
                                          │ createdAt    │
                                          └──────┬───────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    ▼                            ▼                            ▼
            ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
            │   Analysis   │          │    Alert     │          │    Report    │
            │              │          │              │          │              │
            │ id (PK)      │          │ id (PK)      │          │ id (PK)      │
            │ docId (FK)   │          │ monitorId(FK)│          │ type         │
            │ sentiment    │          │ severity     │          │ period       │
            │ confidence   │          │ status       │          │ format       │
            │ entities     │          │ context      │          │ status       │
            │ topics       │          │ createdAt    │          │ downloadUrl  │
            └──────────────┘          └──────────────┘          └──────────────┘
```

---

## Communication Patterns

| Pattern | Use Case | Technology |
|---------|----------|------------|
| **Sync HTTP** | API requests, ML inference | Express ↔ FastAPI |
| **WebSocket** | Real-time alerts, live dashboard | Socket.io / ws |
| **Pub/Sub** | Job queue, cache invalidation | Redis channels |
| **Background Jobs** | Ingestion, report generation | BullMQ workers |
| **Webhooks** | External system integration | Outgoing HTTPS |
| **gRPC** | Cross-repo agent communication (future) | OBELISK integration |

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
│                                                              │
│  Layer 1: TLS 1.3 + Cert pinning (external)                 │
│  Layer 2: JWT auth + refresh rotation                       │
│  Layer 3: RBAC (admin/analyst/viewer)                       │
│  Layer 4: Rate limiting (per-user + per-IP)                 │
│  Layer 5: Input validation (Zod schemas)                    │
│  Layer 6: Helmet.js (CSP, HSTS, X-Frame)                    │
│  Layer 7: CORS (whitelist only)                             │
│  Layer 8: SQL injection prevention (Prisma ORM)             │
│  Layer 9: Audit logging (all admin actions)                 │
│  Layer 10: Secret management (HashiCorp Vault / AWS SM)     │
└─────────────────────────────────────────────────────────────┘
```

---

## See Also

- [API Specification](./API.md) — Full REST API documentation
- [ML Tuning Guide](./ML_TUNING.md) — Anomaly detection configuration
- [Threat Model](./THREAT_MODEL.md) — Security threat analysis
- [Deployment Guide](./DEPLOYMENT.md) — Infrastructure setup
- [Performance Guide](./PERFORMANCE.md) — SRE and optimization
- [Data Lineage](./DATA_LINEAGE.md) — Data provenance tracking
- [Security Policy](./SECURITY.md) — Vulnerability reporting
