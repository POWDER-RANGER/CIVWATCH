# CIVWATCH — Implementation Roadmap

<div align="center">

**Version:** `0.2.0-alpha` · **Phase:** Alpha — Early Feature Development  
**Owner:** Curtis Farrar ([@POWDER-RANGER](https://github.com/POWDER-RANGER))  
**Last Updated:** March 22, 2026

</div>

---

## 📍 Where We Are Right Now

```
✅ PR0  — Damage Control         (DONE — OBELISK refs, SECURITY.md, credibility)
✅ PR1  — Docker Green           (DONE — FastAPI live, healthchecks aligned)
✅ PR2  — PostgreSQL Wiring      (DONE — pool live, routes wired, migrations applied)
✅ PR3  — Real Test Suite        (DONE — Jest/pytest configured, ML unit tests added)
✅ PR4  — Type Consistency       (DONE — TS fixes, rss-parser, scoreBatch alignment)
✅ PR5  — Auth + MVP API Routes  (DONE — JWT/bcrypt, all routes confirmed live)
✅ PR6  — Ingestion Pipeline     (DONE — batch ML scoring, rss-parser, adapter dispatch)
✅ PR7  — Anomaly Scoring v2     (DONE — /score/anomaly z-score, volume flags, v0.3.0)
✅ PR8  — Electron Shell         (DONE — IPC bridge, subprocess mgmt, NSIS maker)
✅ PR9  — Docker Production      (DONE — all 3 Dockerfiles rewritten, ports aligned)
        ↓
🚧 PHASE 2: Feature Completeness  ← CURRENT
├─ PR10: React UI — charts, anomaly table, maps
├─ PR11: WebSocket real-time layer
├─ PR12: Redis caching layer
├─ PR13: GraphQL resolvers
└─ PR14: Integration tests + coverage push
        ↓
🟡 PHASE 3: Production Hardening
├─ PR15: Security audit (OWASP A01–A05)
├─ PR16: Rate limiting + request throttling
├─ PR17: Performance optimization + load testing
├─ PR18: 80%+ test coverage
└─ PR19: Packaged releases + CI/CD complete
```

---

## Phase Summary

| Phase | Focus | Window | Status | Exit Criteria |
|-------|-------|--------|--------|---------------|
| **Phase 1** | Foundation | Feb–Mar 2026 | ✅ **Complete** | DB wired, auth live, CI real, Docker green |
| **Phase 2** | Feature Completeness | Apr 4–20, 2026 | 🚧 **In Progress** | Dashboard live, WebSocket <500ms, GraphQL resolvers done |
| **Phase 3** | Production Hardening | Apr 21–May 2, 2026 | 🟡 **Planned** | Security audit pass, 80%+ coverage, packaged releases |

---

## ✅ Phase 1 — Foundation (COMPLETE)

All Phase 1 work is merged to `main`. No open blockers.

| Task | PR | Status |
|------|----|--------|
| Remove OBELISK refs, fix SECURITY.md | PR0 | ✅ Done |
| FastAPI ML live, Docker healthchecks aligned | PR1 | ✅ Done |
| PostgreSQL pool + migrations (`anomalies`, `data_points`, `documents_url_unique`) | PR2 | ✅ Done |
| Jest/pytest configured, ML unit tests (`test_sentiment.py`) | PR3 | ✅ Done |
| TS type fixes, `rss-parser` dep, `scoreBatch` index alignment | PR4 | ✅ Done |
| `POST /api/auth/login` (bcrypt + JWT), `requireAuth` middleware | PR5 | ✅ Done |
| Batch ML scoring (`/analyze/batch`), RSS adapter, bulk DB inserts | PR6 | ✅ Done |
| `POST /score/anomaly` — z-score, volume flags, ML bumped to v0.3.0 | PR7 | ✅ Done |
| Electron Forge shell — IPC bridge, subprocess mgmt, NSIS maker | PR8 | ✅ Done |
| Production Dockerfiles (Node 20, Vite, Python 3.11 slim), ports aligned | PR9 | ✅ Done |

**Phase 1 exit criteria — all met:**
- [x] All Docker services pass healthchecks
- [x] PostgreSQL storing real data
- [x] CI/CD runs real tests (not echo)
- [x] Auth middleware live — bcrypt + JWT
- [x] All MVP API routes confirmed live
- [x] Zero critical TypeScript type errors

---

## 🚧 Phase 2 — Feature Completeness (IN PROGRESS)

**Target window:** Apr 4–20, 2026 · **Blockers:** None

### PR10 — React Dashboard UI
**Issues:** [#10](../../issues/10), [#11](../../issues/11)  
**Goal:** Functional, data-connected dashboard with real anomaly visualizations

```
frontend/src/components/
├── Dashboard.tsx               ← Main grid layout (scaffold exists)
├── AnomalyTimeline.tsx         ← recharts/d3 time-series
├── ClusterVisualization.tsx    ← scatter plot (DBSCAN output)
├── AlertPanel.tsx              ← real-time notification feed
├── DataTable.tsx               ← tabular anomaly view + filters
└── MapView.tsx                 ← civic event geographic overlay
```

- [ ] Wire `CivicTransparencyDashboard` to live API endpoints
- [ ] Add recharts/d3 anomaly timeline chart
- [ ] Build DBSCAN cluster scatter visualization
- [ ] Integrate alert panel with `/api/alerts/recent`
- [ ] Add dark mode theme support ([#13](../../issues/13))

---

### PR11 — WebSocket Real-Time Layer
**Issue:** [#12](../../issues/12)  
**Target:** Anomaly broadcast to frontend within **500ms** of detection

```typescript
// backend/src/websocket.ts
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const { type, clusterId } = JSON.parse(data.toString());
    if (type === 'subscribe_cluster') subscribeToCluster(ws, clusterId);
  });
});

async function broadcastAnomaly(anomaly: Anomaly) {
  const msg = JSON.stringify({ type: 'anomaly', data: anomaly });
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}
```

- [ ] WebSocket server wired into Express app
- [ ] Subscription model per cluster ID
- [ ] Frontend `useAnomalyData` hook updated for WS stream
- [ ] Reconnect logic with exponential backoff

---

### PR12 — Redis Caching Layer
**Issue:** [#5](../../issues/5)  
**Goal:** Wire declared Redis client into routes — hot query caching

- [ ] Wire Redis client into alert routes
- [ ] Cache `/api/analytics/overview` with 60s TTL
- [ ] Cache hot anomaly queries
- [ ] Redis healthcheck wired into Docker Compose
- [ ] Cache invalidation on new ingestion run

---

### PR13 — GraphQL Resolvers
**Issue:** [#6](../../issues/6)  
**Goal:** Full query + subscription surface for dashboard consumption

```graphql
type Query {
  anomalies(after: String, first: Int): AnomalyConnection!
  clusters(limit: Int): [Cluster!]!
  dataPoints(clusterId: ID!, limit: Int): [DataPoint!]!
  sources: [Source!]!
}

type Mutation {
  createAlert(input: AlertInput!): Alert!
  triggerIngestion(sourceId: ID!): IngestionResult!
}

type Subscription {
  anomalyDetected: Anomaly!
  clusterUpdated(clusterId: ID!): Cluster!
}
```

- [ ] Implement all `Query` resolvers
- [ ] Implement `Mutation` resolvers
- [ ] Wire `Subscription` to WebSocket broadcast
- [ ] Add DataLoader for N+1 query prevention

---

### PR14 — Integration Tests + Coverage Push
**Issue:** [#15](../../issues/15), [#16](../../issues/16)  
**Goal:** Cross-service test coverage, push from ~15% toward 50%+

- [ ] Backend → ML service integration test (`POST /analyze/batch`)
- [ ] Frontend → Backend API integration tests
- [ ] DB transaction tests (insert → query → assert)
- [ ] ML anomaly scoring regression tests
- [ ] Wire Codecov gates into CI (fail PR if coverage drops)

---

**Phase 2 exit criteria:**
- [ ] Dashboard renders live anomalies from DB
- [ ] WebSocket updates arrive within 500ms
- [ ] GraphQL queries return under 100ms p99
- [ ] Redis caching live on hot routes
- [ ] Test coverage at 50%+
- [ ] Supports 100+ concurrent users

---

## 🟡 Phase 3 — Production Hardening (PLANNED)

**Target window:** Apr 21 – May 2, 2026 · **Blocked on:** Phase 2 complete

| Task | Issue | Notes |
|------|-------|-------|
| OWASP A01–A05 security audit | [#17](../../issues/17) | Before any public exposure |
| Rate limiting + API key auth | [#7](../../issues/7) | All routes currently open |
| Performance: load test with k6 | — | Target 1,000 req/sec |
| CI/CD coverage gate | [#2](../../issues/2) | Fail PR if coverage < 80% |
| Penetration testing | [#17](../../issues/17) | No High/Critical open before launch |
| Packaged releases | — | Windows `.exe`, macOS `.dmg`, Linux `.AppImage` |
| Electron auto-update flow | — | `updater.ts` live — needs signing + CI pipeline |
| Model persistence | [#9](../../issues/9) | ML service doesn't serialize models yet |
| TextBlob → Transformers (M2 ML) | [#8](../../issues/8) | NLP upgrade, interface unchanged |
| E2E tests (Cypress/Playwright) | [#15](../../issues/15) | No user flow tests yet |
| Documentation review | [#18](../../issues/18) | Ops runbook, deployment guide final pass |

**Phase 3 exit criteria:**
- [ ] Security audit — no High/Critical findings open
- [ ] API p99 response time < 100ms
- [ ] 80%+ code coverage enforced in CI
- [ ] Packaged binaries build and run on all 3 platforms
- [ ] Electron auto-update signing pipeline complete
- [ ] Rate limiting + throttling on all public routes

---

## 🗓️ Timeline

```
Mar 2026  ✅ Phase 1 complete — DB, auth, CI, Docker, ingestion, anomaly v2, Electron shell
Apr 1–3   🔧 Phase 2 prep — issue triage, PR branch setup
Apr 4–20  🚧 Phase 2 — Dashboard UI, WebSocket, Redis, GraphQL, integration tests
Apr 21    🟡 Phase 3 start — security audit, rate limiting, performance
May 2     🎯 MVP target — packaged release, public demo instance
```

---

## 📊 Project Metrics

| Metric | Current | Phase 2 Target | MVP Target |
|--------|---------|----------------|------------|
| Backend LOC | ~400 | 1,200+ | 2,000+ |
| ML Service LOC | ~234 | 600+ | 1,000+ |
| Frontend LOC | ~250 | 1,500+ | 3,000+ |
| Test files | 5+ | 15+ | 20+ |
| Test cases | ~20 | 60+ | 100+ |
| Code coverage | ~15% | 50%+ | 80%+ |
| Security workflows | 6 | 6 | 8 |
| API endpoints documented | 10+ | 18+ | 20+ |

---

## ⚠️ Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WebSocket performance under load | Medium | Latency > 500ms | Benchmark with k6 in PR11 |
| GraphQL N+1 queries | High | Dashboard slowness | DataLoader required in PR13 |
| Redis cache invalidation bugs | Medium | Stale anomaly data | Cache TTL + ingest-triggered invalidation |
| Electron code signing complexity | Medium | Release delay | Address early in Phase 3 |
| ML model drift on real civic data | Medium | False positives | Regression test suite in PR14 |
| Test coverage gate blocks PRs | Low | Dev friction | Gate at 50% Phase 2, 80% Phase 3 only |

---

## 📚 References

| File | Purpose |
|------|---------|
| [STATUS.md](./STATUS.md) | Live per-component truth table — updated Mar 22, 2026 |
| [NEXT_PHASE.md](./NEXT_PHASE.md) | Concrete this-week tasks + debugging guide |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](./SECURITY.md) | Security practices + disclosure policy |

---

<div align="center">

**Built by [Curtis Farrar](https://github.com/POWDER-RANGER)**  
Independent Systems Engineer · AI Security Architect · Civic Monitoring  
*"Make civic data as actionable as a security feed."*

</div>
