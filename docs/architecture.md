# CIVWATCH — Architecture Reference

> **Last updated:** 2026-03-14  
> **Status:** M0 complete, M1 in progress

---

## Canonical Port Map

| Service    | Internal Port | Host-mapped Port (default) | Variable         |
|------------|:-------------:|:---------------------------:|------------------|
| Frontend   | 5173          | `$FRONTEND_PORT` (5173)    | `FRONTEND_PORT`  |
| Backend    | 3000          | `$BACKEND_PORT` (3000)     | `BACKEND_PORT`   |
| ML Service | 5000          | `$ML_SERVICE_PORT` (5000)  | `ML_SERVICE_PORT`|
| PostgreSQL | 5432          | `$POSTGRES_PORT` (5432)    | `POSTGRES_PORT`  |
| Redis      | 6379          | `$REDIS_PORT` (6379)       | `REDIS_PORT`     |

> All port overrides live in root `.env`. Never hardcode port numbers in source code — always read from `process.env`.

---

## Implemented vs Planned

| Feature                          | Status         | Milestone |
|----------------------------------|----------------|-----------|
| Docker Compose (5 services)      | ✅ Done        | M0        |
| Health/Ready endpoints           | ✅ Done        | M0        |
| `.env.example` templates         | ✅ Done        | M0        |
| CI/CD Pipeline (GitHub Actions)  | ✅ Done        | M0/M3     |
| Postgres schema (migrations)     | ✅ Done        | M1        |
| Backend API — auth               | ✅ Done        | M1        |
| Backend API — sources            | ✅ Done        | M1        |
| Backend API — analytics          | ✅ Done        | M1        |
| Backend API — alerts             | ✅ Done        | M1        |
| FastAPI ML service               | ✅ Done        | M1        |
| Sentiment analysis endpoint      | ✅ Done        | M1        |
| React dashboard (frontend)       | 🔄 In progress | M1        |
| Threshold alerting + webhooks    | 🔄 In progress | M1        |
| Monitor scheduling               | ⏳ Planned     | M2        |
| NER / topic / summarization      | ⏳ Planned     | M2        |
| Report export (JSON/CSV)         | ⏳ Planned     | M2        |
| Prometheus metrics + logging     | ⏳ Planned     | M3        |
| Production security hardening    | ⏳ Planned     | M3        |
| Kubernetes deployment            | ⏳ Planned     | M4        |

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CIVWATCH Stack                      │
│                                                         │
│  Browser                                                │
│    │                                                    │
│    ▼                                                    │
│  Frontend (Vite/React :5173)                            │
│    │  REST + WebSocket                                   │
│    ▼                                                    │
│  Backend (Express/Node :3000)                           │
│    │  pg pool          │  HTTP                          │
│    ▼                   ▼                                │
│  PostgreSQL :5432    ML Service (FastAPI :5000)         │
│                                                         │
│  Redis :6379  ←── Backend (job queues, cache)           │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpoints (Implemented)

### Auth
| Method | Path               | Auth     | Description          |
|--------|--------------------|----------|----------------------|
| POST   | `/api/auth/login`  | None     | JWT login            |
| GET    | `/api/auth/me`     | Bearer   | Current user profile |

### Sources
| Method | Path                      | Auth          | Description           |
|--------|---------------------------|---------------|-----------------------|
| GET    | `/api/sources`            | Bearer        | List user sources     |
| POST   | `/api/sources`            | Bearer+Admin  | Create RSS source     |
| POST   | `/api/sources/:id/run`    | Bearer        | Trigger ingestion     |

### Analytics
| Method | Path                      | Auth   | Description             |
|--------|---------------------------|--------|-------------------------|
| GET    | `/api/analytics/overview` | Bearer | Doc count, avg sentiment, recent alerts |

### Alerts
| Method | Path          | Auth   | Description               |
|--------|---------------|--------|---------------------------|
| POST   | `/api/alerts` | Bearer | Create threshold rule     |
| GET    | `/api/alerts` | Bearer | List rules + recent alerts|

### ML Service
| Method | Path                    | Auth | Description              |
|--------|-------------------------|------|---------------------------|
| GET    | `/health`               | None | Liveness probe            |
| GET    | `/ready`                | None | Readiness probe           |
| POST   | `/analyze/sentiment`    | None | Sentiment score + label   |

### Ops
| Method | Path          | Auth | Description        |
|--------|---------------|------|--------------------||
| GET    | `/api/health` | None | Backend liveness   |
| GET    | `/api/status` | None | Backward-compat    |

---

## Database Schema

See [`backend/src/db/migrations/001_initial_schema.sql`](../backend/src/db/migrations/001_initial_schema.sql)

**Tables:** `users` → `sources` → `ingestions` → `documents` → `analyses` → `alert_rules` → `alerts` → `monitors`

All tables use `UUID` primary keys (`gen_random_uuid()`), `TIMESTAMPTZ` timestamps, and auto-updating `updated_at` triggers.

---

## Running Locally

```bash
# 1. Clone and configure
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ml/.env.example ml/.env

# 2. Start everything
docker compose up --build

# 3. Run migrations + seed
docker compose exec backend npx ts-node src/db/migrate.ts
docker compose exec backend npx ts-node src/db/seed.ts

# 4. Login
# Email: admin@civwatch.local  |  Password: Admin1234!
```
