<div align="center">

```
 ██████╗██╗██╗   ██╗██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗
██╔════╝██║██║   ██║██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
██║     ██║██║   ██║██║ █╗ ██║███████║   ██║   ██║     ███████║
██║     ██║╚██╗ ██╔╝██║███╗██║██╔══██║   ██║   ██║     ██╔══██║
╚██████╗██║ ╚████╔╝ ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║
 ╚═════╝╚═╝  ╚═══╝   ╚══╝╚══╝ ╚═╝  ╚═╝  ╚═╝    ╚═════╝╚═╝  ╚═╝
```

### **Next-Generation Civic Transparency Platform**
*Turn fragmented public records into legible, queryable intelligence.*

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1000&color=00F7FF&center=true&vCenter=true&width=700&lines=Real-Time+Anomaly+Detection+%7C+DBSCAN+ML+Pipeline;Civic+Data+Ingestion+%7C+Agendas+%2B+Votes+%2B+Contracts;Built+for+Residents%2C+Journalists%2C+and+Analysts)](https://github.com/POWDER-RANGER/CIVWATCH)

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

[![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue?style=flat-square)](./CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=flat-square)](./STATUS.md)
[![ML Pipeline](https://img.shields.io/badge/ML%20Pipeline-DBSCAN%20Live-brightgreen?style=flat-square)](./ml/)
[![Maintenance Sprint](https://img.shields.io/badge/Repo-Maintenance%20Sprint-red?style=flat-square)](#)

<br/>

[**📊 Live Status**](./STATUS.md) · [**🛣️ Roadmap**](./IMPLEMENTATION_ROADMAP.md) · [**📋 Architecture**](./docs/architecture.md) · [**🔒 Security**](./SECURITY.md) · [**🐛 Issues**](https://github.com/POWDER-RANGER/CIVWATCH/issues)

</div>

---

## 🧭 What Is CIVWATCH?

CIVWATCH is a **full-stack civic intelligence platform** that transforms fragmented public records — agendas, minutes, budgets, contracts, votes — into normalized, anomaly-aware timelines. Designed for residents, journalists, and civic analysts who need more than PDFs.

The core pipeline is operational today: a live FastAPI ML service runs DBSCAN anomaly detection with StandardScaler normalization. The broader stack (React dashboard, PostgreSQL, authentication, real-time WebSockets) is actively being built.

> **This README reflects actual current state — not aspirations.**

---

## ⚡ System Status

<div align="center">

| Component | Status | Details |
|-----------|:------:|---------|
| 🟢 **Backend — `/api/status`** | `LIVE` | `GET :3000/api/status` → `{"status":"ok"}` |
| 🟢 **Backend — `/api/health`** | `LIVE` | `GET :3000/api/health` → uptime + version |
| 🟢 **ML Service (FastAPI)** | `LIVE` | FastAPI server on `:5000`, CORS enabled |
| 🟢 **ML — DBSCAN `/detect`** | `LIVE` | Fully functional anomaly scoring |
| 🟢 **ML — Data Normalization** | `DONE` | StandardScaler on every clustering pass |
| 🟡 **Analytics Module** | `PARTIAL` | mean/median/stddev in `src/analytics/` |
| 🟡 **Backend — Anomaly Route** | `STUB` | `GET /api/anomalies` → empty array |
| 🟡 **Backend — Ingest Route** | `STUB` | `POST /api/ingest` → 202, no processing |
| 🟡 **Frontend Bootstrap** | `SCAFFOLD` | Static header + React shell @ `:4000` |
| 🟡 **Docker Compose** | `PARTIAL` | Services start; healthchecks misaligned |
| 🟡 **CI/CD Pipeline** | `STUB` | GitHub Actions defined — echo only |
| 🟡 **Unit Tests** | `STUB` | 1 file · 1 placeholder · 0% real coverage |
| 🔴 **Dashboard UI** | `NOT STARTED` | React shell only |
| 🔴 **PostgreSQL** | `NOT WIRED` | Env-var placeholder in compose |
| 🔴 **Redis** | `NOT WIRED` | Env-var placeholder in compose |
| 🔴 **GraphQL Resolvers** | `NOT STARTED` | Schema defined; no resolvers |
| 🔴 **Authentication** | `NOT STARTED` | All routes fully open |
| 🔴 **Rate Limiting** | `NOT STARTED` | No middleware |
| 🔴 **NLP Preprocessing** | `NOT STARTED` | Text pipeline not implemented |
| 🔴 **WebSocket / Real-Time** | `NOT STARTED` | Streaming layer not built |

</div>

> Full implementation truth table → [**STATUS.md**](./STATUS.md)

---

## 🚀 Quick Start

**Prerequisites:** Docker & Docker Compose · Node.js 20+ · Python 3.10+

```bash
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
```

### Verify It's Running

```bash
# Backend health
curl http://localhost:3000/api/status
# → {"status":"ok"}

# ML service health
curl http://localhost:5000/health
# → {"status":"ok"}

# Frontend
open http://localhost:4000
```

### Local Dev (No Docker)

```bash
# Install everything at once
npm run setup

# Run all services concurrently
npm run dev

# Or run individually:
npm run dev:backend    # Node.js API  → :3000
npm run dev:frontend   # React UI     → :4000
npm run dev:ml         # FastAPI ML   → :5000
```

---

## 🧠 ML Pipeline

The anomaly detection engine is live and fully independent. It runs on `:5000` and is the most production-ready component in the stack.

```bash
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
```

**Response:** DBSCAN cluster labels — outliers flagged as `-1`. StandardScaler normalization is applied before every clustering pass, ensuring data variance doesn't skew detection thresholds.

| Step | Method | Status |
|------|--------|--------|
| Data ingestion | REST `POST /detect` | ✅ Live |
| Normalization | `StandardScaler` | ✅ Live |
| Clustering | DBSCAN (scikit-learn) | ✅ Live |
| Outlier flagging | Label `-1` | ✅ Live |
| TensorFlow.js predictions | Future | 🔴 Planned |

---

## 🗂️ Repo Layout

```
CIVWATCH/
├── 📁 backend/               Node.js/Express API
│   ├── /api/status           ✅ Live
│   ├── /api/health           ✅ Live
│   ├── /api/anomalies        ⚠️  Stub
│   └── /api/ingest           ⚠️  Stub
│
├── 📁 frontend/              React scaffold (static shell)
│
├── 📁 ml/                    Python FastAPI — ML engine
│   ├── POST /detect          ✅ DBSCAN live
│   └── GET  /health          ✅ Live
│
├── 📁 src/
│   └── analytics/            dataAnalyzer.ts (mean/median/stddev)
│
├── 📁 tests/                 1 stub test — real tests needed (#15)
├── 📁 docs/                  Architecture, API spec, testing strategy
├── 📁 demo/                  Demo scenarios and scripts
├── 📁 civwatch-desktop/      Electron desktop wrapper (planned)
├── 📁 .github/               GitHub Actions workflows
│
├── 🐳 docker-compose.yml     Multi-service orchestration
├── 🐳 docker-compose-civwatch.yml
├── ⚙️  .env.example           Environment config template
├── 📋 package.json           Monorepo root (workspaces: frontend/backend/ml)
└── 📋 requirements.txt       Python dependencies
```

---

## 🛣️ Roadmap

### Phase 1 — Foundation *(in progress)*
- [x] Backend `/api/health` + `/api/status` live
- [x] ML FastAPI server live on `:5000`
- [x] DBSCAN `/detect` endpoint fully functional
- [x] StandardScaler normalization applied
- [ ] Fix Docker Compose healthcheck mismatches ([#14](../../issues/14), [#2](../../issues/2))
- [ ] Wire PostgreSQL connection ([#5](../../issues/5))
- [ ] Wire Redis client ([#5](../../issues/5))
- [ ] Replace test stubs with real assertions — 5+ minimum ([#15](../../issues/15))
- [ ] Fix type mismatches in `dataAnalyzer.ts` ([#3](../../issues/3))
- [ ] React dashboard skeleton ([#10](../../issues/10))

### Phase 2 — ML Core & API *(planned)*
- [ ] GraphQL schema + resolvers ([#6](../../issues/6))
- [ ] NLP preprocessing pipeline ([#8](../../issues/8))
- [ ] React dashboard: charts + anomaly table ([#10](../../issues/10), [#11](../../issues/11))
- [ ] WebSocket real-time updates ([#12](../../issues/12))
- [ ] Authentication middleware ([#7](../../issues/7))
- [ ] Rate limiting ([#7](../../issues/7))
- [ ] Data ingestion pipeline (agendas, minutes, votes)
- [ ] Integration test suite ([#15](../../issues/15))

### Phase 3 — Production Hardening *(future)*
- [ ] Security audit + penetration testing ([#17](../../issues/17))
- [ ] CI/CD pipeline with real test execution ([#2](../../issues/2))
- [ ] 80%+ code coverage ([#16](../../issues/16))
- [ ] Performance optimization — caching strategy, query tuning
- [ ] Packaged releases (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`)
- [ ] Public read-only demo instance

---

## 🧪 Testing

> **Current state: 1 stub test · 0% real coverage.**  
> Real test coverage is a top Phase 1 priority — tracked in [**#15**](../../issues/15).

```bash
# Node/TypeScript test suite
npm test

# Python ML service tests
pytest tests/ -v

# Run both
npm run test --workspaces && pytest tests/ -v
```

See [**docs/testing.md**](./docs/testing.md) for the full testing strategy and coverage targets.

---

## 🤝 Contributing

**Good first issues — each is fully tracked:**

| Task | Issue |
|------|-------|
| Write real unit tests for analytics + ML | [#15](../../issues/15) |
| Wire PostgreSQL connection wrapper | [#5](../../issues/5) |
| Fix Docker Compose healthcheck alignment | [#14](../../issues/14) |
| Build React components — status card, anomaly table | [#10](../../issues/10) |
| Fix TypeScript type mismatches in `dataAnalyzer.ts` | [#3](../../issues/3) |

See [**CONTRIBUTING.md**](./CONTRIBUTING.md) for full guidelines. Keep PRs small and focused. Every PR needs a short *why* in the description.

---

## 📚 Documentation Index

| File | Purpose |
|------|---------|
| [STATUS.md](./STATUS.md) | Live per-component implementation matrix |
| [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | Phased roadmap with PR plan + issue links |
| [NEXT_PHASE.md](./NEXT_PHASE.md) | This-week tasks + active debugging guide |
| [SETUP.md](./SETUP.md) | Detailed local environment setup |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [GIT-CRYPT-SETUP.md](./GIT-CRYPT-SETUP.md) | Encrypted secrets via git-crypt |
| [SECURITY.md](./SECURITY.md) | Security practices + threat model |
| [RESPONSIBLE_DISCLOSURE.md](./RESPONSIBLE_DISCLOSURE.md) | Vulnerability reporting procedures |
| [CREDIBILITY_CHECKLIST.md](./CREDIBILITY_CHECKLIST.md) | Repo health + credibility checklist |

---

## 🔒 Security

Do **not** open public GitHub issues for security vulnerabilities.  
Report via [**GitHub Security Advisories**](https://github.com/POWDER-RANGER/CIVWATCH/security/advisories) only.

Full policy → [**SECURITY.md**](./SECURITY.md) · [**RESPONSIBLE_DISCLOSURE.md**](./RESPONSIBLE_DISCLOSURE.md)

---

## 📄 License

MIT — see [**LICENSE**](./LICENSE).

---

<div align="center">

**Built by [Curtis Farrar](https://github.com/POWDER-RANGER)**  
Independent Systems Engineer · AI Security Architect · Civic Monitoring  
Keokuk, Iowa, USA

*"Make civic data as actionable as a security feed."*

[![GitHub](https://img.shields.io/badge/GitHub-POWDER--RANGER-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/POWDER-RANGER)
[![Portfolio](https://img.shields.io/badge/Portfolio-powder--ranger.github.io-00F7FF?style=for-the-badge&logo=githubpages&logoColor=black)](https://powder-ranger.github.io)

</div>

