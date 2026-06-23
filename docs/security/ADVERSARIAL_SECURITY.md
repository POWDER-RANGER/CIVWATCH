# CIVWATCH Adversarial Security Framework

> **Document Classification**: SECURITY-CRITICAL | **Review Cycle**: Monthly | **Effective Date**: 2026-06-24
> **Threat Level**: HIGH — targets powerful political and financial actors with resources to fight back

---

## 1. ADVERSARIAL THREAT MODEL

### 1.1 Threat Actor Matrix

| Actor | Motivation | Capabilities | Likelihood | Impact | Risk |
|-------|-----------|-------------|------------|--------|------|
| **Political campaigns/PACs** | Prevent damaging disclosures | Legal (SLAPP), PR, technical | **High** | High | **Critical** |
| **Lobbying firms** | Protect client influence; competitive advantage | Legal, regulatory, technical | **High** | Medium | **High** |
| **Foreign agents (FARA)** | Conceal influence operations | Legal, technical, disinformation | **Medium** | High | **High** |
| **Police unions/departments** | Protect officers from accountability | Legal, political pressure, technical | **Medium** | Medium | **Medium** |
| **State actors** | Disrupt transparency platform; protect allies | Advanced persistent threat (APT), legal coercion | **Medium** | Critical | **Critical** |
| **Corporate interests** | Protect favorable policy environment | Legal, PR, financial pressure | **Medium** | Medium | **Medium** |
| **Ideological actors** | Platform takedown for political reasons | DDoS, doxxing, swatting | **Low-Medium** | High | **Medium** |
| **Criminal actors** | Financial gain via extortion or data sale | Ransomware, data theft | **Low** | High | **Medium** |
| **Insider threats** | Ideological, financial, or coerced | System access, data access | **Low** | Critical | **High** |

### 1.2 Attack Vector Matrix

| Vector | Threat Actors | Likelihood | Impact | Risk |
|--------|--------------|------------|--------|------|
| **SLAPP lawsuits** | Political, lobbying, corporate | High | High | **Critical** |
| **DDoS / infrastructure attacks** | State, ideological, criminal | Medium | High | **High** |
| **Data poisoning** | Political, lobbying, foreign | Medium | High | **High** |
| **Compelled data modification** | State, law enforcement | Medium | Critical | **Critical** |
| **Insider data theft/modification** | Any with recruitment capability | Low | Critical | **High** |
| **Supply chain compromise** | State, advanced criminal | Low | Critical | **High** |
| **Disinformation campaign** | Political, foreign, ideological | Medium | Medium | **Medium** |
| **Regulatory harassment** | Political, lobbying, corporate | Medium | Medium | **Medium** |
| **Physical threats to staff** | Ideological, criminal | Low | Critical | **Medium** |
| **Financial pressure (funding cutoff)** | Political, corporate | Medium | Medium | **Medium** |

---

## 2. DEFENSE LAYERS

### 2.1 Layer 1: Legal Shields (Pre-Launch)

| Shield | Status | Description |
|--------|--------|-------------|
| **Anti-SLAPP jurisdiction** | ⏳ Planned | Incorporate in California or Washington |
| **Pre-retained defense counsel** | ⏳ Planned | EFF, FAC, Protect Democracy partnerships |
| **SLAPP Response Playbook** | ✅ Complete | See `SLAPP_RESPONSE_PLAYBOOK.md` |
| **501(c)(3) application** | ⏳ Planned | Non-profit status for legal protections |
| **Media liability insurance** | ⏳ Planned | E&O, D&O, cyber liability |
| **Forum selection clause** | ⏳ Planned | California courts in Terms of Service |
| **Arbitration waiver** | ⏳ Planned | Preserve right to public court proceedings |

### 2.2 Layer 2: Cryptographic Integrity

| Control | Implementation | Status |
|---------|---------------|--------|
| **OBELISK hash-chain audit** | Every data modification hashed and chained | ✅ Specified (see `OBELISK_AUDIT_CHAIN.md`) |
| **Merkle tree verification** | Public verification of any record | ✅ Specified |
| **Multi-agent consensus** | No single agent can unilaterally modify | ✅ Specified |
| **GPG-signed releases** | All code releases cryptographically signed | 🔄 In Progress |
| **Warrant canary** | Monthly signed declarations | ✅ Specified (see `WARRANT_CANARY.md`) |
| **Third-party mirrors** | Internet Archive + academic partners | ⏳ Planned |
| **Immutable backups** | S3 Glacier with object lock | 🔄 In Progress |

### 2.3 Layer 3: Infrastructure Resilience

| Control | Implementation | Status |
|---------|---------------|--------|
| **DDoS protection** | Cloudflare Enterprise / AWS Shield Advanced | ⏳ Planned |
| **Multi-region deployment** | Active-active across 3+ regions | ⏳ Planned |
| **CDN with edge caching** | Static content at edge; dynamic via API | 🔄 In Progress |
| **Rate limiting** | Per-user + per-IP; adaptive thresholds | ✅ Implemented |
| **Failover automation** | Automatic traffic rerouting | ⏳ Planned |
| **Air-gapped backups** | Weekly encrypted snapshots to offline storage | ⏳ Planned |
| **Cold wallet for crypto donations** | Hardware wallet, multi-sig | ⏳ Planned |

### 2.4 Layer 4: Operational Security

| Control | Implementation | Status |
|---------|---------------|--------|
| **No third-party analytics** | Self-hosted Plausible/Matomo | ✅ Implemented |
| **No third-party fonts/CDN** | All assets self-hosted | ✅ Implemented |
| **Minimal data retention** | 90-day log rotation; user data on request deletion | 🔄 In Progress |
| **Staff device security** | Mandatory 2FA, YubiKey, encrypted devices | ⏳ Planned |
| **Travel security** | No predictable patterns; secure communication | ⏳ Planned |
| **Dead man's switch** | Automated data release if operators unresponsive | ⏳ Planned |
| **Secure communication** | Signal for sensitive; no Slack for legal matters | ⏳ Planned |

### 2.5 Layer 5: Data Poisoning Defense

| Control | Implementation | Status |
|---------|---------------|--------|
| **FEC signature verification** | Validate official filing signatures when available | 🔄 In Progress |
| **Source cross-reference** | Cross-check across multiple independent sources | 🔄 In Progress |
| **Anomaly detection** | Statistical outlier detection on filing patterns | ✅ Implemented |
| **New source baseline** | 30-day observation period before full trust | ⏳ Planned |
| **Human review queue** | All high-confidence anomalies reviewed by staff | ✅ Implemented |
| **Source reputation scoring** | Track source accuracy over time | 🔄 In Progress |
| **Canary transactions** | Insert known-good data to detect tampering | ⏳ Planned |

---

## 3. DATA POISONING DEFENSE IN DEPTH

### 3.1 FEC Data Verification

```
┌─────────────────────────────────────────────────────────────┐
│           FEC DATA VERIFICATION PIPELINE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SOURCE: FEC API (api.open.fec.gov)                         │
│    │                                                        │
│    ▼                                                        │
│  STEP 1: API Response Signature                             │
│    ├── Check TLS certificate pinning                        │
│    ├── Verify FEC API SSL certificate chain                 │
│    └── Compare response hash with previous fetch            │
│                                                              │
│  STEP 2: Cross-Reference with Bulk Data                     │
│    ├── Download bulk data file for same period              │
│    ├── Compare record counts                                │
│    └── Flag discrepancies > 0.1%                            │
│                                                              │
│  STEP 3: Internal Consistency Checks                        │
│    ├── Aggregate amount ≥ individual amount                 │
│    ├── Date within filing period                            │
│    └── Committee ID valid in FEC registry                   │
│                                                              │
│  STEP 4: Temporal Pattern Analysis                          │
│    ├── Sudden spike detection (> 3σ)                        │
│    ├── Round-number clustering detection                    │
│    └── New contributor burst detection                      │
│                                                              │
│  STEP 5: Cross-Reference with Other Sources                 │
│    ├── ProPublica Campaign Finance (if available)           │
│    ├── OpenSecrets (if available)                           │
│    └── CRP bulk data (if available)                         │
│                                                              │
│  STEP 6: Human Review Queue                                 │
│    ├── All flags require human review                       │
│    ├── Four-eyes principle for corrections                  │
│    └── Reviewer cannot review own detections                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Lobbying Data Verification

| Check | Method | Threshold |
|-------|--------|-----------|
| XML schema validation | Senate-provided XSD | 100% compliance |
| Registrant ID validation | Cross-reference with previous filings | Must exist or be new with justification |
| Income/expense range consistency | LD-2 vs. LD-203 cross-check | < 10% variance |
| Former congressional staff | Cross-reference with LegiStorm | Flag if match found |
| FARA cross-reference | Match client to foreign principal | Flag if potential overlap |
| Filing date validation | Within statutory deadline | Flag late filings |

---

## 4. INSIDER THREAT MITIGATION

### 4.1 OBELISK Multi-Agent Governance

Per OBELISK integration: **No single person or agent can unilaterally modify data or configuration.**

| Action | Required Approvals | Implementation |
|--------|-------------------|----------------|
| **Data correction** | 2 staff + automated consensus | 2-of-3 human + 3-of-5 agent |
| **Data deletion** | Ethics Officer + 2 staff + legal | 3-of-5 human + 4-of-7 agent |
| **Configuration change** | CTO + 2 senior engineers | 2-of-3 human + 3-of-5 agent |
| **Code deployment** | CI/CD pipeline + 2 reviewers | Automated tests + human review |
| **Database migration** | DBA + CTO + backup verification | 2-of-3 human verification |
| **Access grant** | Manager + Security Officer | RBAC workflow approval |
| **Emergency action** | Incident Commander + automated | Human-in-the-loop required |

### 4.2 Access Control Matrix

| Role | Data Read | Data Write | Admin | Deploy | Legal |
|------|-----------|-----------|-------|--------|-------|
| **Viewer** | Public only | None | None | None | None |
| **Analyst** | Public + internal | None | None | None | None |
| **Senior Analyst** | All | Corrections (with review) | None | None | None |
| **Editor** | All | Corrections, redactions | Content mgmt | None | None |
| **Ethics Officer** | All | Corrections override | Ethics | None | SLAPP response |
| **Engineer** | All (for dev) | Code only | None | Staging | None |
| **Senior Engineer** | All | Code + config (with review) | Infrastructure | Production (with review) | None |
| **CTO** | All | All (with audit) | All (with audit) | All (with audit) | Incident response |
| **ED** | All | All (with audit) | All (with audit) | All (with audit) | All legal |

### 4.3 Audit Requirements

| Event | Audit Detail | Retention |
|-------|-------------|-----------|
| **All data modifications** | Who, what, when, where, why, hash | 7 years (immutable chain) |
| **All administrative actions** | Role changes, access grants, config changes | 7 years |
| **All API access** | Endpoint, parameters (hashed), response size, timestamp | 90 days |
| **Failed authentication** | Username (hashed), IP, timestamp, reason | 1 year |
| **Anomaly flag decisions** | Flag, reviewer, decision, reason | 7 years |
| **Legal holds** | Trigger, scope, custodians, status | 7 years post-resolution |

---

## 5. SURVEILLANCE RESISTANCE

### 5.1 Warrant Canary

| Component | Implementation | Frequency |
|-----------|---------------|-----------|
| **Published canary** | `/canary.txt` with GPG signature | Monthly |
| **Verification endpoint** | API endpoint for programmatic verification | Real-time |
| **Archive** | All historical canaries preserved | Permanent |
| **Third-party monitoring** | Internet Archive snapshots | Automatic |
| **Notification** | RSS/Atom feed for canary updates | Real-time |

### 5.2 Minimal Data Retention

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| **User access logs** | 90 days | Security monitoring; minimal compliance |
| **API request logs** | 90 days | Rate limiting; abuse detection |
| **Authentication logs** | 1 year | Account security; intrusion detection |
| **User account data** | Account lifetime + 90 days | Service provision |
| **Public civic data** | Permanent | Public record; transparency mission |
| **Audit chain** | Permanent | Tamper evidence; accountability |
| **Error logs** | 30 days | Debugging |

### 5.3 No Third-Party Tracking

| Service | Used? | Alternative |
|---------|-------|-------------|
| Google Analytics | **No** | Self-hosted Plausible |
| Facebook Pixel | **No** | None |
| Twitter Pixel | **No** | None |
| LinkedIn Insight | **No** | None |
| CDN analytics | **No** | Self-hosted |
| Third-party cookies | **No** | None |
| reCAPTCHA | **No** | hCaptcha or puzzle |
| Google Fonts (CDN) | **No** | Self-hosted |
| Third-party JS | **No** | Self-hosted only |

---

## 6. INCIDENT RESPONSE

### 6.1 Incident Classification

| Severity | Definition | Response Time | Examples |
|----------|-----------|---------------|----------|
| **P0 — Critical** | Platform compromise; data integrity at risk; legal emergency | 15 minutes | Data breach; successful SLAPP injunction; insider attack |
| **P1 — High** | Service degradation; security vulnerability; legal threat | 1 hour | DDoS; critical vulnerability disclosed; C&D letter |
| **P2 — Medium** | Non-critical security issue; policy violation | 4 hours | Failed login spike; anomaly detection false positive |
| **P3 — Low** | Informational; minor bug | 24 hours | Log anomaly; documentation error |

### 6.2 Response Playbook

| Phase | Timeline | Actions |
|-------|----------|---------|
| **Detection** | Ongoing | Automated monitoring; staff reporting; external notification |
| **Containment** | P0: 15min; P1: 1hr | Isolate affected systems; preserve evidence; activate incident team |
| **Eradication** | P0: 2hr; P1: 4hr | Remove threat; patch vulnerability; revoke compromised credentials |
| **Recovery** | P0: 4hr; P1: 8hr | Restore service from verified backups; verify integrity |
| **Post-Incident** | Within 72 hours | Root cause analysis; public disclosure (if required); playbook update |

### 6.3 Notification Requirements

| Stakeholder | Timeline | Method | Content |
|-------------|----------|--------|---------|
| **Internal team** | Immediate | Signal | Incident classification; initial assessment |
| **Board** | P0: 1hr; P1: 4hr | Secure email | Classification; impact; response status |
| **Legal counsel** | P0: 1hr; P1: 4hr | Secure email | Legal implications; preservation requirements |
| **Partner organizations** | P0: 4hr; P1: 24hr | Secure email | Impact on partnerships; coordination needs |
| **Users (if data breach)** | Within 72 hours | Email + website | Scope; impact; remediation steps |
| **Public (if required)** | Within 72 hours | Blog + social | Transparent disclosure; learnings |
| **Regulators (if required)** | Per statute | Formal notice | Per legal counsel guidance |

---

## 7. SECURITY METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Platform uptime** | 99.9% | Monitoring |
| **Mean time to detect (MTTD)** | < 15 minutes | Incident logs |
| **Mean time to respond (MTTR)** | P0: < 1 hour | Incident logs |
| **SLAPP response time** | < 2 hours | Response log |
| **DDoS mitigation time** | < 5 minutes | Attack logs |
| **False positive rate (anomaly detection)** | < 5% | Human review feedback |
| **Data integrity incidents** | 0 per quarter | Audit chain verification |
| **Security training completion** | 100% staff | Training records |
| **Penetration test findings (critical)** | 0 | Annual pentest |
| **Vulnerability patch time (critical)** | < 24 hours | Patch management log |

---

## 8. COMPLIANCE CHECKLIST

| # | Requirement | Status | Target Date |
|---|-------------|--------|-------------|
| 1 | Anti-SLAPP jurisdiction established | ⏳ Planned | 2026-07-01 |
| 2 | Pre-retained defense counsel | ⏳ Planned | 2026-07-15 |
| 3 | OBELISK audit chain implemented | 🔄 In Progress | 2026-07-15 |
| 4 | Multi-agent consensus operational | 🔄 In Progress | 2026-07-15 |
| 5 | Warrant canary published | 🔄 In Progress | 2026-07-01 |
| 6 | DDoS protection activated | ⏳ Planned | 2026-07-15 |
| 7 | Multi-region deployment | ⏳ Planned | 2026-08-01 |
| 8 | Air-gapped backup system | ⏳ Planned | 2026-07-15 |
| 9 | Staff security training | ⏳ Planned | 2026-08-01 |
| 10 | Third-party security audit | ⏳ Planned | 2026-09-01 |
| 11 | Incident response tabletop exercise | ⏳ Planned | 2026-07-15 |
| 12 | Dead man's switch configured | ⏳ Planned | 2026-08-01 |
| 13 | Insurance (E&O, D&O, cyber) | ⏳ Planned | 2026-07-15 |
| 14 | Penetration test completed | ⏳ Planned | 2026-09-01 |
| 15 | Supply chain security audit | ⏳ Planned | 2026-10-01 |

---

## 9. REFERENCES

- [CISA Supply Chain Security](https://www.cisa.gov/supply-chain-security)
- [Cloudflare DDoS Protection](https://www.cloudflare.com/ddos/)
- [EFF Warrant Canary FAQ](https://www.eff.org/deeplinks/2014/04/warrant-canary-faq)
- [Protect Democracy](https://protectdemocracy.org/)
- [NIST SP 800-53 Rev. 5 — Security Controls](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Credibility Coalition](https://credibilitycoalition.org/)
- [Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/)

---

*This adversarial security framework is a living document. Monthly review cycles ensure it evolves with the threat landscape.*

*Last Updated: 2026-06-24 | Next Review: 2026-07-24 | Classification: SECURITY-CRITICAL*
