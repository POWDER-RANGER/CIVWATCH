# CIVWATCH Performance Guide

> **Standard**: Google SRE Book | **Source**: [sre.google](https://sre.google/sre-book/table-of-contents/)  
> **Principles**: Error budgets, SLOs, SLIs, blameless postmortems

---

## Service Level Objectives (SLOs)

| Service | SLI | SLO | Error Budget |
|---------|-----|-----|-------------|
| **REST API** | Availability | 99.9% (43.8m downtime/month) | 0.1% |
| **REST API** | Latency (p95) | < 200ms | 5% over 200ms |
| **ML Inference** | Latency (p99) | < 500ms | 1% over 500ms |
| **WebSocket** | Connection uptime | 99.5% | 0.5% |
| **Ingestion** | Processing lag | < 5 minutes | 1% over 5min |
| **Alert Dispatch** | Delivery time | < 30 seconds | 0.1% over 30s |
| **Report Generation** | Completion time | < 5 minutes | 1% over 5min |

---

## Service Level Indicators (SLIs)

### API Availability

```promql
# Availability = successful_requests / total_requests
sum(rate(http_requests_total{status!~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

### API Latency

```promql
# P95 latency
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# P99 latency
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```

### ML Inference Latency

```promql
# P99 inference time
histogram_quantile(0.99,
  sum(rate(ml_inference_duration_seconds_bucket[5m])) by (le)
)
```

### Ingestion Lag

```promql
# Time between document publication and processing completion
avg(time() - document_ingestion_timestamp)
```

---

## Error Budget Policy

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR BUDGET STATES                       │
│                                                              │
│  100% ┤ ████████████████████████████████████████████ Green   │
│       │  ▲ No action needed                                │
│       │  ▲ Normal feature development                      │
│       │                                                      │
│   75% ┤ ──────────────────────────────────────────── Yellow  │
│       │  ▲ Slow down risky deployments                     │
│       │  ▲ Prioritize reliability work                     │
│       │  ▲ Require additional review for high-risk changes │
│       │                                                      │
│   50% ┤ ──────────────────────────────── Orange            │
│       │  ▲ Freeze non-critical deployments                 │
│       │  ▲ All hands on reliability                        │
│       │  ▲ Escalate to engineering leadership              │
│       │                                                      │
│    0% ┤ ██ Red                                             │
│       │  ▲ EMERGENCY: Stop all deployments                 │
│       │  ▲ Incident response mode                          │
│       │  ▲ Mandatory postmortem required                   │
└─────────────────────────────────────────────────────────────┘
```

**Error budget calculation:**
```
error_budget = 1 - SLO
burn_rate = error_rate / error_budget

# Burn rate alerts:
# - Fast burn (14.4x): Error budget exhausted in 1 day
# - Slow burn (2x): Error budget exhausted in 1 week
```

---

## Performance Budgets

### Frontend

| Resource | Budget | Enforced By |
|----------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse CI |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse CI |
| Time to Interactive (TTI) | < 3.5s | Lighthouse CI |
| Total Bundle Size | < 200KB (gzipped) | webpack-bundle-analyzer |
| JavaScript chunks | < 50KB each (gzipped) | Build step |
| API response (initial) | < 200ms | Backend SLO |

### Backend

| Resource | Budget | Enforced By |
|----------|--------|-------------|
| API response (p50) | < 50ms | Prometheus alert |
| API response (p95) | < 200ms | Prometheus alert |
| API response (p99) | < 500ms | Prometheus alert |
| Database query (p95) | < 20ms | PostgreSQL slow query log |
| Redis operation (p99) | < 5ms | Redis slow log |
| Queue depth | < 1000 jobs | Prometheus alert |

### ML Service

| Resource | Budget | Enforced By |
|----------|--------|-------------|
| Inference latency (p50) | < 50ms | Prometheus alert |
| Inference latency (p99) | < 500ms | Prometheus alert |
| Throughput | > 100 req/sec | Load test |
| Memory usage | < 4GB | Kubernetes limits |
| GPU utilization | 60-90% | nvidia-smi monitoring |

---

## Caching Strategy

### Multi-Layer Cache

```
User Request
    │
    ├──► Browser Cache (Cache-Control: max-age=3600)
    │      └── Static assets, dashboard config
    │
    ├──► CDN Cache (CloudFront, TTL: 1 hour)
    │      └── Public reports, API documentation
    │
    ├──► Redis Cache (TTL: 5 minutes - 24 hours)
    │      └── Analytics aggregations, user sessions
    │
    ├──► PostgreSQL Query Cache (shared_buffers: 25% RAM)
    │      └── Repeated query plans, hot data
    │
    └──► Source (slow path)
           └── Database query + computation
```

### Cache Invalidation

| Cache Layer | Invalidation Strategy | Trigger |
|-------------|----------------------|---------|
| Browser | Versioned filenames | Deployment |
| CDN | Cache invalidation API | Report generation |
| Redis | Key TTL + explicit invalidation | Data ingestion, monitor config change |
| PostgreSQL | Automatic (shared_buffers) | N/A (LRU) |

---

## Database Optimization

### Query Patterns

```sql
-- Index strategy for time-series analytics
CREATE INDEX CONCURRENTLY idx_documents_source_time 
  ON documents (source_id, created_at DESC) 
  INCLUDE (sentiment_score, entity_count);

-- Partial index for active monitors
CREATE INDEX CONCURRENTLY idx_monitors_active 
  ON monitors (id) 
  WHERE status = 'running';

-- BRIN index for large time-series tables (efficient for append-only)
CREATE INDEX CONCURRENTLY idx_audit_log_time_brin 
  ON audit_log USING BRIN (created_at);

-- GIN index for JSONB metadata queries
CREATE INDEX CONCURRENTLY idx_documents_metadata 
  ON documents USING GIN (metadata jsonb_path_ops);
```

### Connection Pooling

```yaml
# PgBouncer configuration (transaction pooling)
pool_mode: transaction
max_client_conn: 10000
default_pool_size: 25
reserve_pool_size: 5
reserve_pool_timeout: 3
server_idle_timeout: 600
server_lifetime: 3600
```

### Read Replicas

```
Write Operations ──► Primary (RDS Multi-AZ)
                         │
                         ├──► Read Replica 1 (us-east-1b)
                         ├──► Read Replica 2 (us-east-1c)
                         └──► Read Replica 3 (reporting - cascade)

Read Operations ──► PgBouncer ──► Round-robin to replicas
```

---

## Load Testing

### k6 Test Scripts

```javascript
// tests/load/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Steady state
    { duration: '2m', target: 200 },   // Spike
    { duration: '5m', target: 200 },   // Sustained load
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_TOKEN = __ENV.API_TOKEN;

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // Health check
  const health = http.get(`${BASE_URL}/api/health`);
  check(health, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });

  // Analytics overview (cached)
  const overview = http.get(`${BASE_URL}/api/analytics/overview`, params);
  check(overview, {
    'overview status is 200': (r) => r.status === 200,
    'overview response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Time series query
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const ts = http.get(
    `${BASE_URL}/api/analytics/timeseries?metric=document_volume&from=${yesterday}&to=${now}&interval=hour`,
    params
  );
  check(ts, {
    'timeseries status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

---

## Profiling & Debugging

### Node.js Backend

```bash
# CPU profiling
node --prof server.js
node --prof-process isolate-*.log > profile.txt

# Heap snapshot (memory leak detection)
curl -X POST http://localhost:3000/debug/heap-snapshot

# Clinic.js suite
clinic doctor -- node server.js       # Overall health
clinic bubbleprof -- node server.js   # Async flow analysis
clinic flame -- node server.js        # CPU flame graph
```

### Python ML Service

```bash
# Memory profiling
mprof run --include-children python -m uvicorn ml.main:app
mprof plot

# CPU profiling (cProfile + snakeviz)
python -m cProfile -o profile.stats -m uvicorn ml.main:app
snakeviz profile.stats

# Py-Spy (sampling profiler, no code changes)
py-spy top --pid $(pgrep -f uvicorn)
py-spy record -o profile.svg --pid $(pgrep -f uvicorn)
```

---

## Capacity Planning

### Growth Projections

| Metric | Current | 6 Months | 12 Months |
|--------|---------|----------|-----------|
| Documents/day | 10,000 | 50,000 | 200,000 |
| Active monitors | 50 | 200 | 1,000 |
| Concurrent users | 100 | 500 | 2,000 |
| API requests/min | 1,000 | 5,000 | 20,000 |
| ML inferences/min | 500 | 2,500 | 10,000 |
| Storage (monthly) | 50GB | 250GB | 1TB |

### Scaling Triggers

```yaml
# Scale frontend when:
# - CPU > 70% for 5 minutes
# - Memory > 80% for 5 minutes
# - Active connections > 1000 per pod

# Scale backend when:
# - Request latency p95 > 200ms for 10 minutes
# - Queue depth > 1000 for 5 minutes
# - Error rate > 1% for 2 minutes

# Scale ML when:
# - Inference latency p99 > 500ms for 5 minutes
# - GPU utilization > 90% for 10 minutes
# - Queue wait time > 30 seconds
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **SEV-1** | Service down / data loss | 5 minutes | All API instances unhealthy, database corruption |
| **SEV-2** | Major degradation | 15 minutes | ML service down, >50% error rate, major feature broken |
| **SEV-3** | Minor degradation | 1 hour | Elevated latency, non-critical feature issue |
| **SEV-4** | Cosmetic / low impact | 1 business day | UI glitch, documentation error |

### Incident Runbook Template

```markdown
# INCIDENT-2026-001: [Brief Description]

## Timeline (all times UTC)
- 14:30 - Alert fired: API p95 latency > 2s
- 14:32 - On-call engineer acknowledged
- 14:35 - Identified: Redis connection pool exhausted
- 14:40 - Mitigated: Increased pool size, restarted connections
- 14:45 - Service restored, SLO compliance verified
- 15:00 - Incident declared resolved

## Root Cause
Redis connection pool configured with max 20 connections.
Under load, connections were not being released fast enough,
 causing API requests to queue and timeout.

## Impact
- Duration: 15 minutes
- API availability: 99.2% (below 99.9% SLO)
- Error budget consumed: 8%
- Users affected: ~50 (elevated latency, no data loss)

## Resolution
1. Increased Redis connection pool from 20 → 100
2. Added connection timeout of 5 seconds
3. Added pool exhaustion alerting

## Action Items
- [ ] Add Redis connection pool metrics to dashboard (@backend-team)
- [ ] Implement circuit breaker for Redis failures (@backend-team)
- [ ] Update runbook with Redis troubleshooting steps (@sre-team)
- [ ] Schedule load test to validate new pool size (@qa-team)

## Lessons Learned
- Connection pool sizing should be based on load test data, not estimates
- Need better visibility into dependency health
```

---

## Postmortem Culture

### Blameless Postmortem Principles

1. **Assume good faith** — Everyone did what made sense given the information
2. **Focus on systems** — What about the system allowed this to happen?
3. **No individual blame** — Names in timeline for context, not accountability
4. **Actionable items** — Every postmortem produces concrete, assigned follow-ups
5. **Share widely** — Postmortems are internal public documents

### Postmortem Template

```markdown
# Postmortem: [Incident ID] — [Title]

Date: YYYY-MM-DD  
Authors: [Team]  
Status: Draft → Review → Final → Shared

## Executive Summary
Two-sentence summary of what happened and the impact.

## Background
Context needed to understand the incident.

## Timeline
Detailed chronological account.

## Impact Assessment
Quantified impact on users, SLOs, and business.

## Root Cause Analysis
5 Whys or Ishikawa diagram.

## Mitigations Applied
What was done during the incident to restore service.

## Corrective Actions
| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|

## Lessons Learned
What went well, what went poorly, where we got lucky.
```

---

## See Also

- [Architecture Reference](./ARCHITECTURE.md) — System architecture
- [Deployment Guide](./DEPLOYMENT.md) — Infrastructure setup
- [ML Tuning Guide](./ML_TUNING.md) — Anomaly detection optimization
- [Data Lineage](./DATA_LINEAGE.md) — Pipeline monitoring
- Google SRE Book — [Chapters 2-4](https://sre.google/sre-book/table-of-contents/)
