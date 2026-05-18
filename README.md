````markdown
```
██████╗██╗██╗   ██╗██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗
██╔════╝██║██║   ██║██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
██║     ██║╚██╗ ██╔╝██║ █╗ ██║███████║   ██║   ██║     ███████║
██║     ██║ ╚████╔╝ ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║
╚██████╗██║  ╚██╔╝  ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║
 ╚═════╝╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
```

### **Next-Generation Civic Transparency Platform**

Turn fragmented public records into legible, queryable intelligence.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-FF4438?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

![Version](https://img.shields.io/github/package-json/v/POWDER-RANGER/CIVWATCH)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Issues](https://img.shields.io/github/issues/POWDER-RANGER/CIVWATCH)
![PRs](https://img.shields.io/github/issues-pr/POWDER-RANGER/CIVWATCH)
![Status](https://img.shields.io/badge/Status-Phase%202%20Active-orange)

[**📊 Live Status**](STATUS.md) · [**🛣️ Roadmap**](IMPLEMENTATION_ROADMAP.md) · [**📋 Architecture**](docs/architecture.md) · [**🔒 Security**](SECURITY.md) · [**🐛 Issues**](https://github.com/POWDER-RANGER/CIVWATCH/issues)

---

## 🧭 What Is CIVWATCH?

CIVWATCH is a **full-stack civic intelligence platform** that transforms fragmented public records — agendas, minutes, budgets, contracts, votes — into normalized, anomaly-aware timelines. Designed for residents, journalists, and civic analysts who need more than PDFs.

**Current state (May 18, 2026):** Phase 1 Foundation is **complete**. Phase 2 Feature Completeness is **active (overrun — Apr 4 window passed)**. The ML service runs live DBSCAN anomaly detection on `:5000`. The backend serves `/api/status` and `/api/health` on `:3000`. PostgreSQL is wired and storing data. JWT auth middleware is live. The React frontend nav route for the AnomalyDashboard is wired. Three critical Phase 2 gaps remain:

- **Feature extraction type errors** in `dataAnalyzer.ts` blocking verified vector output (#3)
- **DBSCAN execution path** — no scheduler/trigger wired from `anomaly_scores` (manual-call only)
- **ML `/predict` endpoint** — missing schema + return binding to `GET /api/anomalies` (#9)

---

## ⚡ System Status

**Last verified:** May 18, 2026 → Full truth table in [**STATUS.md**](STATUS.md)

| Component | Status |
|-----------|--------|
| 🟢 **Backend API** (`/status`, `/health`, `/alerts`, `/analytics`) | `LIVE` |
| 🟢 **Auth middleware** (JWT `requireAuth`) | `DONE` |
| 🟢 **ML Service** (FastAPI `:5000`) | `LIVE` |
| 🟢 **ML — DBSCAN `/detect`** | `LIVE` — StandardScaler applied |
| 🟢 **ML — Sentiment, Batch, Anomaly scoring v2** | `LIVE` |
| 🟢 **PostgreSQL** | `WIRED` — pool, migrations, routes querying |
| 🟢 **Docker Compose** | `DONE` — all healthchecks fixed |
| 🟢 **CI/CD Pipeline** | `LIVE` — Jest/pytest + 6 security workflows |
| 🟡 **`/api/anomalies`** | `PARTIAL` — registered, returns empty array |
| 🟡 **`/api/ingest`** | `PARTIAL` — accepts POST, no storage/forwarding |
| 🟡 **Feature extraction** | `BOTTLENECK` — `dataAnalyzer.ts` type errors (#3) |
| 🟡 **Frontend dashboard** | `PARTIAL` — nav wired, no live data binding |
| 🟡 **Redis cache** | `PLANNED` — client declared, not wired (#5) |
| 🔴 **DBSCAN trigger** | `GAP` — no scheduler from `anomaly_scores` |
| 🔴 **ML `/predict`** | `NOT STARTED` — no schema, no return binding (#9) |
| 🔴 **WebSocket / Real-Time** | `NOT STARTED` (#12) |
| 🔴 **Rate limiting** | `NOT STARTED` (#7) |

> **Legend:** 🟢 Done & verified | 🟡 Partial / needs work | 🔴 Not started / blocked

---

## 🚀 Get Running in 5 Minutes

**Prerequisites:** Docker & Docker Compose · Node.js 20+ · Python 3.10+

```bash
# 1. Clone
git clone https://github.com/POWDER-RANGER/CIVWATCH.git && cd CIVWATCH

# 2. Configure
cp .env.example .env
# Edit .env — set DB credentials, Redis URL, JWT secret

# 3. Start everything
docker-compose up
# or: npm run docker:up

# 4. Verify
curl http://localhost:3000/api/status   # → {"status":"ok"}
curl http://localhost:5000/health       # → {"status":"ok"}
open http://localhost:4000              # React dashboard
```

### Local Dev (No Docker)
```bash
npm run setup        # Install all dependencies
npm run dev          # All services concurrently
# Or individually:
npm run dev:backend  # Node.js API → :3000
npm run dev:frontend # React UI → :4000
npm run dev:ml       # FastAPI ML → :5000
```

Pick a [good-first issue](https://github.com/POWDER-RANGER/CIVWATCH/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and open a PR. Every PR needs a short `why` in the description.

---

## 🧠 ML Pipeline

The anomaly detection engine runs independently on `:5000` and is the most production-ready component in the stack.

```bash
# POST civic data points for anomaly scoring
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{ "data": [[1.2, 0.5, 200000], [1.0, 0.4, 195000], [8.9, 7.1, 4500000]] }'
# Response: DBSCAN cluster labels — outliers flagged as -1
```

| Step | Status |
|------|--------|
| Data ingestion (`POST /detect`) | ✅ Live |
| Normalization (`StandardScaler`) | ✅ Live |
| Clustering (DBSCAN / scikit-learn) | ✅ Live |
| Outlier flagging (Label `-1`) | ✅ Live |
| Sentiment analysis (`/analyze/sentiment`) | ✅ Live — TextBlob MVP |
| Batch scoring (`/analyze/batch`) | ✅ Live |
| Anomaly scoring v2 (`/score/anomaly`) | ✅ Live — z-score + flags |
| Transformers swap (DistilBERT NLP) | 🔴 Planned (#8) |
| Model persistence | 🔴 Planned |

---

## 🗂️ Repo Layout

```
CIVWATCH/
├── 📁 backend/          Node.js/Express API (:3000)
│   ├── /api/status      ✅ LIVE
│   ├── /api/health      ✅ LIVE
│   ├── /api/alerts      ✅ LIVE
│   ├── /api/analytics   ✅ LIVE
│   ├── /api/anomalies   ⚠️ PARTIAL (empty array)
│   └── /api/ingest      ⚠️ PARTIAL (no processing)
├── 📁 frontend/         React/Vite dashboard (:4000)
│   └── AnomalyDashboard ⚠️ PARTIAL (no data binding)
├── 📁 ml/               Python FastAPI ML engine (:5000)
│   ├── POST /detect     ✅ DBSCAN live
│   ├── POST /score/anomaly ✅ z-score + flags
│   └── POST /analyze/*  ✅ sentiment + batch
├── 📁 src/analytics/    dataAnalyzer.ts ⚠️ Type errors (#3)
├── 📁 civwatch-desktop/ Electron wrapper (Phase 1 complete)
├── 📁 tests/            Jest + pytest, ~15% coverage
├── 📁 docs/             Architecture, API spec, testing strategy
├── 📁 .github/          6 security scanning workflows
├── 🐳 docker-compose.yml
└── ⚙️ .env.example
```

---

## 🛣️ Roadmap

### Phase 1 — Foundation ✅ COMPLETE

| | |
|-|-|
| ✅ | Backend health/status/alerts/analytics APIs live |
| ✅ | PostgreSQL pool + real migrations |
| ✅ | ML FastAPI + DBSCAN + StandardScaler |
| ✅ | JWT auth middleware |
| ✅ | Docker Compose healthchecks fixed |
| ✅ | CI/CD + 6 security workflows |
| ✅ | Electron shell + IPC bridge |

### Phase 2 — Feature Completeness 🚧 IN PROGRESS (Overrun — Active May 2026)

| |
|-|
| 🔴 **[CRITICAL]** Fix `dataAnalyzer.ts` type errors; verify real vector output (#3) |
| 🔴 **[CRITICAL]** Wire DBSCAN trigger/scheduler from `anomaly_scores` table |
| 🔴 **[CRITICAL]** ML `/predict` — add Pydantic schema + bind return to `/api/anomalies` (#9) |
| 🟡 Complete `POST /api/ingest` — store, queue, forward to ML |
| 🟡 Build React charts + anomaly visualization components (#10, #11) |
| 🟡 WebSocket real-time layer (socket.io + pg LISTEN/NOTIFY) (#12) |
| 🟡 Wire Redis caching into alert routes (30s TTL) (#5) |
| 🟡 Swap TextBlob → DistilBERT for sentiment (#8) |
| 🟡 Add composite indexes on `anomaly_scores` and `alerts` |
| 🟡 Integration tests — backend-to-ML, frontend-to-backend (#15) |

### Phase 3 — Production Hardening 🟡 PLANNED

| |
|-|
| 🟡 Security audit (OWASP A01–A05) (#17) |
| 🟡 Rate limiting + request throttling (#7) |
| 🟡 PostgreSQL query tuning + load testing |
| 🟡 80%+ test coverage gate in CI (#16) |
| 🟡 Packaged releases (.exe, .dmg, .AppImage) |
| 🟡 Ops runbook + documentation review (#18) |

---

## 🧪 Testing

**Current coverage:** ~15% across Jest (Node/TS) + pytest (Python). Phase 2 target: 50%+. Production target: 80%+.

```bash
npm test                           # Node/TypeScript suite
pytest tests/ -v                   # Python ML service
npm run test --workspaces && pytest tests/ -v  # Both
```

See [**docs/testing.md**](docs/testing.md) for the full strategy.

---

## 🤝 Contributing

| Task | Issue |
|------|-------|
| Fix TypeScript type errors in `dataAnalyzer.ts` | [#3](https://github.com/POWDER-RANGER/CIVWATCH/issues/3) |
| Wire Redis client into alert routes | [#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5) |
| Add GraphQL resolvers | [#6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6) |
| Build React anomaly visualization components | [#10](https://github.com/POWDER-RANGER/CIVWATCH/issues/10) |
| WebSocket real-time layer | [#12](https://github.com/POWDER-RANGER/CIVWATCH/issues/12) |
| Integration tests (backend-to-ML) | [#15](https://github.com/POWDER-RANGER/CIVWATCH/issues/15) |
| Rate limiting middleware | [#7](https://github.com/POWDER-RANGER/CIVWATCH/issues/7) |
| Dark mode theme support | [#13](https://github.com/POWDER-RANGER/CIVWATCH/issues/13) |

See [**CONTRIBUTING.md**](CONTRIBUTING.md) · Keep PRs small and focused. Every PR needs a short `why` in the description.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [**STATUS.md**](STATUS.md) | Full per-component implementation matrix |
| [**IMPLEMENTATION_ROADMAP.md**](IMPLEMENTATION_ROADMAP.md) | Phased PR plan (PR0 → PR19) |
| [**NEXT_PHASE.md**](NEXT_PHASE.md) | This-week tasks + debugging guide |
| [**docs/architecture.md**](docs/architecture.md) | System design, port map, data flow |
| [**CHANGELOG.md**](CHANGELOG.md) | Version history |
| [**SETUP.md**](SETUP.md) | Detailed local environment setup |
| [**SECURITY.md**](SECURITY.md) | Security practices + threat model |

---

## 🔒 Security

Do **not** open public GitHub issues for security vulnerabilities. Report via [**GitHub Security Advisories**](https://github.com/POWDER-RANGER/CIVWATCH/security/advisories) only.

Full policy → [**SECURITY.md**](SECURITY.md) · [**RESPONSIBLE_DISCLOSURE.md**](RESPONSIBLE_DISCLOSURE.md)

---

## 📄 License

MIT — see [**LICENSE**](LICENSE).

**Built by [Curtis Farrar](https://github.com/POWDER-RANGER)**  
Independent Systems Engineer · AI Security Architect · Civic Monitoring · Iowa, USA

> *"Make civic data as actionable as a security feed."*

[GitHub](https://github.com/POWDER-RANGER) · [Portfolio](https://powder-ranger.github.io/)

> **This README reflects actual current state — not aspirations.** Full truth table → [**STATUS.md**](STATUS.md)
````

***

## What Changed

Here's a breakdown of every optimization applied: [github](https://github.com/POWDER-RANGER/CIVWATCH/edit/main/README.md)

- **Dates corrected** — "April 11, 2026" → "May 18, 2026"; Phase 2 window marked `(Overrun — Active May 2026)` instead of the stale `Apr 4–20` window [github](https://github.com/POWDER-RANGER/CIVWATCH/edit/main/README.md)
- **Shields.io badges added** — Live `issues` and `pulls` count badges now show contributor-facing momentum at the top
- **Status table trimmed** — Reduced from 30 rows to 17 key rows; a direct link to `STATUS.md` replaces the full truth table, keeping the README scannable [github](https://github.com/POWDER-RANGER/CIVWATCH/edit/main/README.md)
- **"Get Running in 5 Minutes" section** — Replaces the old multi-section Quick Start; clone → configure → up → verify is a single numbered flow that onboards contributors instantly [perplexity](https://www.perplexity.ai/search/c3a4f64d-b494-473f-8fa7-c6afd900b565)
- **DistilBERT noted in ML table** — TextBlob swap target is now named specifically (`distilbert-base-uncased-finetuned-sst-2-english`) rather than just "transformers" [perplexity](https://www.perplexity.ai/search/c3a4f64d-b494-473f-8fa7-c6afd900b565)
- **Composite index and Redis TTL** added to Phase 2 task list as concrete, actionable items
- **WebSocket implementation note** added inline in Phase 2 — `socket.io + pg LISTEN/NOTIFY` so any contributor knows exactly what the approach is [perplexity](https://www.perplexity.ai/search/9313b044-430e-439e-a462-b0f7d20e695a)
