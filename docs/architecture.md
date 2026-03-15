# CIVWATCH — Architecture Reference

> **Status:** Milestone 0 complete. Implementation in progress (M1).

## Canonical Port Map

| Service   | Internal Port | External (dev) | Notes                        |
|-----------|--------------|----------------|------------------------------|
| Frontend  | 5173         | 5173           | Vite dev server              |
| Backend   | 3000         | 3000           | Express API                  |
| ML Service| 5000         | 5000           | FastAPI / Uvicorn            |
| PostgreSQL| 5432         | 5432           | Postgres 15                  |
| Redis     | 6379         | 6379           | Redis 7                      |

All port mappings are configurable via root `.env` (see `.env.example`).

## Planned vs Implemented

| Feature                        | Planned | Implemented |
|-------------------------------|---------|-------------|
| Docker Compose stack (5 svcs) | ✅      | ✅ M0        |
| `.env.example` templates      | ✅      | ✅ M0        |
| CI/CD pipeline                | ✅      | ✅ M0        |
| Postgres schema (migrations)  | ✅      | ✅ M1        |
| JWT auth (login / me)         | ✅      | ✅ M1        |
| RSS source CRUD               | ✅      | ✅ M1        |
| Analytics overview endpoint   | ✅      | ✅ M1        |
| Alert rules + recent alerts   | ✅      | ✅ M1        |
| FastAPI ML service            | ✅      | ✅ M1        |
| Sentiment analysis endpoint   | ✅      | ✅ M1        |
| React dashboard               | ✅      | ⏳ M1        |
| Threshold alerting            | ✅      | ⏳ M1        |
| Monitor scheduling            | ✅      | ⏳ M2        |
| API polling source type       | ✅      | ⏳ M2        |
| NER / topic classification    | ✅      | ⏳ M2        |
| Report export (JSON/CSV)      | ✅      | ⏳ M2        |
| Prometheus metrics            | ✅      | ⏳ M3        |
| bcrypt + rate limiting        | ✅      | ✅ M1 (backend middleware) |
| Sentry error tracking         | ✅      | ⏳ M3        |

## Service Diagram

```
┌─────────────────────────────────────────────────────┐
│                   civwatch_net                       │
│                                                     │
│  [Browser]                                          │
│      │  :5173                                       │
│      ▼                                              │
│  ┌─────────┐    :3000    ┌──────────┐               │
│  │Frontend │───────────▶│ Backend  │               │
│  │  React  │            │ Express  │               │
│  └─────────┘            └────┬─────┘               │
│                              │ :5000                │
│                    ┌─────────▼──────┐               │
│                    │  ML Service    │               │
│                    │   FastAPI      │               │
│                    └────────────────┘               │
│                              │                      │
│              ┌───────────────┴──────────┐           │
│              │                          │           │
│      ┌───────▼──────┐        ┌──────────▼──────┐   │
│      │  PostgreSQL  │        │     Redis        │   │
│      │  :5432       │        │     :6379        │   │
│      └──────────────┘        └─────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Data Flow

1. User logs in → Backend issues JWT
2. User adds RSS source → Backend stores in `sources`
3. User triggers ingestion → Backend fetches RSS, stores `documents`
4. Backend calls ML Service `/analyze/sentiment` per document
5. ML Service returns `{score, confidence, label}` → stored in `analyses`
6. Alert rules evaluated → `alerts` table updated, webhook fired
7. Frontend polls `/api/analytics/overview` for dashboard metrics
