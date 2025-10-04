# CIVWATCH API Documentation

Version: v1.0.0
Base URL: /api

- Authentication: Bearer token (JWT)
- Content-Type: application/json
- Rate Limit: 1000 requests/min per API key

## Authentication

POST /api/auth/login
Request: { "email": "user@example.com", "password": "string" }
Response: { "token": "<jwt>", "expiresIn": 3600, "user": {"id":"...","role":"admin"}}

POST /api/auth/refresh
Headers: Authorization: Bearer <refresh_jwt>
Response: { "token": "<jwt>", "expiresIn": 3600 }

GET /api/auth/me
Headers: Authorization
Response: Current user profile

Errors:
- 401 invalid_credentials
- 401 token_expired
- 403 forbidden

## Health
GET /api/health -> { status: "ok", uptime: 123.45 }

## Sources
Manage data sources connected to CIVWATCH.

GET /api/sources
Query: page, pageSize, type, status
Response: { items: [Source], page, pageSize, total }

POST /api/sources
Body: { name, type: "api|rss|scraper|upload", config: {...} }
Response: Source

GET /api/sources/{id}
PATCH /api/sources/{id}
DELETE /api/sources/{id}

Types:
- api: { baseUrl, headers, auth }
- rss: { feedUrl, refreshInterval }
- scraper: { startUrl, rules[] }
- upload: { schema, delimiter }

## Monitoring Sessions

GET /api/monitors
POST /api/monitors { sourceId, name, frequency: "realtime|hourly|daily", filters: { keywords[], sentiment:[-1..1] }, analyses: { sentiment:bool, bias:bool, anomaly:bool } }
GET /api/monitors/{id}
PATCH /api/monitors/{id}
POST /api/monitors/{id}/start
POST /api/monitors/{id}/stop

Responses include status: pending|running|paused|stopped and lastRun.

## Analytics

GET /api/analytics/overview?from&to&sourceId
Returns KPIs: messages, entities, alerts, avgSentiment, biasIndex.

GET /api/analytics/timeseries?metric&from&to&interval=minute|hour|day&sourceId

GET /api/analytics/sentiment/distribution?from&to&sourceId

GET /api/analytics/topics?from&to&sourceId

## Alerts

GET /api/alerts?status=open|ack|closed&severity=low|medium|high|critical
POST /api/alerts
Body: { name, type: "threshold|anomaly|event|schedule", conditions: {...}, channels: { email[], sms[], webhook[], discord[] } }
GET /api/alerts/{id}
PATCH /api/alerts/{id}
POST /api/alerts/{id}/ack
POST /api/alerts/{id}/close

Alert payload example (webhook):
{
  "id": "alrt_123",
  "name": "High Anomaly Score",
  "severity": "high",
  "triggeredAt": "2025-10-04T16:45:22Z",
  "context": { "monitorId": "mon_42", "score": 0.93 }
}

## Reports

GET /api/reports?type=summary|detailed|transparency&from&to
POST /api/reports { type, from, to, recipients[], format: pdf|csv|json }
GET /api/reports/{id}
POST /api/reports/{id}/send

## Admin

GET /api/admin/users
POST /api/admin/users { email, role }
PATCH /api/admin/users/{id}
DELETE /api/admin/users/{id}

GET /api/admin/settings
PATCH /api/admin/settings { key: value }

## Pagination
Requests: page (1..), pageSize (1..200)
Responses: { items, page, pageSize, total, hasNext }

## Filtering & Sorting
- filter: query string (Lucene-like) e.g., sentiment>0.2 AND source:"council"
- sort: field,[asc|desc] e.g., sort=createdAt,desc

## Error Handling
Errors return HTTP status and JSON body:
{
  "error": {
    "code": "validation_error",
    "message": "Field 'name' is required",
    "details": [{ "field":"name", "rule":"required" }]
  }
}

Common codes: validation_error, not_found, unauthorized, forbidden, rate_limited, conflict, server_error.

## Webhooks

Register: POST /api/webhooks { url, secret, events: ["alert.triggered","report.completed"] }
Deliveries use HMAC-SHA256 signature header: X-CIVWATCH-Signature: t=timestamp, s=hex

Verify example (Node.js):
```js
const crypto = require('crypto');
function verify(sigHeader, payload, secret){
  const [, t, s] = sigHeader.match(/t=(\d+), s=(\w+)/) || [];
  const expected = crypto.createHmac('sha256', secret)
    .update(`${t}.${payload}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(s));
}
```

## SDKs
- JavaScript/TypeScript: @civwatch/sdk
- Python: civwatch-sdk

Install:
```bash
npm i @civwatch/sdk
# or
pip install civwatch-sdk
```

## Rate Limits
- 1000 rpm per token (burst 2x)
- 5 concurrent report generations per account
- Backoff: Retry-After header on 429

## Changelog
- 1.0.0: Initial public API

## See Also
- Authentication guide: ./user-guide.md#configuration
- Architecture: ./architecture.md
- Plugins: ./plugins.md
- Testing: ./testing.md
