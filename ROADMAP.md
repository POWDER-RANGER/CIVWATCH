# CIVWATCH Development Roadmap

> **⚠️ PROTOTYPE — Features marked ✅ are implemented; 🚧 are in progress; ⬜ are on the roadmap.**

---

## Current Status: v0.1.0 BETA

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend API** | ✅ Implemented | Express.js + TypeScript, 10+ routes, auth, rate limiting |
| **Frontend Dashboard** | ✅ Implemented | React 18 + Vite, real-time Socket.io updates |
| **ML Service** | ✅ Implemented | FastAPI Python service, sentiment analysis, anomaly detection |
| **Database** | ✅ Implemented | PostgreSQL 16 with migrations, Redis caching |
| **Docker Compose** | ✅ Implemented | Full local dev stack (db, redis, ml, backend, frontend, nginx) |
| **CI/CD Pipeline** | ✅ Implemented | GitHub Actions with tests, linting, security scanning |
| **Data Ingestion** | 🚧 In Progress | RSS scraping, API polling, file upload — core pipeline working |
| **Anomaly Detection** | 🚧 In Progress | DBSCAN ensemble — basic scoring working, civic presets in dev |
| **NER / Topic Classification** | ⬜ Roadmap | spaCy NER, LDA topic modeling — scheduled v0.3.0 |
| **Report Generation** | ⬜ Roadmap | PDF/CSV/Excel export — scheduled v0.3.0 |
| **Electron Desktop App** | ⬜ Roadmap | Standalone .exe — Phase 1 design complete |

---

## Phase Milestones

### ✅ Phase 0 — CI/CD Foundation (COMPLETE)
- [x] GitHub Actions workflow with backend, ML, frontend jobs
- [x] Security scanning (CodeQL, Bandit, DevSkim, Trivy, Semgrep, OSV)
- [x] Branch protection rules
- [x] Dependabot configuration

### ✅ Phase 1 — Core API + Auth (COMPLETE)
- [x] Express backend with TypeScript
- [x] PostgreSQL database with migrations
- [x] JWT authentication with bcrypt
- [x] Rate limiting, CORS, helmet security headers
- [x] Input validation with Zod
- [x] Error handling middleware

### 🚧 Phase 2 — Ingestion + ML (IN PROGRESS)
- [x] RSS feed ingestion
- [x] Sentiment analysis endpoint
- [x] Anomaly scoring (basic)
- [x] WebSocket real-time updates
- [ ] DBSCAN ensemble with civic presets
- [ ] Named Entity Recognition (NER)
- [ ] Topic classification

### ⬜ Phase 3 — Analytics + Reporting (ROADMAP)
- [ ] Campaign finance data integration (FEC API)
- [ ] Census Bureau API integration
- [ ] Open311 civic data integration
- [ ] SEC EDGAR filing integration
- [ ] MuckRock FOIA tracking
- [ ] Report generation (PDF, CSV, Excel)
- [ ] Data lineage tracking (OpenLineage)

### ⬜ Phase 4 — Desktop + Scale (ROADMAP)
- [ ] Electron desktop shell
- [ ] PyInstaller ML binary
- [ ] SQLite portable mode
- [ ] NSIS installer
- [ ] Production observability (SLOs, Grafana)

---

## NIST 800-53 Compliance Tracker

| Control | Status | Implementation |
|---------|--------|----------------|
| **AC-3** Access Enforcement | ✅ | `POST /api/anomalies/score` requires admin/analyst role |
| **IA-2** JWT Authentication | ✅ | Explicit `algorithms: ['HS256']` — fixes CVE-2015-9235 |
| **SC-12** Key Management | ✅ | `.env` removed, `.gitignore` hardened |
| **SI-10** Input Validation | ✅ | `sanitizeLimit()`, `sanitizeOffset()`, UUID validation |
| **AU-3** Audit Logging | ⬜ | Structured audit log schema — v0.3.0 |
| **SC-8** TLS 1.3 | ⬜ | Production TLS enforcement — v0.4.0 |

See [Issue #186](https://github.com/POWDER-RANGER/CIVWATCH/issues/186) for full NIST tracking.

---

## Getting Involved

- Check [Issues](https://github.com/POWDER-RANGER/CIVWATCH/issues) for `good-first-issue` labels
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for development setup
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design

---

*Last updated: 2026-06-28*
