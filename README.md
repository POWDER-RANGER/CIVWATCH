
<p align="center">

```
 ██████╗██╗██╗   ██╗██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗
██╔════╝██║██║   ██║██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
██║     ██║╚██╗ ██╔╝██║ █╗ ██║███████║   ██║   ██║     ███████║
██║     ██║ ╚████╔╝ ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║
╚██████╗██║  ╚██╔╝  ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║
 ╚═════╝╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
```

</p>

<p align="center">
  <strong>◈ CIVIC INTELLIGENCE. ANOMALY DETECTION. REAL-TIME TRUTH. ◈</strong><br/>
  <sub>Transform fragmented public records into normalized, anomaly-aware, queryable intelligence.</sub>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white"/></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/POWDER-RANGER/CIVWATCH?style=flat-square&color=00ff9f"/>
  <img src="https://img.shields.io/badge/License-MIT-00ff9f?style=flat-square"/>
  <img src="https://img.shields.io/github/issues/POWDER-RANGER/CIVWATCH?style=flat-square&color=ff4757"/>
  <img src="https://img.shields.io/github/issues-pr/POWDER-RANGER/CIVWATCH?style=flat-square&color=ffa502"/>
  <img src="https://img.shields.io/github/last-commit/POWDER-RANGER/CIVWATCH?style=flat-square&color=00d2ff"/>
  <img src="https://img.shields.io/badge/Phase-2%20Active-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/ML_Engine-LIVE-00ff9f?style=flat-square"/>
</p>

<p align="center">
  <a href="STATUS.md">📡 Live Status</a> ·
  <a href="IMPLEMENTATION_ROADMAP.md">🛣️ Roadmap</a> ·
  <a href="docs/architecture.md">📐 Architecture</a> ·
  <a href="SECURITY.md">🔒 Security</a> ·
  <a href="https://github.com/POWDER-RANGER/CIVWATCH/issues">🐛 Issues</a>
</p>

---

## ◈ What Is CIVWATCH?

CIVWATCH is a **full-stack civic intelligence platform** purpose-built to surface patterns in public records that institutions don't want surfaced. It ingests agendas, minutes, contracts, budgets, and vote records — then normalizes, scores, and visualizes anomalies in real time.

Built for residents, journalists, investigators, and civic analysts who need **machine-grade clarity** on government data — not PDFs.

> *"Make civic data as actionable as a security feed."*

---

## ◈ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        CIVWATCH STACK                           │
├──────────────────┬──────────────────┬───────────────────────────┤
│  React/Vite      │  Node/Express     │  Python FastAPI           │
│  Dashboard :4000 │  API Server :3000 │  ML Engine :5000          │
│  AnomalyUI       │  /alerts          │  DBSCAN /detect           │
│  Charts (WIP)    │  /analytics       │  z-score /score/anomaly   │
│  Auth Views      │  /anomalies       │  TextBlob → DistilBERT    │
│                  │  /ingest          │  /analyze/sentiment       │
├──────────────────┴──────────┬────────┴───────────────────────────┤
│         PostgreSQL          │  Redis (cache layer — in progress) │
│         Data Store          │  30s TTL on alert routes           │
├─────────────────────────────┴────────────────────────────────────┤
│  Docker Compose · CI/CD · 6 Security Workflows · Electron Shell  │
└──────────────────────────────────────────────────────────────────┘
```

**Port map:** Frontend `:4000` → Backend API `:3000` → ML Engine `:5000` → PostgreSQL `:5432` → Redis `:6379`

Full design → [**docs/architecture.md**](docs/architecture.md)

---

## ◈ System Status

> **Last verified:** May 18, 2026 · Full per-component matrix → [**STATUS.md**](STATUS.md)

| Component | State | Notes |
|-----------|-------|-------|
| 🟢 Backend API | `LIVE` | `/status` `/health` `/alerts` `/analytics` |
| 🟢 JWT Auth Middleware | `LIVE` | `requireAuth` on all protected routes |
| 🟢 ML Engine (FastAPI :5000) | `LIVE` | Health check passing |
| 🟢 DBSCAN `/detect` | `LIVE` | StandardScaler applied, outliers → `-1` |
| 🟢 Anomaly Scoring v2 | `LIVE` | z-score + threshold flags |
| 🟢 Sentiment `/analyze/sentiment` | `LIVE` | TextBlob MVP |
| 🟢 Batch Scoring `/analyze/batch` | `LIVE` | |
| 🟢 PostgreSQL | `LIVE` | Pool, migrations, routes querying |
| 🟢 Docker Compose | `LIVE` | All healthchecks resolved |
| 🟢 CI/CD Pipeline | `LIVE` | Jest + pytest + 6 security workflows |
| 🟢 Electron Shell | `LIVE` | IPC bridge complete |
| 🟡 `/api/anomalies` | `PARTIAL` | Returns empty array — ML bind pending |
| 🟡 `/api/ingest` | `PARTIAL` | Accepts POST — no storage/forwarding yet |
| 🟡 `dataAnalyzer.ts` | `BOTTLENECK` | Type errors blocking vector output ([#3](https://github.com/POWDER-RANGER/CIVWATCH/issues/3)) |
| 🟡 Frontend AnomalyDashboard | `PARTIAL` | Nav wired — no live data binding |
| 🟡 Redis Cache | `WIRED` | Client declared — routes not hooked ([#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5)) |
| 🔴 DBSCAN Scheduler | `GAP` | No trigger from `anomaly_scores` table |
| 🔴 ML `/predict` Endpoint | `NOT STARTED` | Pydantic schema + `/api/anomalies` bind ([#9](https://github.com/POWDER-RANGER/CIVWATCH/issues/9)) |
| 🔴 WebSocket / Real-Time | `NOT STARTED` | socket.io + pg LISTEN/NOTIFY ([#12](https://github.com/POWDER-RANGER/CIVWATCH/issues/12)) |
| 🔴 Rate Limiting | `NOT STARTED` | ([#7](https://github.com/POWDER-RANGER/CIVWATCH/issues/7)) |

> 🟢 Verified · 🟡 Partial / In Progress · 🔴 Not Started / Blocked

---

## ◈ Get Running in 5 Minutes

**Requirements:** Docker + Docker Compose · Node.js 20+ · Python 3.10+

```bash
# 1. Clone
git clone https://github.com/POWDER-RANGER/CIVWATCH.git && cd CIVWATCH

# 2. Configure environment
cp .env.example .env
# → Set: DB credentials · Redis URL · JWT secret

# 3. Spin everything up
docker-compose up
# or: npm run docker:up

# 4. Verify
curl http://localhost:3000/api/status   # {"status":"ok"}
curl http://localhost:5000/health       # {"status":"ok"}
open http://localhost:4000              # React dashboard
```

### Local Dev (No Docker)

```bash
npm run setup        # Install all deps across workspaces
npm run dev          # All services concurrently

# Or individually:
npm run dev:backend  # Node.js API        → :3000
npm run dev:frontend # React/Vite UI      → :4000
npm run dev:ml       # FastAPI ML engine  → :5000
```

See [**SETUP.md**](SETUP.md) for full environment configuration, secrets management, and database initialization.

---

## ◈ ML Pipeline

The anomaly detection engine runs independently on `:5000` and is the most production-ready component in the stack. It processes raw civic data vectors and returns cluster labels — outliers flagged as `-1`.

```bash
# Submit civic data points for DBSCAN anomaly scoring
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{"data": [[1.2, 0.5, 200000], [1.0, 0.4, 195000], [8.9, 7.1, 4500000]]}'
# → {"labels": [0, 0, -1]}  ← last point flagged as anomaly

# z-score + threshold anomaly scoring
curl -X POST http://localhost:5000/score/anomaly \
  -H "Content-Type: application/json" \
  -d '{"values": [200000, 195000, 4500000]}'

# Sentiment analysis on civic text
curl -X POST http://localhost:5000/analyze/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "The council approved the $4.5M no-bid contract unanimously."}'
```

| Step | Status | Detail |
|------|--------|--------|
| Data ingestion (`POST /detect`) | ✅ | Live |
| Normalization | ✅ | `StandardScaler` applied |
| Clustering | ✅ | DBSCAN via scikit-learn |
| Outlier flagging | ✅ | Label `-1` = anomaly |
| z-score scoring | ✅ | `POST /score/anomaly` |
| Batch scoring | ✅ | `POST /analyze/batch` |
| Sentiment analysis | ✅ | TextBlob MVP live |
| `/predict` endpoint | 🔴 | Pydantic schema needed ([#9](https://github.com/POWDER-RANGER/CIVWATCH/issues/9)) |
| DistilBERT NLP swap | 🔴 | Replaces TextBlob ([#8](https://github.com/POWDER-RANGER/CIVWATCH/issues/8)) |
| Model persistence | 🔴 | Planned |

---

## ◈ Repo Layout

```
CIVWATCH/
├── 📁 backend/            Node.js/Express API (:3000)
│   ├── /api/status        ✅ LIVE
│   ├── /api/health        ✅ LIVE
│   ├── /api/alerts        ✅ LIVE
│   ├── /api/analytics     ✅ LIVE
│   ├── /api/anomalies     ⚠️  PARTIAL — empty array, ML bind needed
│   └── /api/ingest        ⚠️  PARTIAL — no storage/forwarding
├── 📁 frontend/           React/Vite dashboard (:4000)
│   └── AnomalyDashboard   ⚠️  PARTIAL — nav wired, no data binding
├── 📁 ml/                 Python FastAPI ML engine (:5000)
│   ├── POST /detect        ✅ DBSCAN live
│   ├── POST /score/anomaly ✅ z-score + flags
│   └── POST /analyze/*     ✅ sentiment + batch
├── 📁 src/analytics/      dataAnalyzer.ts ⚠️  type errors (#3)
├── 📁 civwatch-desktop/   Electron wrapper — Phase 1 complete
├── 📁 tests/              Jest + pytest (~15% coverage)
├── 📁 docs/               Architecture · API spec · Testing strategy
├── 📁 .github/            6 security scanning workflows
├── 🐳  docker-compose.yml
└── ⚙️  .env.example
```

---

## ◈ Roadmap

### Phase 1 — Foundation `✅ COMPLETE`

| | |
|-|-|
| ✅ | Backend health / status / alerts / analytics APIs |
| ✅ | PostgreSQL pool + real migrations |
| ✅ | ML FastAPI + DBSCAN + StandardScaler |
| ✅ | JWT auth middleware |
| ✅ | Docker Compose — all healthchecks resolved |
| ✅ | CI/CD + 6 security scanning workflows |
| ✅ | Electron shell + IPC bridge |

### Phase 2 — Feature Completeness `🚧 ACTIVE`

| Priority | Task | Issue |
|----------|------|-------|
| 🔴 CRITICAL | Fix `dataAnalyzer.ts` type errors — verify real vector output | [#3](https://github.com/POWDER-RANGER/CIVWATCH/issues/3) |
| 🔴 CRITICAL | Wire DBSCAN scheduler/trigger from `anomaly_scores` table | — |
| 🔴 CRITICAL | ML `/predict` — Pydantic schema + bind return to `/api/anomalies` | [#9](https://github.com/POWDER-RANGER/CIVWATCH/issues/9) |
| 🟡 HIGH | Complete `POST /api/ingest` — store, queue, forward to ML | — |
| 🟡 HIGH | React anomaly charts + visualization components | [#10](https://github.com/POWDER-RANGER/CIVWATCH/issues/10) [#11](https://github.com/POWDER-RANGER/CIVWATCH/issues/11) |
| 🟡 HIGH | WebSocket real-time layer (socket.io + pg LISTEN/NOTIFY) | [#12](https://github.com/POWDER-RANGER/CIVWATCH/issues/12) |
| 🟡 MED | Wire Redis into alert routes (30s TTL) | [#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5) |
| 🟡 MED | Swap TextBlob → DistilBERT NLP | [#8](https://github.com/POWDER-RANGER/CIVWATCH/issues/8) |
| 🟡 MED | Composite indexes on `anomaly_scores` + `alerts` tables | — |
| 🟡 MED | Integration tests — backend-to-ML + frontend-to-backend | [#15](https://github.com/POWDER-RANGER/CIVWATCH/issues/15) |

### Phase 3 — Production Hardening `🟡 PLANNED`

| | |
|-|-|
| 🟡 | OWASP A01–A05 security audit ([#17](https://github.com/POWDER-RANGER/CIVWATCH/issues/17)) |
| 🟡 | Rate limiting + request throttling ([#7](https://github.com/POWDER-RANGER/CIVWATCH/issues/7)) |
| 🟡 | PostgreSQL query tuning + load testing |
| 🟡 | 80%+ test coverage gate in CI ([#16](https://github.com/POWDER-RANGER/CIVWATCH/issues/16)) |
| 🟡 | Packaged releases (.exe · .dmg · .AppImage) |
| 🟡 | Ops runbook + documentation review ([#18](https://github.com/POWDER-RANGER/CIVWATCH/issues/18)) |

---

## ◈ Testing

**Current coverage:** ~15% · Phase 2 target: 50%+ · Production gate: 80%+

```bash
npm test                                           # TypeScript/Node suite
pytest tests/ -v                                   # Python ML service
npm run test --workspaces && pytest tests/ -v      # Full suite
```

See [**docs/testing.md**](docs/testing.md) for strategy, coverage targets, and CI integration details.

---

## ◈ Contributing

| Task | Issue |
|------|-------|
| Fix TypeScript type errors in `dataAnalyzer.ts` | [#3](https://github.com/POWDER-RANGER/CIVWATCH/issues/3) |
| Wire Redis into alert routes | [#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5) |
| Rate limiting middleware | [#7](https://github.com/POWDER-RANGER/CIVWATCH/issues/7) |
| Swap TextBlob → DistilBERT | [#8](https://github.com/POWDER-RANGER/CIVWATCH/issues/8) |
| ML `/predict` endpoint | [#9](https://github.com/POWDER-RANGER/CIVWATCH/issues/9) |
| React anomaly visualization components | [#10](https://github.com/POWDER-RANGER/CIVWATCH/issues/10) |
| WebSocket real-time layer | [#12](https://github.com/POWDER-RANGER/CIVWATCH/issues/12) |
| Dark mode theme support | [#13](https://github.com/POWDER-RANGER/CIVWATCH/issues/13) |
| Integration tests (backend ↔ ML) | [#15](https://github.com/POWDER-RANGER/CIVWATCH/issues/15) |

See [**CONTRIBUTING.md**](CONTRIBUTING.md) · Keep PRs small and focused. Every PR needs a short `why` in the description. Pick a [good first issue](https://github.com/POWDER-RANGER/CIVWATCH/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to get started.

---

## ◈ Documentation

| File | Purpose |
|------|---------|
| [STATUS.md](STATUS.md) | Full per-component implementation matrix |
| [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) | Phased PR plan (PR0 → PR19) |
| [NEXT_PHASE.md](NEXT_PHASE.md) | This-week tasks + debugging guide |
| [docs/architecture.md](docs/architecture.md) | System design, port map, data flow |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [SETUP.md](SETUP.md) | Detailed local environment setup |
| [SECURITY.md](SECURITY.md) | Security practices + threat model |

---

## ◈ Security

Do **not** open public GitHub issues for security vulnerabilities. Report exclusively via [**GitHub Security Advisories**](https://github.com/POWDER-RANGER/CIVWATCH/security/advisories).

Full policy → [**SECURITY.md**](SECURITY.md) · [**RESPONSIBLE_DISCLOSURE.md**](RESPONSIBLE_DISCLOSURE.md)

---

## ◈ License

MIT — see [**LICENSE**](LICENSE).

---

<p align="center">
  <strong>Built by <a href="https://github.com/POWDER-RANGER">Curtis Farrar</a></strong><br/>
  <sub>Independent Systems Engineer · AI Security Architect · Civic Monitoring · Iowa, USA</sub><br/><br/>
  <a href="https://github.com/POWDER-RANGER">GitHub</a> ·
  <a href="https://powder-ranger.github.io/">Portfolio</a>
</p>

<p align="center">
  <sub><em>This README reflects verified current state — not aspirations. Full truth table → <a href="STATUS.md">STATUS.md</a></em></sub>
</p>
