# Next Phase: CIVWATCH Path Forward

**Last Updated:** February 25, 2026  
**Status:** Pre-Alpha credibility restored → Ready for Phase 1 implementation

---

## What You Just Fixed ✅

- ✅ **README** is now honest and credible
- ✅ **LICENSE** is no longer a ghost file
- ✅ **Docker Compose** healthchecks now pass
- ✅ **ML service** has real DBSCAN clustering
- ✅ **SECURITY.md** is CIVWATCH-specific
- ✅ **STATUS.md** tracks implementation progress

**Result:** Repository now passes basic credibility audit. Time to build.

---

## Phase 1: MVP Core (4-6 weeks)

### Priority 1: Database & Cache Layer

**Goal:** Wire PostgreSQL + Redis for real data persistence  
**Current State:** Models exist but no actual DB connection  
**Work:**
```bash
# Backend service → PostgreSQL
src/db/connection.ts       # Pool management, migrations
src/db/queries/           # Parameterized queries
backend/Dockerfile        # Add psql client

# ML service → Redis
ml/main.py               # Redis client for anomaly cache
docker-compose.yml       # Add redis service + healthcheck

# Test locally
docker-compose up
curl http://localhost:3000/api/status
# Expected: full system status including DB + Redis health
```

**Estimated:** 1 week  
**Priority:** CRITICAL (blocks everything else)

---

### Priority 2: Real Test Suite

**Goal:** Replace placeholder test stubs with actual assertions  
**Current State:**
```typescript
// ❌ CURRENT
expect(true).toBe(true);  // TODO: import actual dataAnalyzer
```

**Work:**
```typescript
// ✅ GOAL
import { analyzeDataPoints } from '../src/analytics/dataAnalyzer';

describe('DBSCAN clustering', () => {
  it('should detect anomalies in time-series data', () => {
    const data = generateTestData({ clusters: 3, anomalies: 2 });
    const result = analyzeDataPoints(data);
    
    expect(result.anomalies.length).toBe(2);
    expect(result.clusterCount).toBe(3);
  });
});
```

**Files:**
- `tests/analytics/dataAnalyzer.test.ts` → Real DBSCAN tests
- `tests/analytics/fixtures/` → Test data generators
- Add Jest to CI/CD pipeline

**Estimated:** 3-4 days  
**Priority:** HIGH (unblocks confidence in code)

---

### Priority 3: Type Consistency

**Goal:** Fix type mismatches between frontend/ML  
**Current Issue:**
```typescript
// ❌ types.ts says:
export interface DataPoint {
  timestamp: number;  // Unix milliseconds
}

// But dataAnalyzer.ts treats it like:
const date = new Date(point.timestamp);  // Assumes Date object
```

**Work:**
- Audit `src/types.ts` → ensure all types are strict
- Update `ml/main.py` Pydantic models to match
- Add runtime validation on all endpoints

**Estimated:** 2-3 days  
**Priority:** HIGH (prevents runtime bugs)

---

## Phase 2: Dashboard & Real-Time (6-8 weeks)

### Frontend Components

```
frontend/
├── components/
│   ├── Dashboard.tsx          → Main grid layout
│   ├── AnomalyTimeline.tsx    → Interactive chart (recharts)
│   ├── ClusterMap.tsx         → Geospatial display
│   └── AlertPanel.tsx         → Real-time notifications
├── hooks/
│   ├── useAnomalyData.ts      → GraphQL subscription hook
│   └── useWebSocket.ts        → WebSocket connection
└── pages/
    └── index.tsx              → Root layout
```

### WebSocket Layer

```python
# backend/websocket.py
async def broadcast_anomaly(anomaly: Anomaly):
    for connection in active_connections:
        await connection.send_json(anomaly.dict())

# Subscribe frontend
const ws = new WebSocket('ws://localhost:3000/ws/anomalies');
ws.onmessage = (event) => {
  setAnomalies(prev => [event.data, ...prev]);
};
```

---

## Phase 3: Security & Production (8-12 weeks)

### Security Hardening
- [ ] OWASP A01:2021 (injection) audit
- [ ] Add rate limiting + API key auth
- [ ] Enable CORS properly
- [ ] Setup HTTPS + certificate rotation

### Performance
- [ ] Profile ML clustering latency
- [ ] Add caching for repeated queries
- [ ] Optimize database indices
- [ ] Load test with k6

### Releases
- [ ] Build exe/dmg/AppImage
- [ ] Automated release process
- [ ] Changelog automation

---

## This Week's Concrete Tasks

**Pick ONE and start:**

1. **Database Integration**
   ```bash
   git checkout -b feat/postgres-connection
   # Implement src/db/connection.ts
   # Wire backend/index.js to use it
   # Test with docker-compose
   ```
   
2. **Fix Test Suite**
   ```bash
   git checkout -b test/real-analytics-tests
   # Replace placeholder tests with real DBSCAN tests
   # Run: npm run test
   ```

3. **Type Audit**
   ```bash
   git checkout -b fix/type-consistency
   # Review src/types.ts
   # Update ml/main.py Pydantic models
   # Add validation tests
   ```

---

## Running CIVWATCH Right Now

```bash
# Clone & install
git clone https://github.com/POWDER-RANGER/CIVWATCH
cd CIVWATCH
npm install

# Start services
docker-compose up
# Waits for healthchecks... (~10 seconds)

# Test endpoints in separate terminal
curl http://localhost:3000/api/status
curl http://localhost:8000/health  # ML service
curl http://localhost:4000         # Frontend

# Logs
docker-compose logs -f backend
docker-compose logs -f ml
```

---

## Questions & Debugging

**Docker healthchecks failing?**
- Check `docker ps` → see health status
- Check logs: `docker-compose logs backend`
- Ensure port 3000 isn't already in use

**ML service errors?**
- Requires Python 3.9+
- Check `pip list` includes `fastapi`, `scikit-learn`
- See `ml/requirements.txt`

**Frontend not rendering?**
- Check Node version: `node -v` (need 18+)
- Check webpack: `npm run dev`
- Open http://localhost:4000

**Type errors in TypeScript?**
- Run `npx tsc --noEmit`
- Fix in `src/types.ts` or in the service using it

---

## Status Dashboard

| Component | Status | Next |
|-----------|--------|------|
| Backend | ✅ Boots, `/api/status` works | Wire DB |
| ML Service | ✅ DBSCAN implemented | Add real data stream |
| Frontend | ⚠️ Static header only | Build components |
| Tests | ⚠️ Stubs only | Real assertions |
| Docker | ✅ Healthchecks pass | Add Redis service |
| Docs | ✅ Credible & accurate | Keep updated |
| CI/CD | ⚠️ Echo statements | Real testing |
| Security | ⚠️ No auth yet | Rate limiting + keys |

---

## Success Metrics (MVP)

- [ ] All 3 services pass healthchecks
- [ ] Backend connected to real PostgreSQL
- [ ] Test suite has >70% code coverage
- [ ] Dashboard renders live anomaly data
- [ ] WebSocket broadcasts updates to frontend
- [ ] ML service processes >1000 data points/sec
- [ ] Security audit passes (OWASP A01-A05)

---

## Resources

- **Architecture:** `docs/architecture.md`
- **API Spec:** `docs/api.md`
- **Testing Strategy:** `docs/testing.md`
- **Implementation Matrix:** `STATUS.md`
- **Contributing Guide:** `CONTRIBUTING.md`

---

## Next Sync Point

Plan to report on **Phase 1 progress** in ~2 weeks:
- [ ] DB wired
- [ ] Real tests passing
- [ ] Types consistent
- [ ] Docker fully healthy

Then tackle **Phase 2** (dashboard + real-time).

---

**Questions?** Open an issue or update this file with blockers.
