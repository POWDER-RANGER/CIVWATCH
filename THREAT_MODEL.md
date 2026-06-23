# CIVWATCH Threat Model

> **Standard**: OWASP Threat Modeling | **Source**: [owasp.org/Threat_Modeling](https://owasp.org/www-community/Threat_Modeling)  
> **Methodology**: STRIDE + Attack Trees | **Review Cycle**: Quarterly or on major architecture change

---

## Scope & Boundaries

### In Scope
- CIVWATCH REST API (Express backend)
- ML inference service (FastAPI)
- React frontend dashboard
- Data ingestion pipeline (RSS, API, scraper, upload)
- PostgreSQL database
- Redis cache/queue
- WebSocket real-time stream
- Webhook delivery subsystem
- Electron desktop application

### Out of Scope
- Third-party civic data sources (responsibility of respective providers)
- End-user devices (browser/ OS security)
- Network infrastructure beyond application layer
- Physical security of hosting facilities

### Trust Boundaries
```
┌─────────────────────────────────────────────────────────────┐
│  EXTERNAL (Untrusted)                                       │
│  ├── Public Internet users                                  │
│  ├── Civic data source APIs/RSS feeds                       │
│  └── Webhook receivers (Slack, PagerDuty, etc.)             │
├─────────────────────────────────────────────────────────────┤
│  DMZ (Semi-Trusted)                                         │
│  ├── Nginx reverse proxy                                    │
│  ├── CDN / WAF                                              │
│  └── Load balancer                                          │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION (Trusted Zone)                                 │
│  ├── React Frontend (Vite)                                  │
│  ├── Express API                                            │
│  ├── FastAPI ML Service                                     │
│  └── BullMQ Workers                                         │
├─────────────────────────────────────────────────────────────┤
│  DATA (Highly Trusted)                                      │
│  ├── PostgreSQL                                             │
│  ├── Redis                                                  │
│  ├── Object Store (S3/MinIO)                                │
│  └── Vault / Secrets Manager                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Asset Inventory

| Asset | Classification | Location | Owner |
|-------|---------------|----------|-------|
| Civic documents (raw) | Public | PostgreSQL | System |
| Analyzed documents + ML outputs | Internal | PostgreSQL | System |
| User credentials (bcrypt hashes) | Confidential | PostgreSQL | Auth Service |
| JWT signing keys | Secret | Vault/Secrets Manager | Auth Service |
| Webhook secrets | Secret | Vault/Secrets Manager | Alert Service |
| API keys for external sources | Secret | Vault/Secrets Manager | Source Service |
| Audit logs | Confidential | PostgreSQL + S3 | Admin Service |
| ML model files | Internal | Object Store | ML Service |
| Report exports | Internal/Public | Object Store | Report Service |
| Redis cache data | Internal | Redis (ephemeral) | Cache Layer |

---

## STRIDE Analysis

### S — Spoofing (Identity)

| # | Threat | Target | Likelihood | Impact | Risk | Mitigation |
|---|--------|--------|------------|--------|------|------------|
| S1 | Stolen JWT used to impersonate user | API endpoints | Medium | High | **High** | Short token expiry (15min), refresh rotation, bind to IP fingerprint |
| S2 | Fake civic source provides malicious data | Ingestion pipeline | Medium | High | **High** | Source verification (domain validation), schema validation, sandboxing |
| S3 | Webhook signature forgery | Webhook receivers | Low | High | **Medium** | HMAC-SHA256 with 256-bit secrets, constant-time comparison |
| S4 | Admin account takeover via brute force | Login endpoint | Medium | Critical | **High** | Rate limiting (5 attempts / 15min), account lockout, MFA |
| S5 | ML model poisoning via crafted input | ML Service | Low | High | **Medium** | Input sanitization, adversarial detection, model versioning |

**Attack Tree — S1 (JWT Impersonation):**
```
[S1: JWT Impersonation]
    ├── Token Theft
    │   ├── XSS in frontend
    │   │   └── Mitigation: CSP strict, HttpOnly cookies
    │   ├── Network interception (unsecured connection)
    │   │   └── Mitigation: TLS 1.3 mandatory
    │   └── Log file leakage
    │       └── Mitigation: Never log tokens, structured logging audit
    │
    └── Token Forgery
        ├── Weak signing key
        │   └── Mitigation: RS256 with 2048+ bit keys, rotate quarterly
        └── Algorithm confusion (alg: none)
            └── Mitigation: Explicitly allowlist algorithms, reject none
```

---

### T — Tampering

| # | Threat | Target | Likelihood | Impact | Risk | Mitigation |
|---|--------|--------|------------|--------|------|------------|
| T1 | Civic data modified in transit | Source → Ingestion | Medium | High | **High** | HTTPS for all sources, certificate pinning where possible |
| T2 | Database records altered | PostgreSQL | Low | Critical | **High** | Row-level security, audit triggers, immutable audit log |
| T3 | ML model weights tampered | Model Store | Low | Critical | **High** | Model signing (SHA-256), integrity checks on load, read-only store |
| T4 | Cache poisoning | Redis | Medium | Medium | **Medium** | Redis AUTH, namespace isolation, TTL on all keys |
| T5 | Report data manipulation | Report generation | Low | High | **Medium** | Immutable source data, signed reports, checksum verification |

---

### R — Repudiation

| # | Threat | Target | Likelihood | Impact | Risk | Mitigation |
|---|--------|--------|------------|--------|------|------------|
| R1 | User denies administrative action | Admin endpoints | Low | Medium | **Medium** | Comprehensive audit logging (who, what, when, where) |
| R2 | Alert acknowledged but not acted upon | Alert lifecycle | Medium | Medium | **Medium** | Escalation timers, SLA tracking, immutable alert timeline |
| R3 | Source data claimed to be different | Ingestion pipeline | Low | High | **Medium** | Content hashing at ingestion, digital fingerprints stored |
| R4 | Webhook delivery disputed | Webhook system | Low | Medium | **Low** | Delivery receipts, retry logs, idempotency keys |

**Audit Log Schema:**
```json
{
  "id": "audit_abc123",
  "timestamp": "2026-06-22T14:30:00.000Z",
  "actor": { "type": "user", "id": "usr_456", "ip": "10.0.0.1" },
  "action": "monitor.delete",
  "resource": { "type": "monitor", "id": "mon_789" },
  "result": "success",
  "before": { "name": "Old Name", "status": "running" },
  "after": null,
  "sessionId": "sess_xyz789",
  "userAgent": "Mozilla/5.0..."
}
```

---

### I — Information Disclosure

| # | Threat | Target | Likelihood | Impact | Risk | Mitigation |
|---|--------|--------|------------|--------|------|------------|
| I1 | API returns stack traces in errors | Error responses | High | Medium | **High** | Generic error messages, stack traces only in dev mode |
| I2 | Sensitive data in logs | Log files | Medium | High | **High** | PII redaction, structured logging, log classification |
| I3 | Unauthorized access to documents | Document endpoints | Medium | High | **High** | RBAC enforcement, row-level security, query scoping |
| I4 | Redis data exposed without auth | Redis | Low | High | **Medium** | Redis AUTH, TLS for Redis, network isolation |
| I5 | ML model inversion attacks | ML Service | Low | Medium | **Low** | Output confidence thresholding, rate limiting on inference |
| I6 | Timing attacks on login | Login endpoint | Low | Medium | **Low** | Constant-time comparison for passwords |

---

### D — Denial of Service

| # | Threat | Target | Likelihood | Impact | Risk | Mitigation |
|---|--------|--------|------------|--------|------|------------|
| D1 | Resource exhaustion via large uploads | Upload endpoint | High | Medium | **High** | File size limits (10MB), streaming parsing, timeout (30s) |
| D2 | Expensive query abuse | Analytics endpoints | Medium | Medium | **Medium** | Query complexity scoring, max date range limits, read replicas |
| D3 | Scraping of source websites blocked | Ingestion | Medium | Medium | **Medium** | Respect robots.txt, rate limiting, user-agent identification |
| D4 | WebSocket connection flooding | Real-time stream | Low | Medium | **Medium** | Connection limits per IP, heartbeat timeout, auth on connect |
| D5 | Redis memory exhaustion | Cache layer | Low | Medium | **Medium** | Memory policies (allkeys-lru), maxmemory limits, monitoring |

---

### E — Elevation of Privilege

| # | Threat | Target | Likelihood | Impact | Risk | Mitigation |
|---|--------|--------|------------|--------|------|------------|
| E1 | Role escalation via parameter tampering | User endpoints | Low | Critical | **High** | Server-side role validation, admin-only endpoints, audit all role changes |
| E2 | SQL injection via unsanitized input | Database layer | Low | Critical | **High** | Prisma ORM (parameterized queries), input validation with Zod |
| E3 | Command injection in scraper config | Scraper source | Medium | High | **High** | Input sanitization, allowlist URL schemes, sandboxed execution |
| E4 | SSRF via API source configuration | API source | Medium | High | **High** | URL allowlist, block private IP ranges, DNS rebinding protection |
| E5 | Path traversal in file upload | Upload handler | Low | High | **Medium** | UUID filenames, chroot upload dir, extension allowlist |

---

## Attack Scenarios

### Scenario 1: Poisoned Civic Feed Injection

**Attack:** Adversary compromises or creates a fake government RSS feed containing fabricated meeting minutes with anomalous expenditure figures.

**Impact:** ML model trains on false data; alerts trigger on legitimate data, eroding trust.

**Mitigations:**
1. Source domain verification (DNS + SSL cert validation)
2. Cross-reference with known official domains
3. Sudden pattern change detection (new source baseline period)
4. Human review queue for new sources

---

### Scenario 2: Model Extraction via Inference API

**Attack:** Adversary queries the anomaly detection endpoint with crafted inputs to reconstruct the ML model.

**Impact:** Proprietary detection logic exposed; adversaries can craft inputs to evade detection.

**Mitigations:**
1. Rate limiting on inference endpoints
2. Output confidence thresholding (return binary instead of scores)
3. Query diversity monitoring (detect systematic exploration)
4. API key scoping (inference permission separate from admin)

---

### Scenario 3: Privilege Escalation via JWT Manipulation

**Attack:** Adversary modifies JWT payload to change role from `viewer` to `admin`.

**Impact:** Full administrative access to all data and configuration.

**Mitigations:**
1. RS256 asymmetric signing (private key server-only)
2. Server-side role resolution (never trust client role claims)
3. Token binding to session fingerprint
4. Short expiry with refresh token rotation

---

## Risk Register

| ID | Threat | Risk Score | Status | Owner | Review Date |
|----|--------|-----------|--------|-------|-------------|
| S1 | JWT impersonation | High | Mitigated | Auth Team | 2026-09-23 |
| S2 | Poisoned source feed | High | Mitigated | Ingestion Team | 2026-09-23 |
| S4 | Admin account takeover | High | Mitigated | Auth Team | 2026-09-23 |
| T1 | Data tampering in transit | High | Mitigated | Platform Team | 2026-09-23 |
| T2 | Database record tampering | High | Mitigated | Database Team | 2026-09-23 |
| T3 | ML model tampering | High | Mitigated | ML Team | 2026-09-23 |
| I1 | Stack trace disclosure | High | Resolved | API Team | 2026-06-30 |
| I2 | Sensitive data in logs | High | Mitigated | Platform Team | 2026-09-23 |
| I3 | Unauthorized document access | High | Mitigated | API Team | 2026-09-23 |
| D1 | Upload-based DoS | High | Mitigated | API Team | 2026-06-30 |
| E1 | Role escalation | High | Mitigated | Auth Team | 2026-09-23 |
| E2 | SQL injection | High | Resolved | Database Team | 2026-06-30 |
| E3 | Command injection (scraper) | High | Mitigated | Ingestion Team | 2026-09-23 |
| E4 | SSRF via API source | High | Mitigated | Ingestion Team | 2026-09-23 |

---

## Security Controls Checklist

### Implemented Controls

| Control | Implementation | Verification |
|---------|---------------|------------|
| Input validation | Zod schemas on all endpoints | Unit tests |
| Authentication | JWT (RS256) + refresh tokens | Penetration test |
| Authorization | RBAC middleware | Unit tests |
| Rate limiting | express-rate-limit (per-user + per-IP) | Load test |
| CORS | Whitelist-only origins | Configuration audit |
| CSP | Helmet.js with strict policy | Security headers scan |
| SQL injection prevention | Prisma ORM (parameterized) | SAST (Semgrep) |
| XSS prevention | React auto-escape, CSP, DOMPurify | DAST (ZAP) |
| CSRF protection | Double-submit cookies | Penetration test |
| Secret management | HashiCorp Vault / AWS Secrets Manager | Configuration audit |
| Audit logging | Structured JSON logs, tamper-resistant | Log review |
| Encryption at rest | PostgreSQL TDE, AES-256 | Configuration audit |
| Encryption in transit | TLS 1.3 (external), mTLS (internal) | SSL scan |
| Dependency scanning | Snyk + npm audit + OSV Scanner | CI pipeline |
| SAST | Semgrep + Bandit + CodeQL | CI pipeline |
| DAST | OWASP ZAP | Weekly scan |
| Container scanning | Trivy / Grype | CI pipeline |
| SBOM generation | CycloneDX | Per release |

---

## Review History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-06-23 | 1.0 | Security Team | Initial threat model |

---

## See Also

- [Security Policy](./SECURITY.md) — Vulnerability disclosure process
- [Architecture Reference](./ARCHITECTURE.md) — System architecture
- [Deployment Guide](./DEPLOYMENT.md) — Infrastructure hardening
- [API Specification](./API.md) — API authentication and rate limiting
- OWASP Threat Modeling Cheat Sheet
