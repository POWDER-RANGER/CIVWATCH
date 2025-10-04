# CIVWATCH API Documentation

⚠️ **IMPORTANT**: This API is not yet implemented. This document describes planned API design for future development.

## Overview

**Version**: v1.0.0  
**Base URL**: `/api`  
**Authentication**: Bearer token (JWT)  
**Content-Type**: `application/json`  
**Rate Limit**: 1000 requests/min per API key

## Authentication

### Login

**POST** `/api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response**:
```json
{
  "token": "<jwt>",
  "expiresIn": 3600,
  "user": {
    "id": "...",
    "role": "admin"
  }
}
```

### Refresh Token

**POST** `/api/auth/refresh`

**Headers**: `Authorization: Bearer <refresh_jwt>`

**Response**:
```json
{
  "token": "<jwt>",
  "expiresIn": 3600
}
```

### Get Current User

**GET** `/api/auth/me`

**Headers**: `Authorization: Bearer <jwt>`

**Response**: Current user profile

**Errors**:
- `401 invalid_credentials`
- `401 token_expired`
- `403 forbidden`

## Health

**GET** `/api/health`

**Response**:
```json
{
  "status": "ok",
  "uptime": 123.45
}
```

## Sources

Manage data sources connected to CIVWATCH.

### List Sources

**GET** `/api/sources`

**Query Parameters**: `page`, `pageSize`, `type`, `status`

**Response**:
```json
{
  "items": ["Source"],
  "page": 1,
  "pageSize": 20,
  "total": 100
}
```

### Create Source

**POST** `/api/sources`

**Body**:
```json
{
  "name": "string",
  "type": "api|rss|scraper|upload",
  "config": {}
}
```

**Response**: Source object

### Get Source

**GET** `/api/sources/{id}`

### Update Source

**PATCH** `/api/sources/{id}`

### Delete Source

**DELETE** `/api/sources/{id}`

### Source Types

- **api**: `{ baseUrl, headers, auth }`
- **rss**: `{ feedUrl, refreshInterval }`
- **scraper**: `{ startUrl, rules[] }`
- **upload**: `{ schema, delimiter }`

## Monitoring Sessions

### List Monitors

**GET** `/api/monitors`

### Create Monitor

**POST** `/api/monitors`

**Body**:
```json
{
  "sourceId": "string",
  "name": "string",
  "frequency": "realtime|hourly|daily",
  "filters": {
    "keywords": [],
    "sentiment": [-1, 1]
  },
  "analyses": {
    "sentiment": true,
    "bias": true,
    "anomaly": true
  }
}
```

### Get Monitor

**GET** `/api/monitors/{id}`

### Update Monitor

**PATCH** `/api/monitors/{id}`

### Start Monitor

**POST** `/api/monitors/{id}/start`

### Stop Monitor

**POST** `/api/monitors/{id}/stop`

**Note**: Responses include `status` (pending|running|paused|stopped) and `lastRun`.

## Analytics

### Overview

**GET** `/api/analytics/overview`

**Query Parameters**: `from`, `to`, `sourceId`

**Returns**: KPIs including `messages`, `entities`, `alerts`, `avgSentiment`, `biasIndex`

### Time Series

**GET** `/api/analytics/timeseries`

**Query Parameters**: `metric`, `from`, `to`, `interval` (minute|hour|day), `sourceId`

### Sentiment Distribution

**GET** `/api/analytics/sentiment/distribution`

**Query Parameters**: `from`, `to`, `sourceId`

### Topics

**GET** `/api/analytics/topics`

**Query Parameters**: `from`, `to`, `sourceId`

## Alerts

### List Alerts

**GET** `/api/alerts`

**Query Parameters**: `status` (open|ack|closed), `severity` (low|medium|high|critical)

### Create Alert

**POST** `/api/alerts`

**Body**:
```json
{
  "name": "string",
  "type": "threshold|anomaly|event|schedule",
  "conditions": {},
  "channels": {
    "email": [],
    "sms": [],
    "webhook": [],
    "discord": []
  }
}
```

### Get Alert

**GET** `/api/alerts/{id}`

### Update Alert

**PATCH** `/api/alerts/{id}`

### Acknowledge Alert

**POST** `/api/alerts/{id}/ack`

### Close Alert

**POST** `/api/alerts/{id}/close`

### Alert Payload Example (Webhook)

```json
{
  "id": "alrt_123",
  "name": "High Anomaly Score",
  "severity": "high",
  "triggeredAt": "2025-10-04T16:45:22Z",
  "context": {
    "monitorId": "mon_42",
    "score": 0.93
  }
}
```

## Reports

### List Reports

**GET** `/api/reports`

**Query Parameters**: `type` (summary|detailed|transparency), `from`, `to`

### Generate Report

**POST** `/api/reports`

**Body**:
```json
{
  "type": "summary|detailed|transparency",
  "from": "ISO8601",
  "to": "ISO8601",
  "recipients": [],
  "format": "pdf|csv|json"
}
```

### Get Report

**GET** `/api/reports/{id}`

### Send Report

**POST** `/api/reports/{id}/send`

## Admin

### Users

**GET** `/api/admin/users` - List all users

**POST** `/api/admin/users` - Create user

**Body**:
```json
{
  "email": "string",
  "role": "string"
}
```

**PATCH** `/api/admin/users/{id}` - Update user

**DELETE** `/api/admin/users/{id}` - Delete user

### Settings

**GET** `/api/admin/settings` - Get all settings

**PATCH** `/api/admin/settings` - Update settings

**Body**:
```json
{
  "key": "value"
}
```

## Pagination

**Request Parameters**:
- `page`: Starting from 1
- `pageSize`: 1-200

**Response Format**:
```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 100,
  "hasNext": true
}
```

## Filtering & Sorting

**Filtering**: Use Lucene-like query strings  
Example: `sentiment>0.2 AND source:"council"`

**Sorting**: `field,[asc|desc]`  
Example: `sort=createdAt,desc`

## Error Handling

Errors return HTTP status codes with JSON body:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Field 'name' is required",
    "details": [
      {
        "field": "name",
        "rule": "required"
      }
    ]
  }
}
```

**Common Error Codes**:
- `validation_error` - Invalid request data
- `not_found` - Resource not found
- `unauthorized` - Authentication required
- `forbidden` - Insufficient permissions
- `rate_limited` - Rate limit exceeded
- `conflict` - Resource conflict
- `server_error` - Internal server error

## Webhooks

### Register Webhook

**POST** `/api/webhooks`

**Body**:
```json
{
  "url": "https://example.com/webhook",
  "secret": "your-secret",
  "events": ["alert.triggered", "report.completed"]
}
```

### Signature Verification

Webhook deliveries include an HMAC-SHA256 signature in the header:
```
X-CIVWATCH-Signature: t=timestamp, s=hex
```

**Verification Example (Node.js)**:
```js
const crypto = require('crypto');

function verify(sigHeader, payload, secret) {
  const [, t, s] = sigHeader.match(/t=(\d+), s=(\w+)/) || [];
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${payload}`)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(s)
  );
}
```

## SDKs

**Planned (Not Yet Published)**:
- JavaScript/TypeScript: `@civwatch/sdk`
- Python: `civwatch-sdk`

## Rate Limits

- **Requests**: 1000 requests per minute per token (burst 2x)
- **Concurrent Reports**: 5 per account
- **Backoff**: Check `Retry-After` header on 429 responses

## Changelog

### v1.0.0
- Initial planned API design

## See Also

- [User Guide](./user-guide.md#configuration) - Authentication guide
- [Architecture](./architecture.md) - System architecture
- [Plugins](./plugins.md) - Plugin development
- [Testing](./testing.md) - Testing strategy
