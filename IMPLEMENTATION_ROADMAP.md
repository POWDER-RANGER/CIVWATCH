# CIVWATCH Implementation Roadmap

**Status:** Pre-Alpha → Production Ready  
**Timeline:** 3 phases over 10-12 weeks  
**Owner:** Curtis Farrar  
**Last Updated:** February 25, 2026

---

## Executive Summary

CIVWATCH is a real-time anomaly detection platform for civic transparency. This roadmap outlines the path from "scaffolding only" to "production-ready MVP."

**Current State:** Pre-alpha with static frontend, stub ML service, no database wiring  
**Goal:** All services healthy, database integrated, real-time anomaly detection working  
**Timeline:** PR0 (damage control) → PR1 (Docker green) → PR2-3 (Phase 1) → Phase 2 (dashboard) → Phase 3 (production)

---

## Phase Summary

| Phase | Focus | Duration | PRs | Success Criteria |
|-------|-------|----------|-----|------------------|
| **PR0** | Credibility + Repo Hygiene | 30-60 min | 1-6 commits | OBELISK refs removed, v1.0.0 fixed, workflows cleaned |
| **PR1** | Docker Green + Core Endpoints | 2-3 hrs | 5 commits | All services healthy, healthchecks pass, anomaly detection works |
| **Phase 1** | Foundation Code (DB, Tests, Types) | 4-6 weeks | PR2-4 | PostgreSQL wired, real tests >70% coverage, Redis integrated |
| **Phase 2** | Dashboard + Real-Time | 6-8 weeks | PR5-8 | React components, WebSocket layer, GraphQL resolvers, live updates |
| **Phase 3** | Production Hardening | 2-3 weeks | PR9-12 | Security audit, packaged releases, CI/CD complete, docs final |

---

## Critical Path to MVP

```
PR0 (Damage Control)
├─ Delete root workflows
├─ Remove OBELISK references
├─ Fix LICENSE + SECURITY.md
├─ Delete unused files
└─ Draft v0.1.0-alpha release
        ↓
PR1 (Docker Green) ← START HERE
├─ Backend /api/health
├─ ML FastAPI + DBSCAN
├─ Frontend status indicators
├─ Fix ML Dockerfile
└─ All services healthy ✓
        ↓
Phase 1: Foundation
├─ PR2: PostgreSQL wiring
├─ PR3: Real test suite
└─ PR4: Redis cache
        ↓
      MVP Ready (all critical path items complete)
        ↓
Phase 2: Dashboard (enhancement)
├─ PR5-6: React components
├─ PR7: WebSocket real-time
└─ PR8: GraphQL layer
        ↓
Phase 3: Production
├─ PR9: Security audit
├─ PR10: Performance optimization
├─ PR11: Packaged releases
└─ PR12: Final documentation
```

---

## PR0: Damage Control (Do This First)

**Status:** 🔴 NOT STARTED (URGENT)  
**Time:** 30-60 minutes  
**Commits:** 6 small commits  
**Impact:** Restores credibility immediately

### What It Fixes

| Issue | Damage | Fix | Impact |
|-------|--------|-----|--------|
| OBELISK references in workflows | CI logs mention wrong project | Replace 'obelisk' with 'civwatch' | Professional CI output |
| v1.0.0 release claims | Non-existent downloads (assets: []) | Draft as v0.1.0-alpha | No broken promises |
| Dead workflow files | Won't trigger GitHub Actions | Delete or move to .github/workflows/ | CI actually runs |
| OBELISK README leftover | User confusion | Delete README-OBELISK.md | Cleaner repo |
| Placeholder security email | Non-existent contact | Point to GitHub Advisories | Proper reporting |
| 12MB GIF bloat | Slow clones | Delete or host externally | Faster clones |

### Execution

See **[PR0_DAMAGE_CONTROL.md](./PR0_DAMAGE_CONTROL.md)** for exact before/after patches.

**TL;DR:**
```bash
git checkout -b pr/damage-control

# Delete unused files
git rm ci-workflow.yml scorecard-workflow.yml README-OBELISK.md DEVIANT2026_small.gif
git commit -m "chore: remove unused files and fix references"

# Fix CI workflow
# Replace 'obelisk' → 'civwatch' in .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "fix: remove OBELISK references from CI"

# Update SECURITY.md
# Remove placeholder email, point to GitHub Security Advisories
git add SECURITY.md
git commit -m "fix: remove placeholder email from SECURITY.md"

git push origin pr/damage-control
# Create PR on GitHub
```

**After PR0 merges:** ✅ Repository is credible and project-specific

---

## PR1: Docker Green (Phase 1 Foundation)

**Status:** 🟡 READY TO START (after PR0)  
**Time:** 2-3 hours  
**Commits:** 5 commits  
**Impact:** All services healthy; foundation code works end-to-end

### What It Implements

| Component | Current | After PR1 | Impact |
|-----------|---------|-----------|--------|
| Backend | `/api/status` only | Add `/api/health` endpoint | Healthcheck passes |
| ML Service | Just print() | FastAPI + DBSCAN clustering | Real anomaly detection |
| ML Dockerfile | Fails silently on errors | Proper dependency installation | ML service actually works |
| Frontend | Static header | Health indicators for services | Shows system status |
| Docker Compose | Partial health | All services healthy ✓ | Full stack works together |

### Execution

See **[PR1_DOCKER_GREEN.md](./PR1_DOCKER_GREEN.md)** for exact code patches.

**TL;DR:**
```bash
git checkout -b pr/docker-green

# 1. Backend: add /api/health endpoint
vi backend/index.js
# (Add health endpoint returning status, uptime, timestamp)
git commit -m "feat: add /api/health endpoint"

# 2. ML: implement FastAPI + DBSCAN
vi ml/main.py
# (Replace with full FastAPI implementation)
vi ml/requirements.txt
# (Add fastapi, scikit-learn, etc.)
git commit -m "feat: implement ML service with DBSCAN"

# 3. ML: fix Dockerfile
vi ml/Dockerfile.dev
# (Fix pip install path + error handling)
git commit -m "fix: correct ML Dockerfile dependencies"

# 4. Frontend: show backend/ML status
vi frontend/src/main.tsx
# (Add health check indicators)
git commit -m "feat: add service health indicators"

git push origin pr/docker-green
```

**Test After:**
```bash
docker-compose down -v
docker-compose up

# All services should be healthy within 30 seconds
# http://localhost:4000 should show green checkmarks
# curl http://localhost:5000/api/analyze ... should detect anomalies
```

**After PR1 merges:** ✅ Docker Compose fully operational; MVP foundation ready

---

## Phase 1: Foundation Code (4-6 weeks)

**Status:** 🟡 PLANNED (after PR1)  
**Commits:** PR2, PR3, PR4  
**Deliverables:** DB integration, real tests, cache layer, type consistency

### PR2: Database Wiring (Week 1-2)

**Goal:** PostgreSQL connected and queryable

```typescript
// backend/src/db/connection.ts
import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
```

**Tasks:**
- [ ] Set up PostgreSQL schema (migrations)
- [ ] Wire connection pooling
- [ ] Create data access layer (src/db/queries/)
- [ ] Add environment variable validation
- [ ] Test with docker-compose

---

### PR3: Real Test Suite (Week 2-3)

**Goal:** Replace placeholder tests with 70%+ code coverage

```typescript
// tests/analytics/dataAnalyzer.test.ts
import { analyzeDataPoints } from '../../src/analytics/dataAnalyzer';

describe('DBSCAN Anomaly Detection', () => {
  it('should detect anomalies in time-series data', () => {
    const data = [
      { timestamp: 1000, value: 1.0 },
      { timestamp: 2000, value: 1.05 },
      { timestamp: 3000, value: 1.02 },
      { timestamp: 4000, value: 10.0 }, // Anomaly
    ];
    
    const result = analyzeDataPoints(data);
    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].timestamp).toBe(4000);
  });
});
```

**Tasks:**
- [ ] Replace stub tests with real assertions
- [ ] Test DBSCAN clustering
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Achieve 70%+ coverage
- [ ] Add to CI/CD pipeline

---

### PR4: Type Consistency (Week 2-3)

**Goal:** Fix timestamp type mismatches

```typescript
// src/types.ts
export interface DataPoint {
  timestamp: number;  // Unix milliseconds (always)
  value: number;
  feature_dim_2?: number;
  feature_dim_3?: number;
}
```

**Tasks:**
- [ ] Audit all type definitions
- [ ] Ensure consistent timestamp handling
- [ ] Add runtime validation (Zod or similar)
- [ ] Update ML service Pydantic models to match
- [ ] Add validation tests

---

## Phase 2: Dashboard + Real-Time (6-8 weeks)

**Status:** 🟡 PLANNED (after Phase 1)  
**Commits:** PR5-8  
**Deliverables:** Interactive dashboard, WebSocket updates, GraphQL API

### Major Components

```
frontend/
├─ components/
│  ├─ Dashboard.tsx           (Main grid layout)
│  ├─ AnomalyTimeline.tsx     (Time-series chart)
│  ├─ ClusterVisualization.tsx (Scatter plot)
│  ├─ AlertPanel.tsx          (Real-time notifications)
│  └─ DataTable.tsx           (Tabular view)
├─ hooks/
│  ├─ useAnomalyData.ts       (GraphQL query)
│  ├─ useWebSocket.ts         (Real-time updates)
│  └─ useFilters.ts           (Date/cluster filters)
└─ pages/
   └─ index.tsx              (Root layout)
```

### WebSocket Real-Time Updates

```typescript
// backend/src/websocket.ts
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    const { type, clusterId } = JSON.parse(data);
    
    if (type === 'subscribe_cluster') {
      subscribeToCluster(ws, clusterId);
    }
  });
});

async function broadcastAnomaly(anomaly: Anomaly) {
  const message = JSON.stringify({ type: 'anomaly', data: anomaly });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
```

### GraphQL Resolvers

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

## Phase 3: Production Hardening (2-3 weeks)

**Status:** 🟡 PLANNED (after Phase 2)  
**Commits:** PR9-12  
**Deliverables:** Security audit, packaged releases, final docs

### Key Tasks

- [ ] **Security Audit:** OWASP A01-A05 scan
- [ ] **Performance:** Load testing with k6 (1000 req/sec)
- [ ] **Releases:** Build exe/dmg/AppImage
- [ ] **Documentation:** API docs, deployment guide, troubleshooting
- [ ] **CI/CD:** Automated release pipeline

---

## Timeline (Gantt-style)

```
Week  1: PR0 (Damage Control)        [=]
Week  1: PR1 (Docker Green)          [====]
Week  2: PR2 (Database Wiring)       [=====]
Week  3: PR3 (Real Tests)            [====]
Week  4: PR4 (Type Consistency)      [====]
        ↓ Phase 1 Complete (MVP Green)
Week  5: PR5-6 (Dashboard)           [========]
Week  6-7: PR7-8 (WebSocket + GraphQL) [==========]
        ↓ Phase 2 Complete (Production Ready)
Week  8-9: PR9-12 (Hardening)        [======]
        ↓ Phase 3 Complete (Release Ready)
```

---

## Resource Requirements

| Resource | Need | Notes |
|----------|------|-------|
| **Dev Time** | ~300 hours | 30 hrs/week × 10 weeks |
| **Compute** | Standard (1 dev machine) | No cluster needed for dev |
| **External Services** | Optional | Codecov, GitHub Security, monitoring |
| **Hosting** | TBD | AWS/GCP/self-hosted for Phase 3 |

---

## Success Metrics

### Phase 1 (Foundation) ✓
- [ ] All Docker services healthy
- [ ] PostgreSQL storing real data
- [ ] 70%+ test coverage
- [ ] ML service processes 1000 points/sec
- [ ] No type errors in TypeScript

### Phase 2 (Dashboard) ✓
- [ ] React dashboard renders live anomalies
- [ ] WebSocket updates within 500ms
- [ ] GraphQL queries under 100ms
- [ ] Supports 100+ concurrent users
- [ ] Mobile-responsive design

### Phase 3 (Production) ✓
- [ ] Security audit passes
- [ ] <100ms API response time (p99)
- [ ] Packaged releases available (Windows, macOS, Linux)
- [ ] Full test coverage
- [ ] Zero high/critical security issues

---

## Decision Points

**Q: Should we use GraphQL or REST?**  
A: Both. REST for simple queries, GraphQL for complex/nested data.

**Q: WebSocket or Server-Sent Events (SSE)?**  
A: WebSocket for bidirectional communication (user → server filters, server → user anomalies).

**Q: Self-host or cloud?**  
A: Start self-hosted locally; cloud deployment docs in Phase 3.

**Q: When to freeze the API?**  
A: After Phase 1. Then only additive changes in Phase 2-3.

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-------------|
| Scope creep | High | Schedule slip | Strict "Phase only" feature gate |
| Type issues block progress | Medium | Week delay | Type consistency check early (PR4) |
| ML algorithm inefficient | Medium | Performance issue | Benchmark DBSCAN early (PR1) |
| Database migration fails | Low | Data loss | Comprehensive backup strategy |
| Security vulnerabilities | Medium | Deployment delay | Audit scheduled in Phase 3 |

---

## Getting Help

- **Architecture questions:** See `docs/architecture.md`
- **API design:** See `docs/api.md`
- **Testing strategy:** See `docs/testing.md`
- **Blocked?** Open an issue with `blocked` label
- **Questions?** Open an issue with `question` label

---

## References

- **Damage Control:** [PR0_DAMAGE_CONTROL.md](./PR0_DAMAGE_CONTROL.md)
- **Docker Green:** [PR1_DOCKER_GREEN.md](./PR1_DOCKER_GREEN.md)
- **Phase 1 Details:** [NEXT_PHASE.md](./NEXT_PHASE.md)
- **Status Tracker:** [STATUS.md](./STATUS.md)
- **Credibility Checklist:** [CREDIBILITY_CHECKLIST.md](./CREDIBILITY_CHECKLIST.md)

---

## Quick Start

**Right now:**
```bash
# 1. Execute PR0 (damage control)
# See PR0_DAMAGE_CONTROL.md

# 2. Execute PR1 (Docker green)
# See PR1_DOCKER_GREEN.md

# 3. Test
docker-compose up
curl http://localhost:3000/api/health

# 4. Open http://localhost:4000 → should show green checkmarks
```

**In 2-3 weeks:**
- [ ] PR0-1 complete (credibility + Docker working)
- [ ] Ready to start Phase 1 (DB, tests, types)

**In 10-12 weeks:**
- [ ] Phase 1-3 complete
- [ ] v0.1.0-beta released
- [ ] Production-ready MVP

---

## Next Steps

1. ✅ Read this document
2. 📋 Execute PR0 (30-60 min)
3. 📋 Execute PR1 (2-3 hours)
4. ✅ Verify Docker green
5. 📋 Schedule Phase 1 kickoff

---

**Questions? Open an issue or ping Curtis.**
