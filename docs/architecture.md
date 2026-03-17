# CIVWATCH — Architecture Reference

> **Status:** Phase 0 complete ✔️ | Phase 1 (Electron shell) in progress 🟡

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

## Planned vs Implemented

| Feature | Planned | Implemented |
|--------|---------|-------------|
| Docker Compose stack (5 svcs) | ✅ | ✅ Phase 0 |
| `.env.example` templates | ✅ | ✅ Phase 0 |
| CI/CD pipeline | ✅ | ✅ Phase 0 |
| All CVEs patched | ✅ | ✅ Phase 0 |
| Ingestion pipeline (schema + sanitize + aggregate) | ✅ | ✅ Phase 1 |
| Electron shell + IPC bridge | ✅ | ✅ Phase 1 (PR #102) |
| JWT auth (login / me) | ✅ | ⏳ Phase 1 (#58) |
| RSS source CRUD | ✅ | ⏳ Phase 1 (#58) |
| MVP API endpoints | ✅ | ⏳ Phase 1 (#58) |
| FastAPI ML service — sentiment | ✅ | ✅ scaffold live |
| `.env` aligned across all services | ✅ | ⏳ Phase 1 (#55 → this PR) |
| package.json scripts aligned | ✅ | ✅ Phase 1 (this PR) |
| Postgres schema (migrations) | ✅ | ⏳ Phase 1 |
| React dashboard | ✅ | ⏳ Phase 1 |
| Security hardening (bcrypt, rate limits) | ✅ | ⏳ Phase 1 (#68) |
| Real CI/CD (non-placeholder tests) | ✅ | ⏳ Phase 1 (#66) |
| Monitor scheduling | ✅ | ⏳ Phase 2 |
| API polling source type | ✅ | ⏳ Phase 2 |
| NER / topic classification | ✅ | ⏳ Phase 2 |
| Report export (JSON/CSV) | ✅ | ⏳ Phase 2 |
| PyInstaller ML binary | ✅ | ⏳ Phase 2 |
| SQLite migration | ✅ | ⏳ Phase 3 |
| Settings UI | ✅ | ⏳ Phase 3 |
| NSIS installer + code signing | ✅ | ⏳ Phase 4 |
| Auto-updater | ✅ | ⏳ Phase 4 |
| Prometheus metrics | ✅ | ⏳ Phase 3 |
| Sentry error tracking | ✅ | ⏳ Phase 3 |

---

## Service Diagram — Docker / Web Mode

```
┌─────────────────────────────────────────────────────┐
│                   civwatch_net                       │
│                                                     │
│  [Browser]                                          │
│      │  :5173                                       │
│      ▼                                              │
│  ┌─────────┐    :3000    ┌──────────┐               │
│  │Frontend │►───────────►│ Backend  │               │
│  │  React  │            │ Express  │               │
│  └─────────┘            └────┬─────┘               │
│                              │ :5000                │
│                    ┌─────────▼─────┐               │
│                    │  ML Service    │               │
│                    │   FastAPI      │               │
│                    └────────────────┘               │
│                              │                      │
│              ┌───────────────┴──────────┐           │
│              │                          │           │
│      ┌───────▼─────┐        ┌──────────▼─────┐   │
│      │  PostgreSQL  │        │     Redis        │   │
│      │  :5432       │        │     :6379        │   │
│      └──────────────┘        └─────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Service Diagram — Electron / Standalone .exe Mode

```
civwatch.exe (Electron main)
  ├── Renderer (Chromium + React)  ───────────► contextBridge IPC
  │                                         │
  │       ipcMain handlers                  ▼
  ├── Node backend subprocess   :3000  (127.0.0.1 only)
  ├── Python ML subprocess      :5000  (127.0.0.1 only)
  └── SQLite db                  %APPDATA%\CIVWATCH\civwatch.db

  No external ports. No Docker. No Python/Node install required.
```

---

## Data Flow

1. User submits report → `POST /reports` → `sanitize()` → `aggregate()` (pipeline/routes.ts)
2. User logs in → Backend issues JWT
3. User adds RSS source → Backend stores in `sources`
4. Backend fetches RSS, stores `documents`
5. Backend calls ML Service `POST /analyze/sentiment` per document
6. ML returns `{score, confidence, label}` → stored in `analyses`
7. Confidence score fed back into `aggregate.ts` bucket
8. Alert rules evaluated → `alerts` table updated, webhook fired
9. Frontend polls `GET /heatmap`, `/trends`, `/summary` for dashboard metrics

---

## Phase Roadmap

| Phase | Status | Tag |
|-------|--------|-----|
| 0 — CI/CD stabilization | ✅ Complete | `v0.1.0-phase0-complete` |
| 1 — Electron shell + ingestion pipeline | 🟡 In Progress | `v0.2.0-phase1-complete` |
| 2 — PyInstaller Python binary | ⏳ Planned | `v0.3.0-phase2-complete` |
| 3 — SQLite migration + settings | ⏳ Planned | `v0.4.0-phase3-complete` |
| 4 — NSIS installer + signing + auto-update | ⏳ Planned | `v1.0.0` |
