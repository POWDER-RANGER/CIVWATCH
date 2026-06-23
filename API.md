# CIVWATCH API Specification

> **Standard**: OpenAPI 3.0 | **Source**: [swagger.io/specification](https://swagger.io/specification/)  
> **Version**: v1.0.0 | **Base Path**: `/api/v1`

---

## Overview

The CIVWATCH REST API provides programmatic access to civic data ingestion, monitoring, analytics, anomaly detection, alerting, and reporting. All endpoints use JSON for request and response bodies unless otherwise specified.

| Aspect | Detail |
|--------|--------|
| **Protocol** | HTTPS only (TLS 1.3+) |
| **Auth** | Bearer JWT (RFC 8725) |
| **Content-Type** | `application/json` |
| **Rate Limit** | 1000 req/min per API key (burst 2x) |
| **Pagination** | Cursor-based + offset (`page`, `pageSize`) |
| **WebSocket** | Available for real-time alert streaming |

---

## Authentication

### POST `/auth/login`

Authenticate and receive a JWT access token + refresh token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "string",
  "mfaToken": "optional-totp"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "role": "analyst",
    "permissions": ["read:monitors", "write:alerts"]
  }
}
```

**Errors:** `401 invalid_credentials`, `401 mfa_required`, `403 account_locked`

---

### POST `/auth/refresh`

Refresh an expiring access token using a valid refresh token.

**Headers:** `Authorization: Bearer <refresh_token>`

**Response:**
```json
{
  "token": "eyJhbGciOi...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

---

### GET `/auth/me`

Retrieve the currently authenticated user's profile and permissions.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** User object with `id`, `email`, `role`, `permissions`, `orgId`, `lastLoginAt`

---

### POST `/auth/logout`

Revoke the current session token.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

## Health & Observability

### GET `/health`

Liveness probe for load balancers and orchestrators.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 86400.5,
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "mlService": "ok"
  }
}
```

### GET `/health/ready`

Readiness probe — returns `503` if critical dependencies are unavailable.

### GET `/metrics`

Prometheus-compatible metrics endpoint (requires `metrics:read` permission).

---

## Data Sources

Manage civic data sources (RSS feeds, APIs, scrapers, file uploads).

### GET `/sources`

List all configured data sources with pagination and filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (1-200, default: 20) |
| `type` | string | Filter by `api`, `rss`, `scraper`, `upload` |
| `status` | string | Filter by `active`, `paused`, `error` |
| `sort` | string | Sort field + direction, e.g., `createdAt,desc` |

**Response:** Paginated list of Source objects.

---

### POST `/sources`

Create a new data source.

**Request Body:**
```json
{
  "name": "City Council RSS",
  "type": "rss",
  "description": "Keokuk City Council meeting minutes",
  "config": {
    "feedUrl": "https://cityofkeokuk.org/rss",
    "refreshInterval": 3600,
    "maxEntries": 100
  },
  "schedule": {
    "frequency": "hourly",
    "cron": "0 * * * *"
  },
  "tags": ["civic", "iowa", "council"]
}
```

**Source Type Configurations:**

| Type | Required Config Fields |
|------|----------------------|
| `api` | `baseUrl`, `headers`, `auth` (type: bearer/basic/apiKey) |
| `rss` | `feedUrl`, `refreshInterval` (seconds) |
| `scraper` | `startUrl`, `rules[]` (CSS selectors), `respectRobotsTxt` |
| `upload` | `schema` (JSON Schema), `delimiter` (CSV), `encoding` |

---

### GET `/sources/{id}`

Retrieve a single source by ID, including last fetch status and recent errors.

### PATCH `/sources/{id}`

Update source configuration. Only changed fields need to be provided.

### DELETE `/sources/{id}`

Soft-delete a source (retains historical data, disables future ingestion).

### POST `/sources/{id}/test`

Test source connectivity and validate configuration without persisting.

### POST `/sources/{id}/fetch`

Trigger an immediate fetch for this source (respects rate limits).

---

## Monitoring Sessions

Configure and manage real-time monitoring jobs that analyze ingested data.

### GET `/monitors`

List all monitoring sessions.

**Query Parameters:** `page`, `pageSize`, `status` (pending|running|paused|error), `sourceId`

---

### POST `/monitors`

Create a new monitoring session.

**Request Body:**
```json
{
  "name": "Campaign Finance Anomaly Watch",
  "sourceIds": ["src_abc", "src_def"],
  "frequency": "realtime",
  "filters": {
    "keywords": ["contribution", "expenditure", "PAC"],
    "sentimentRange": [-1, 1],
    "entityTypes": ["organization", "person"],
    "dateRange": {
      "from": "2026-01-01T00:00:00Z",
      "to": "2026-12-31T23:59:59Z"
    }
  },
  "analyses": {
    "sentiment": true,
    "biasDetection": true,
    "anomalyDetection": {
      "enabled": true,
      "algorithm": "dbscan",
      "sensitivity": 0.85,
      "minClusterSize": 5
    },
    "topicClassification": true,
    "namedEntityRecognition": true
  },
  "alertRules": [
    {
      "type": "anomaly_score",
      "threshold": 0.9,
      "severity": "critical",
      "cooldown": 3600
    }
  ]
}
```

---

### GET `/monitors/{id}`

Retrieve monitor details, including current status, last run time, and recent results.

### PATCH `/monitors/{id}`

Update monitor configuration. Changes take effect on next run cycle.

### POST `/monitors/{id}/start`

Start or resume a monitoring session.

### POST `/monitors/{id}/stop`

Pause a monitoring session (retains state, can be resumed).

### DELETE `/monitors/{id}`

Permanently delete a monitor and its associated runtime state.

### GET `/monitors/{id}/logs`

Retrieve execution logs for a monitor (paginated, last 30 days retained).

---

## Analytics

Access aggregated analytics, time-series data, and ML-generated insights.

### GET `/analytics/overview`

High-level KPIs across all or selected sources.

**Query Parameters:** `from`, `to`, `sourceIds[]`

**Response:**
```json
{
  "period": { "from": "2026-06-01T00:00:00Z", "to": "2026-06-23T23:59:59Z" },
  "documents": { "total": 45230, "new": 1240 },
  "entities": { "total": 8921, "top": [{ "name": "City Council", "count": 342 }] },
  "sentiment": { "average": 0.12, "distribution": { "positive": 0.34, "neutral": 0.45, "negative": 0.21 } },
  "alerts": { "total": 156, "open": 12, "critical": 2 },
  "anomalies": { "total": 89, "trend": "increasing" },
  "topics": [
    { "name": "budget", "volume": 1240, "sentiment": -0.15 },
    { "name": "infrastructure", "volume": 890, "sentiment": 0.32 }
  ]
}
```

---

### GET `/analytics/timeseries`

Time-series data for charting and trend analysis.

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `metric` | `document_volume`, `sentiment`, `anomaly_score`, `alert_count`, `entity_count` |
| `from` | ISO 8601 start time |
| `to` | ISO 8601 end time |
| `interval` | `minute`, `hour`, `day`, `week`, `month` |
| `sourceIds[]` | Filter by source(s) |
| `filters` | Additional Lucene-like query filters |

**Response:** Array of `{timestamp, value}` data points.

---

### GET `/analytics/sentiment/distribution`

Sentiment distribution histogram with optional entity/topic breakdown.

### GET `/analytics/topics`

Extracted topics with volume, sentiment, and trend indicators.

### GET `/analytics/entities`

Named entities (people, organizations, locations) with mention frequency and sentiment correlation.

### GET `/analytics/heatmap`

Temporal heatmap data (document volume by hour/day matrix) for dashboard visualization.

---

### GET `/analytics/anomalies`

Detected anomalies with context and ML confidence scores.

**Response:**
```json
{
  "anomalies": [
    {
      "id": "anom_123",
      "timestamp": "2026-06-22T14:30:00Z",
      "type": "spending_surge",
      "severity": "high",
      "confidence": 0.94,
      "entities": ["Public Works Dept"],
      "contextDocuments": ["doc_456", "doc_789"],
      "clusterSize": 12,
      "clusterEpsilon": 0.15
    }
  ]
}
```

---

## Alerts

Alert management for anomaly-driven and threshold-based notifications.

### GET `/alerts`

List alerts with filtering and pagination.

**Query Parameters:** `status` (open|acknowledged|closed), `severity` (low|medium|high|critical), `monitorId`, `from`, `to`

---

### POST `/alerts/rules`

Create an alert rule.

**Request Body:**
```json
{
  "name": "High Anomaly Score Alert",
  "description": "Trigger when anomaly detection confidence exceeds threshold",
  "type": "threshold",
  "conditions": {
    "metric": "anomaly_score",
    "operator": "gt",
    "threshold": 0.9,
    "duration": 300
  },
  "severity": "high",
  "channels": {
    "email": ["ops@example.com"],
    "webhook": ["https://hooks.slack.com/..."],
    "pagerduty": ["service-key"],
    "discord": ["webhook-url"]
  },
  "cooldown": 3600,
  "autoEscalate": {
    "enabled": true,
    "afterMinutes": 30,
    "escalateTo": ["manager@example.com"]
  }
}
```

---

### GET `/alerts/{id}`

Retrieve alert details with full context and timeline.

### POST `/alerts/{id}/acknowledge`

Acknowledge an alert (stops escalation, marks as in-progress).

### POST `/alerts/{id}/resolve`

Resolve a closed alert with optional resolution notes.

### GET `/alerts/{id}/timeline`

Full event timeline for an alert (triggered → escalated → acknowledged → resolved).

---

## Reports

Generate and export transparency reports, summaries, and compliance documentation.

### GET `/reports`

List available reports.

**Query Parameters:** `type` (summary|detailed|transparency|compliance), `from`, `to`, `status`

---

### POST `/reports`

Generate a new report.

**Request Body:**
```json
{
  "type": "transparency",
  "title": "Q2 2026 Civic Activity Report",
  "period": {
    "from": "2026-04-01T00:00:00Z",
    "to": "2026-06-30T23:59:59Z"
  },
  "sections": ["overview", "trends", "anomalies", "entities", "appendix"],
  "format": "pdf",
  "recipients": ["council@cityofkeokuk.org"],
  "schedule": {
    "frequency": "quarterly",
    "nextRun": "2026-10-01T00:00:00Z"
  }
}
```

**Supported Formats:** `pdf`, `html`, `csv`, `json`, `xlsx`

---

### GET `/reports/{id}`

Retrieve report metadata and download URL.

### GET `/reports/{id}/download`

Download the generated report file.

### DELETE `/reports/{id}`

Delete a report (generated files are removed from object storage).

---

## Webhooks

Configure webhook endpoints for real-time event delivery.

### POST `/webhooks`

Register a new webhook endpoint.

**Request Body:**
```json
{
  "url": "https://api.example.com/civwatch/events",
  "secret": "whsec_your_secret_key",
  "events": [
    "alert.triggered",
    "alert.escalated",
    "anomaly.detected",
    "report.completed",
    "source.error"
  ],
  "active": true,
  "metadata": {
    "description": "Production Slack integration"
  }
}
```

---

### Webhook Event Payload

All webhook deliveries include an HMAC-SHA256 signature:

```
X-CIVWATCH-Signature: t=1719072000,s=hex_signature
X-CIVWATCH-Event: alert.triggered
X-CIVWATCH-Delivery: evt_unique_id
```

**Example payload:**
```json
{
  "id": "evt_abc123",
  "type": "alert.triggered",
  "timestamp": "2026-06-22T14:30:00Z",
  "data": {
    "alertId": "alrt_456",
    "severity": "high",
    "message": "Anomaly detected in campaign finance data",
    "context": {
      "monitorId": "mon_789",
      "anomalyScore": 0.94,
      "entities": ["Committee for Public Safety"]
    }
  }
}
```

### Signature Verification (Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(signatureHeader, payload, secret) {
  const match = signatureHeader.match(/t=(\d+),s=(\w+)/);
  if (!match) return false;
  
  const [, timestamp, signature] = match;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
    
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}
```

---

### DELETE `/webhooks/{id}`

Deactivate and remove a webhook endpoint.

---

## Administration

### GET `/admin/users`

List all users (requires `admin` role).

### POST `/admin/users`

Create a new user account.

```json
{
  "email": "newuser@example.com",
  "role": "analyst",
  "password": "temporary-password-to-reset"
}
```

### PATCH `/admin/users/{id}`

Update user role, permissions, or status.

### DELETE `/admin/users/{id}`

Deactivate a user account.

---

### GET `/admin/settings`

Retrieve system-wide configuration.

### PATCH `/admin/settings`

Update system settings (rate limits, retention policies, feature flags).

---

### GET `/admin/audit-log`

Administrative action audit trail (requires `admin:audit:read`).

**Query Parameters:** `from`, `to`, `actorId`, `action`, `resource`

---

## Error Responses

All errors follow the RFC 7807 Problem Details format:

```json
{
  "type": "https://api.civwatch.io/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request body contains invalid fields.",
  "instance": "/api/v1/monitors",
  "errors": [
    {
      "field": "name",
      "code": "required",
      "message": "Monitor name is required."
    }
  ]
}
```

**HTTP Status Codes:**

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| `200` | OK | Successful GET/PUT/PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error, malformed JSON |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Valid auth, insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Resource conflict (e.g., duplicate name) |
| `422` | Unprocessable | Semantic validation failure |
| `429` | Too Many Requests | Rate limit exceeded; check `Retry-After` |
| `500` | Server Error | Internal failure; retry with backoff |
| `503` | Service Unavailable | Dependency unavailable; check `Retry-After` |

---

## WebSocket: Real-Time Stream

Connect to `wss://api.civwatch.io/v1/stream` for real-time alert and anomaly delivery.

**Connection:**
```javascript
const ws = new WebSocket('wss://api.civwatch.io/v1/stream');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer <jwt>'
  }));
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['alerts', 'anomalies', 'system']
  }));
};
```

**Message format:**
```json
{
  "channel": "alerts",
  "type": "alert.triggered",
  "timestamp": "2026-06-22T14:30:00Z",
  "payload": { ... }
}
```

---

## Rate Limiting Headers

Every response includes rate limit metadata:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1719075600
X-RateLimit-Retry-After: 0
```

When exceeded (`429`):

```
Retry-After: 45
X-RateLimit-Retry-After: 45
```

---

## SDKs & Client Libraries

| Language | Package | Status |
|----------|---------|--------|
| JavaScript/TypeScript | `@civwatch/sdk` | Planned |
| Python | `civwatch-sdk` | Planned |
| Go | `github.com/civwatch/go-sdk` | Planned |

---

## Changelog

### v1.0.0 (2026-06-23)
- Initial stable API release
- Authentication with JWT + refresh tokens
- Source CRUD (RSS, API, scraper, upload)
- Monitor session management
- Analytics endpoints (overview, timeseries, sentiment, topics, entities)
- Alert rules and lifecycle management
- Report generation (PDF, CSV, JSON, XLSX)
- Webhook subscription with HMAC signatures
- WebSocket real-time streaming
- Administrative user and settings management

---

## See Also

- [Architecture Reference](./ARCHITECTURE.md) — System architecture and data flow
- [ML Tuning Guide](./ML_TUNING.md) — Anomaly detection configuration
- [Deployment Guide](./DEPLOYMENT.md) — Infrastructure and operations
- [Security Policy](./SECURITY.md) — Vulnerability reporting and hardening
- [Contributing Guide](./CONTRIBUTING.md) — Development workflow
