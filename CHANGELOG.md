# Changelog — CIVWATCH

All notable changes to **CIVWATCH** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### In Progress
- PostgreSQL connection wiring ([#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5))
- Redis cache client ([#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5))
- Real unit tests to replace stubs ([#15](https://github.com/POWDER-RANGER/CIVWATCH/issues/15))
- Fix remaining Docker Compose healthcheck mismatches ([#14](https://github.com/POWDER-RANGER/CIVWATCH/issues/14))
- Type consistency audit in `dataAnalyzer.ts` ([#3](https://github.com/POWDER-RANGER/CIVWATCH/issues/3))
- Basic React dashboard skeleton ([#10](https://github.com/POWDER-RANGER/CIVWATCH/issues/10))

---

## [0.1.0-alpha] — 2026-03-14

### Added

- **FastAPI ML service** on `:5000` with CORS enabled — replaces previous `print()`-only stub
  - `GET /health` → `{status: 'ok'}` with uptime
  - `POST /detect` → fully functional DBSCAN anomaly detection via scikit-learn
  - StandardScaler normalization applied to all input data before clustering
  - Structured error responses with HTTP status codes

- **Backend `/api/health` endpoint** on `:3000`
  - Returns uptime, version, and timestamp
  - Used by Docker Compose healthcheck

- **Docker Compose stack** — all three services (backend, frontend, ML) bring up in under 30 seconds on standard hardware; healthchecks partially aligned (remaining work in [#14](https://github.com/POWDER-RANGER/CIVWATCH/issues/14))

- **Analytics module** — `src/analytics/dataAnalyzer.ts` implements mean, median, and standard deviation calculations for time-series data points

- **React frontend scaffold** at `:4000` — static header, component structure ready for dashboard wiring

- **Repository credibility baseline**
  - `STATUS.md` — full per-component implementation matrix
  - `IMPLEMENTATION_ROADMAP.md` — phased PR plan (PR0 → Phase 3)
  - `SECURITY.md` + `RESPONSIBLE_DISCLOSURE.md` — CIVWATCH-specific, no placeholder emails
  - `CODEOWNERS` — api, worker, infra paths protected
  - `CREDIBILITY_CHECKLIST.md` — repo health audit
  - `GIT-CRYPT-SETUP.md` — encrypted secrets workflow

- **CI/CD scaffolding** — GitHub Actions workflows defined under `.github/workflows/`; currently runs echo statements only (real test execution tracked in [#2](https://github.com/POWDER-RANGER/CIVWATCH/issues/2))

### Known Gaps at This Version

- Test coverage: **0%** — 1 stub file, 1 placeholder assert ([#15](https://github.com/POWDER-RANGER/CIVWATCH/issues/15))
- PostgreSQL: env-var only, not wired ([#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5))
- Redis: env-var only, not wired ([#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5))
- Dashboard UI: React shell only, no components ([#10](https://github.com/POWDER-RANGER/CIVWATCH/issues/10))
- GraphQL resolvers: schema defined, no implementations ([#6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6))
- Authentication: none — all API routes open ([#7](https://github.com/POWDER-RANGER/CIVWATCH/issues/7))
- CI: echo only, no real test execution ([#2](https://github.com/POWDER-RANGER/CIVWATCH/issues/2))

---

## Versioning Strategy

CIVWATCH follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** — incompatible API or config format changes
- **MINOR** — new backward-compatible features or significant performance improvements
- **PATCH** — bug fixes, security patches, documentation updates

Versions below `1.0.0` are pre-release. API and config format may change between minor versions.

### Upgrading

1. Read the changelog for any entries marked ⚠️ breaking
2. Check `docs/migrations/` if crossing a major version
3. Test in a non-production environment first
4. Back up any persistent data before upgrading

### Contributing to This Changelog

- Add changes to the **[Unreleased]** section as you work
- Be specific: what changed, what file, what issue number
- Include measurable impact when possible (latency, coverage %, error rate)
- Use present tense in Unreleased; past tense in versioned sections
- Maintainers move entries to versioned sections at release cut time
