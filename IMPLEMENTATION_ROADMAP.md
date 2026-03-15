# CIVWATCH Implementation Roadmap

**Status:** Pre-Alpha — Foundation partially complete  
**Timeline:** 3 phases over ~10 weeks remaining  
**Owner:** Curtis Farrar  
**Last Updated:** March 14, 2026

---

## Where We Are Right Now

| Milestone | Status | Notes |
|-----------|--------|-------|
| PR0 — Damage Control | ✅ Done | OBELISK refs removed, SECURITY.md fixed, credibility restored |
| PR1 — Docker Green | ✅ Done | FastAPI ML live, `/api/health` live, healthchecks mostly aligned |
| Phase 1 — DB + Tests | 🔴 In Progress | PostgreSQL/Redis not wired; tests are stubs |
| Phase 2 — Dashboard | 🟡 Planned | Blocked on Phase 1 |
| Phase 3 — Hardening | 🟡 Planned | Blocked on Phase 2 |

---

## Critical Path to MVP

```
✅ PR0 — Damage Control (DONE)
✅ PR1 — Docker Green (DONE)
        ↓
🔴 Phase 1: Foundation  ← CURRENT
├─ PR2: Wire PostgreSQL
├─ PR3: Real test suite (replace stubs)
└─ PR4: Type consistency + Redis
        ↓
   MVP Ready
        ↓
🟡 Phase 2: Dashboard
├─ PR5-6: React components
├─ PR7: WebSocket real-time
└─ PR8: GraphQL resolvers
        ↓
🟡 Phase 3: Production
├─ PR9: Security audit
├─ PR10: Performance
├─ PR11: Packaged releases
└─ PR12: Final docs + CI/CD complete
```

---

## Phase Summary

| Phase | Focus | Est. Duration | PRs | Success Criteria |
|-------|-------|---------------|-----|------------------|
| **Phase 1** | DB, Tests, Types | 4–6 weeks | PR2–4 | PostgreSQL wired, Redis wired, >70% test coverage, no type errors |
| **Phase 2** | Dashboard + Real-Time | 6–8 weeks | PR5–8 | React components live, WebSocket <500ms, GraphQL resolvers done |
| **Phase 3** | Production Hardening | 2–3 weeks | PR9–12 | Security audit pass, packaged releases, CI/CD complete, 80%+ coverage |

---

## Phase 1: Foundation — IN PROGRESS

### PR2: PostgreSQL Wiring (Week 1–2)
**Goal:** Real data persistence — no more env-var-only stubs  
**Issue:** [#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5)

**Tasks:**
- [ ] `src/db/connection.ts` — pool management, connection validation
- [ ] `src/db/queries/` — parameterized query layer
- [ ] Schema migrations (first: `anomalies`, `data_points` tables)
- [ ] Environment variable validation at startup
- [ ] Wire backend routes to use DB layer
- [ ] Integration test: insert → query → assert

```typescript
// src/db/connection.ts
import pg from 'pg';
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try { return await client.query(text, params); }
  finally { client.release(); }
}
```

---

### PR3: Real Test Suite (Week 2–3)
**Goal:** Replace every stub with a real assertion — target 70%+ coverage  
**Issue:** [#15](https://github.com/POWDER-RANGER/CIVWATCH/issues/15)

**Current state:**
```typescript
// ❌ NOW
expect(true).toBe(true); // TODO
```
**Target:**
```typescript
// ✅ GOAL
import { analyzeDataPoints } from '../../src/analytics/dataAnalyzer';
describe('DBSCAN Anomaly Detection', () => {
  it('detects anomalies in time-series data', () => {
    const data = [
      { timestamp: 1000, value: 1.0 },
      { timestamp: 2000, value: 1.02 },
      { timestamp: 3000, value: 10.0 }, // anomaly
    ];
    const result = analyzeDataPoints(data);
    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].timestamp).toBe(3000);
  });
});
```

**Files to write:**
- `tests/analytics/dataAnalyzer.test.ts` — real DBSCAN tests
- `tests/analytics/fixtures/` — test data generators
- `tests/api/` — backend endpoint tests
- Wire Jest into GitHub Actions CI

---

### PR4: Type Consistency + Redis (Week 2–3)
**Goal:** Eliminate type mismatches; wire Redis cache layer  
**Issues:** [#3](https://github.com/POWDER-RANGER/CIVWATCH/issues/3), [#5](https://github.com/POWDER-RANGER/CIVWATCH/issues/5)

**Known issue:**
```typescript
// ❌ types.ts declares:
timestamp: number; // Unix milliseconds
// But dataAnalyzer.ts uses it as:
const date = new Date(point.timestamp); // Expects Date object
```

**Tasks:**
- [ ] Audit and harden `src/types.ts`
- [ ] Update ML service Pydantic models to match
- [ ] Add Zod runtime validation on all endpoints
- [ ] Wire Redis client for anomaly caching
- [ ] Add Redis healthcheck to Docker Compose

---

## Phase 2: Dashboard + Real-Time — PLANNED

**Blocked on:** Phase 1 complete

### PR5–6: React Dashboard Components
**Issues:** [#10](https://github.com/POWDER-RANGER/CIVWATCH/issues/10), [#11](https://github.com/POWDER-RANGER/CIVWATCH/issues/11)

```
frontend/src/components/
├── Dashboard.tsx           ← Main grid layout
├── AnomalyTimeline.tsx     ← recharts time-series
├── ClusterVisualization.tsx← scatter plot
├── AlertPanel.tsx          ← real-time notification feed
└── DataTable.tsx           ← tabular anomaly view
```

### PR7: WebSocket Real-Time Layer
**Issue:** [#12](https://github.com/POWDER-RANGER/CIVWATCH/issues/12)  
**Target:** Anomaly broadcast to frontend within 500ms of detection

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
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}
```

### PR8: GraphQL Resolvers
**Issue:** [#6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6)

```graphql
type Query {
  anomalies(after: String, first: Int): AnomalyConnection!
  clusters(limit: Int): [Cluster!]!
  dataPoints(clusterId: ID!, limit: Int): [DataPoint!]!
}
type Subscription {
  anomalyDetected: Anomaly!
  clusterUpdated(clusterId: ID!): Cluster!
}
```

---

## Phase 3: Production Hardening — PLANNED

**Blocked on:** Phase 2 complete

| Task | Issue | Notes |
|------|-------|-------|
| OWASP A01–A05 security audit | [#17](https://github.com/POWDER-RANGER/CIVWATCH/issues/17) | Before any public exposure |
| Rate limiting + API key auth | [#7](https://github.com/POWDER-RANGER/CIVWATCH/issues/7) | All routes currently open |
| Performance: load test with k6 | — | Target 1000 req/sec |
| CI/CD with real test execution | [#2](https://github.com/POWDER-RANGER/CIVWATCH/issues/2) | Replace echo statements |
| Code coverage tooling | [#16](https://github.com/POWDER-RANGER/CIVWATCH/issues/16) | Target 80%+ |
| Packaged releases | — | Windows .exe, macOS .dmg, Linux .AppImage |
| Deployment guide | [#18](https://github.com/POWDER-RANGER/CIVWATCH/issues/18) | Production ops runbook |

---

## Timeline

```
March 2026  → Phase 1: PostgreSQL, Redis, real tests, type fixes
April 2026  → Phase 2: React dashboard, WebSocket, GraphQL
May 2026    → Phase 3: Security audit, CI/CD, packaged releases
```

---

## Success Metrics

### Phase 1 ✓
- [ ] All Docker services pass healthchecks
- [ ] PostgreSQL storing real anomaly data
- [ ] Redis caching hot query results
- [ ] 70%+ test coverage
- [ ] Zero TypeScript type errors

### Phase 2 ✓
- [ ] Dashboard renders live anomalies from DB
- [ ] WebSocket updates within 500ms
- [ ] GraphQL queries under 100ms p99
- [ ] Supports 100+ concurrent users

### Phase 3 ✓
- [ ] Security audit passes (no High/Critical findings open)
- [ ] API p99 response time < 100ms
- [ ] Packaged binaries build and run on all three platforms
- [ ] 80%+ code coverage
- [ ] CI runs full test suite on every PR

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | High | Schedule slip | Strict phase gates — no Phase 2 work until Phase 1 issues closed |
| Type issues block progress | Medium | 1-week delay | PR4 addresses this before Phase 2 starts |
| ML clustering too slow for real data | Medium | Performance issue | Benchmark `POST /detect` in PR3 |
| DB migration failure | Low | Data loss | Backup strategy before any migration |
| Security vulnerabilities discovered | Medium | Deployment delay | Phase 3 audit scheduled before any public release |

---

## References

- [STATUS.md](./STATUS.md) — live per-component truth table
- [NEXT_PHASE.md](./NEXT_PHASE.md) — concrete this-week tasks
- [PR0_DAMAGE_CONTROL.md](./PR0_DAMAGE_CONTROL.md) — ✅ completed
- [PR1_DOCKER_GREEN.md](./PR1_DOCKER_GREEN.md) — ✅ completed
- [CREDIBILITY_CHECKLIST.md](./CREDIBILITY_CHECKLIST.md) — repo health

---

**Questions?** Open an issue or ping Curtis.
