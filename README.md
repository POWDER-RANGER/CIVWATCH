<div align="center">

```
 ██████╗██╗██╗   ██╗██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗
██╔════╝██║██║   ██║██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
██║     ██║╚██╗ ██╔╝██║ █╗ ██║███████║   ██║   ██║     ███████║
██║     ██║ ╚████╔╝ ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║
╚██████╗██║  ╚██╔╝  ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║
 ╚═════╝╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
```

### **Next-Generation Civic Transparency Platform**

*Turn fragmented public records into legible, queryable intelligence.*

[![Typing SVG](https://readme-typing-svg.demo.10101010.xyz?font=FiraCode&size=20&pause=1000&color=00F7FF&center=true&vCenter=true&width=700&lines=Real-time+Anomaly+Detection;Civic+Intelligence+Pipeline;Built+for+Transparency)](https://readme-typing-svg.demo.10101010.xyz)

[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/-Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[![Version](https://img.shields.io/badge/version-0.2.1--alpha-blue)](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/LICENSE)
[![Status](https://img.shields.io/badge/status-Phase_2_In_Progress-orange)](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/STATUS.md)
[![ML Pipeline](https://img.shields.io/badge/ML_Pipeline-DBSCAN_Live-green)](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/ml)
[![Maintenance Sprint](https://img.shields.io/badge/maintenance-active-red)](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/README.md)

[**📊 Live Status**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/STATUS.md) · [**🛣️ Roadmap**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/IMPLEMENTATION_ROADMAP.md) · [**📋 Architecture**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/architecture.md) · [**🔒 Security**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/SECURITY.md) · [**🐛 Issues**](https://github.com/POWDER-RANGER/CIVWATCH/issues)

---

🧭 What Is CIVWATCH?
--------------------

CIVWATCH is a **full-stack civic intelligence platform** that transforms fragmented public records — agendas, minutes, budgets, contracts, votes — into normalized, anomaly-aware timelines. Designed for residents, journalists, and civic analysts who need more than PDFs.

**Current state (April 11, 2026):** Phase 1 Foundation is **complete**. Phase 2 Feature Completeness is **active** (window: Apr 4–20). The ML service runs live DBSCAN anomaly detection on `:5000`. The backend serves `/api/status` and `/api/health` on `:3000`. PostgreSQL is wired and storing data. JWT auth middleware is live. The React frontend nav route for the AnomalyDashboard is wired. Three critical Phase 2 gaps remain:

1. **Feature extraction type errors** in `dataAnalyzer.ts` blocking verified vector output (#3)
2. **DBSCAN execution path** — no scheduler/trigger wired from `anomaly_scores` (manual-call only)
3. **ML `/predict` endpoint** — missing schema + return 
⚡ System Status
---------------

**Last verified:** April 11, 2026 — 3:56 AM CDT

| | |
|---|---|
| Component | Status |
| 🟢 **Backend — `/api/status`** | `LIVE` — `GET :3000/api/status` → `{"status":"ok"}` |
| 🟢 **Backend — `/api/health`** | `LIVE` — `GET :3000/api/health` → uptime + version |
| 🟢 **Backend — `/api/alerts`** | `LIVE` — POST/GET with PostgreSQL queries |
| 🟢 **Backend — `/api/analytics`** | `LIVE` — routes wired, DB queries active |
| 🟢 **Backend — Auth middleware** | `DONE` — `requireAuth` JWT validation live |
| 🟢 **Backend — Error handling** | `DONE` — AppError middleware + structured responses |
| 🟢 **ML Service (FastAPI)** | `LIVE` — Server on `:5000`, CORS enabled |
| 🟢 **ML — Health / Readiness** | `LIVE` — `/health` + `/ready` probes confirmed |
| 🟢 **ML — DBSCAN `/detect`** | `LIVE` — Fully functional, StandardScaler applied |
| 🟢 **ML — Sentiment (single)** | `LIVE` — `/analyze/sentiment` with TextBlob MVP |
| 🟢 **ML — Batch scoring** | `LIVE` — `/analyze/batch` 1:1 input/output |
| 🟢 **ML — Anomaly scoring v2** | `LIVE` — `/score/anomaly` with z-score + flags |
| 🟢 **PostgreSQL** | `WIRED` — Pool initialized, tables created, routes querying |
| 🟢 **Docker Compose** | `DONE` — All services start; healthchecks fixed (bd55128) |
| 🟢 **CI/CD Pipeline** | `LIVE` — Real tests running (Jest/pytest), 6 security workflows |
| 🟡 **Anomaly route** | `PARTIAL` — `GET /api/anomalies` registered, returns empty array |
| 🟡 **Ingest route** | `PARTIAL` — `POST /api/ingest` accepts, no storage/forwarding |
| 🟡 **Feature extraction** | `BOTTLENECK` — `dataAnalyzer.ts` type errors block real vectors (#3) |
| 🟡 **Frontend nav** | `PARTIAL` — AnomalyDashboard route wired; data source empty |
| 🟡 **Dashboard layout** | `PARTIAL` — Components exist; no charts/graphs; no live data (#10) |
| 🟡 **Redis cache** | `PLANNED` — Client declared; not wired into routes (#5) |
| 🟡 **GraphQL resolvers** | `STUB` — Schema defined; no resolvers (#6) |
| 🟡 **Unit tests** | `PARTIAL` — Jest/pytest configured; coverage ~15% (#15) |
| 🟡 **NLP preprocessing** | `MVP` — TextBlob only; transformers swap planned (#8) |
| 🔴 **DBSCAN execution path** | `GAP` — No scheduler/trigger wired from `anomaly_scores` |
| 🔴 **ML `/predict` endpoint** | `NOT STARTED` — No schema; returns static JSON; no return binding (#9) |
| 🔴 **Integration tests** | `NOT STARTED` — No cross-service tests (#15) |
| 🔴 **WebSocket / Real-Time** | `NOT STARTED` — Streaming layer not built (#12) |
| 🔴 **Rate limiting** | `NOT STARTED` — No middleware (#7) |
| 🔴 **E2E tests** | `NOT STARTED` — No user flow tests (#15) |
| 🔴 **Dark mode** | `NOT STARTED` — No theme support (#13) |

> **Legend:** 🟢 Done & verified | 🟡 Partial / needs work | 🔴 Not started / blocked

🚀 Quick Startbinding to `GET /api/anomalies`
--------------

**Prerequisites:** Docker & Docker Compose · Node.js 20+ · Python 3.10+

# Clone
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Configure environment
cp .env.example .env
# Edit .env — set DB credentials, Redis URL, API keys

# Bring the full stack up
docker-compose up

# Or use the npm shortcut
npm run docker:up

### Verify It's Running

# Backend health
curl http://localhost:3000/api/status
# → {"status":"ok"}

# ML service health
curl http://localhost:5000/health
# → {"status":"ok"}

# Frontend
open http://localhost:4000

### Local Dev (No Docker)

# Install everything at once
npm run setup

# Run all services concurrently
npm run dev

# Or run individually:
npm run dev:backend   # Node.js API → :3000
npm run dev:frontend  # React UI → :4000
npm run dev:ml        # FastAPI ML → :5000

🧠 ML Pipeline
--------------

The anomaly detection engine is live and fully independent. It runs on `:5000` and is the most production-ready component in the stack.

# POST civic data points for anomaly scoring
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{
  "data": [
    [1.2, 0.5, 200000],
    [1.0, 0.4, 195000],
    [8.9, 7.1, 4500000]
  ]
}'

**Response:** DBSCAN cluster labels — outliers flagged as `-1`. StandardScaler normalization is applied before every clustering pass.

| | |
|---|---|
| Step | Status |
| Data ingestion (`POST /detect`) | ✅ Live |
| Normalization (`StandardScaler`) | ✅ Live |
| Clustering (DBSCAN / scikit-learn) | ✅ Live |
| Outlier flagging (Label `-1`) | ✅ Live |
| Sentiment analysis (`/analyze/sentiment`) | ✅ Live |
| Batch scoring (`/analyze/batch`) | ✅ Live |
| Anomaly scoring v2 (`/score/anomaly`) | ✅ Live |
| Model persistence | 🔴 Planned |
| Transformers swap (M2 NLP) | 🔴 Planned |
| GPU optimization | 🔴 Planned |

🗂️ Repo Layout
---------------

```
CIVWATCH/
├── 📁 backend/           Node.js/Express API
│   ├── /api/status       ✅ LIVE
│   ├── /api/health       ✅ LIVE
│   ├── /api/alerts       ✅ LIVE
│   ├── /api/analytics    ✅ LIVE
│   ├── /api/anomalies    ⚠️ PARTIAL (empty array)
│   └── /api/ingest       ⚠️ PARTIAL (accepts, no processing)
│
├── 📁 frontend/          React scaffold (nav route wired)
│   └── AnomalyDashboard  ⚠️ PARTIAL (no data binding)
│
├── 📁 ml/                Python FastAPI — ML engine
│   ├── POST /detect      ✅ DBSCAN live
│   ├── GET /health       ✅ LIVE
│   ├── GET /ready        ✅ LIVE
│   ├── POST /analyze/sentiment  ✅ LIVE
│   ├── POST /analyze/batch      ✅ LIVE
│   └── POST /score/anomaly      ✅ LIVE (z-score + flags)
│
├── 📁 src/analytics/     dataAnalyzer.ts (mean/median/stddev) ⚠️ Type errors (#3)
├── 📁 tests/             Jest + pytest configured, coverage ~15%
├── 📁 docs/              Architecture, API spec, testing strategy
├── 📁 demo/              Demo scenarios and scripts
├── 📁 civwatch-desktop/  Electron wrapper (Phase 1 complete)
├── 📁 .github/           GitHub Actions: 6 security workflows
├── 🐳 docker-compose.yml Multi-service orchestration (fixed)
├── ⚙️ .env.example       Environment config template
├── 📋 package.json       Monorepo root (workspaces)
└── 📋 requirements.txt   Python dependencies
```

🛣️ Roadmap
----------

### Phase 1 — Foundation ✅ **COMPLETE**

| | |
|---|---|
| ✅ | Backend `/api/health` + `/api/status` live |
| ✅ | PostgreSQL pool initialized + wired in routes |
| ✅ | ML FastAPI server live on `:5000` |
| ✅ | DBSCAN `/detect` endpoint fully functional |
| ✅ | StandardScaler normalization applied |
| ✅ | JWT auth middleware (`requireAuth`) live |
| ✅ | Docker Compose healthchecks fixed (bd55128) |
| ✅ | CI/CD pipeline — real tests running |
| ✅ | 6 security scanning workflows (bandit, CodeQL, Semgrep, etc.) |
| ✅ | Electron shell + IPC bridge (PR #102) |
| ✅ | AnomalyDashboard nav route wired (commit 15b1c41) |

### Phase 2 — Feature Completeness 🚧 **IN PROGRESS** (Apr 4–20, 2026)

| | |
|---|---|
| 🔴 **[CRITICAL] Feature extraction** — Fix `dataAnalyzer.ts` type errors; verify real vectors (#3) |
| 🔴 **[CRITICAL] DBSCAN trigger** — Wire scheduler/trigger from `anomaly_scores` table |
| 🔴 **[CRITICAL] ML `/predict`** — Add feature vector schema + return binding to `/anomalies` (#9) |
| 🟡 Complete ingest pipeline — `POST /api/ingest` must store/queue/forward |
| 🟡 Build React UI components (charts, tables, anomaly visualizations) (#10, #11) |
| 🟡 Implement WebSocket real-time layer (#12) |
| 🟡 Wire Redis caching into alert routes (#5) |
| 🟡 Add GraphQL resolvers (#6) |
| 🟡 Write integration tests (backend-to-ML, frontend-to-backend) (#15) |
| 🟡 Swap TextBlob for transformers (M2 NLP upgrade) (#8) |
| 🟡 Model serialization + persistence (#9) |
| 🟡 Performance profiling |

### Phase 3 — Production Hardening 🟡 **PLANNED** (Apr 21–May 2, 2026)

| | |
|---|---|
| 🟡 Security audit + penetration testing (OWASP A01–A05) (#17) |
| 🟡 Rate limiting + request throttling (#7) |
| 🟡 Performance optimization — query tuning, load testing |
| 🟡 80%+ code coverage gate in CI (#16) |
| 🟡 Packaged releases (.exe, .dmg, .AppImage) |
| 🟡 Documentation review + ops runbook (#18) |

🧪 Testing
----------

**Current coverage:** ~15% across Jest (Node/TS) + pytest (Python). Target for Phase 2: 50%+. MVP target: 80%+.

# Node/TypeScript test suite
npm test

# Python ML service tests
pytest tests/ -v

# Run both
npm run test --workspaces && pytest tests/ -v

See [**docs/testing.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/testing.md) for the full testing strategy.

🤝 Contributing
---------------

**Good first issues — each is fully tracked:**

| Task | Issue |
|---|---|
| Fix TypeScript type errors in `dataAnalyzer.ts` | [#3](https://github.com/POWDER-RANGER/CIVWATCH/issues/3) |
| Wire Redis client into alert routes | [#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5) |
| Add GraphQL resolvers (Query/Mutation/Subscription) | [#6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6) |
| Build React anomaly visualization components (charts) | [#10](https://github.com/POWDER-RANGER/CIVWATCH/issues/10) |
| Implement WebSocket real-time layer | [#12](https://github.com/POWDER-RANGER/CIVWATCH/issues/12) |
| Write integration tests (backend-to-ML) | [#15](https://github.com/POWDER-RANGER/CIVWATCH/issues/15) |
| Rate limiting middleware | [#7](https://github.com/POWDER-RANGER/CIVWATCH/issues/7) |
| Dark mode theme support | [#13](https://github.com/POWDER-RANGER/CIVWATCH/issues/13) |

See [**CONTRIBUTING.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CONTRIBUTING.md) for full guidelines. Keep PRs small and focused. Every PR needs a short `why` in the description.

📚 Documentation Index
----------------------

| File | Purpose |
|---|---|
| [**STATUS.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/STATUS.md) | Live per-component implementation matrix (updated Apr 11) |
| [**IMPLEMENTATION_ROADMAP.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/IMPLEMENTATION_ROADMAP.md) | Phased PR plan (PR0 → PR19) |
| [**NEXT_PHASE.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/NEXT_PHASE.md) | This-week tasks + debugging guide |
| [**docs/architecture.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/architecture.md) | System design, port map, data flow |
| [**CHANGELOG.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CHANGELOG.md) | Version history (Keep a Changelog) |
| [**SETUP.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/SETUP.md) | Detailed local environment setup |
| [**SECURITY.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/SECURITY.md) | Security practices + threat model |
| [**RESPONSIBLE_DISCLOSURE.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/RESPONSIBLE_DISCLOSURE.md) | Vulnerability reporting procedures |
| [**CREDIBILITY_CHECKLIST.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CREDIBILITY_CHECKLIST.md) | Repo health + credibility audit |
| [**GIT-CRYPT-SETUP.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/GIT-CRYPT-SETUP.md) | Encrypted secrets via git-crypt |

🔒 Security
-----------

Do **not** open public GitHub issues for security vulnerabilities. Report via [**GitHub Security Advisories**](https://github.com/POWDER-RANGER/CIVWATCH/security/advisories) only.

Full policy → [**SECURITY.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/SECURITY.md) · [**RESPONSIBLE_DISCLOSURE.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/RESPONSIBLE_DISCLOSURE.md)

📄 License
----------

MIT — see [**LICENSE**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/LICENSE).

**Built by [Curtis Farrar](https://github.com/POWDER-RANGER)**
Independent Systems Engineer · AI Security Architect · Civic Monitoring
Keokuk, Iowa, USA

> *"Make civic data as actionable as a security feed."*

[GitHub](https://github.com/POWDER-RANGER) · [Portfolio](https://powder-ranger.github.io/)

> **This README reflects actual current state — not aspirations.** Full truth table → [**STATUS.md**](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/STATUS.md)
