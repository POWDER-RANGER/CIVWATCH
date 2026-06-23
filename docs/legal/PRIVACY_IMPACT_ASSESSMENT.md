# CIVWATCH Privacy Impact Assessment (PIA)

> **Document Classification**: PRIVACY-CORE | **Review Cycle**: Quarterly | **Effective Date**: 2026-06-24
> **Framework**: NIST Privacy Framework v1.0 | **Authority**: 5 U.S.C. § 552a (Privacy Act) | GDPR reference (best practice)

---

## 1. ASSESSMENT OVERVIEW

| Attribute | Detail |
|-----------|--------|
| **System Name** | CIVWATCH Civic Transparency Platform |
| **Assessment Date** | 2026-06-24 |
| **Assessor** | CIVWATCH Privacy Officer + External Counsel |
| **Framework** | NIST Privacy Framework v1.0 |
| **Risk Assessment Level** | **HIGH** — handles political donor data, law enforcement records, and public figure information |
| **Next Review** | 2026-09-24 |

---

## 2. DATA INVENTORY

### 2.1 Data Categories

| Category | Description | Source | Classification | Volume (est.) |
|----------|-------------|--------|---------------|---------------|
| **Campaign Finance Data** | Contributions, expenditures, committee info | FEC API | Public record | 100M+ records |
| **Individual Donor Information** | Name, city, state, employer, occupation, amount | FEC API | Public record (but sensitive in aggregation) | 50M+ individuals |
| **Lobbying Disclosures** | LD-2/LD-203 filings, issue areas, spending | Senate/House | Public record | 2M+ filings |
| **FARA Registrations** | Foreign agent registrations, contacts, activities | DOJ FARA | Public record | 10K+ registrations |
| **Congressional Voting Records** | Roll call votes, bill cosponsorship | Congress.gov, ProPublica | Public record | 50K+ votes |
| **Stock Trading Disclosures** | PTRs, annual disclosures | House/Senate Clerk | Public record | 10K+ filings/year |
| **Body Camera Policies** | Department policies, procedures | FOIA requests | Public record | 18,000+ departments |
| **Police Misconduct Records** | Complaints, disciplinary actions, use-of-force | Public records, court docs | Public record (varies by state) | 500K+ records |
| **Campaign Promises** | Candidate statements, policy positions | Debates, websites, press | Public record | 100K+ promises |
| **User Account Data** | Email, password hash, role, preferences | Direct collection | Internal | < 10,000 users (est.) |
| **API Access Logs** | IP address, timestamp, endpoint, response size | System-generated | Internal | 1M+ entries/day |
| **Audit Logs** | User actions, data modifications | System-generated | Confidential | 100K+ entries/day |

### 2.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CIVWATCH DATA FLOWS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EXTERNAL SOURCES                    CIVWATCH PLATFORM                      │
│  ┌──────────────┐                   ┌──────────────────┐                    │
│  │ FEC API      │──────HTTPS───────►│                  │                    │
│  │ (public)     │                   │   INGESTION      │──► Sanitize        │
│  └──────────────┘                   │   PIPELINE       │──► Validate       │
│  ┌──────────────┐                   │                  │──► Redact          │
│  │ Senate LD-2  │──────HTTPS───────►│   • Normalize    │──► Enrich         │
│  │ (public)     │                   │   • Aggregate    │                    │
│  └──────────────┘                   │   • Hash-chain   │                    │
│  ┌──────────────┐                   │     audit        │                    │
│  │ FARA eFile   │──────HTTPS───────►│                  │                    │
│  │ (public)     │                   └────────┬─────────┘                    │
│  └──────────────┘                            │                              │
│  ┌──────────────┐                            ▼                              │
│  │ FOIA Responses│──────Upload──────►┌──────────────────┐                    │
│  │ (public)     │                   │   DATA STORES     │                    │
│  └──────────────┘                   │                  │                    │
│  ┌──────────────┐                   │   PostgreSQL     │──► Encrypted at rest│
│  │ User Signup  │──────HTTPS───────►│   (primary)      │                    │
│  │ (direct)     │                   │                  │                    │
│  └──────────────┘                   │   Redis          │──► Encrypted, TTL  │
│                                     │   (cache/queue)  │                    │
│                                     │                  │                    │
│                                     │   Object Store   │──► Encrypted, IAM  │
│                                     │   (S3/MinIO)     │                    │
│                                     └────────┬─────────┘                    │
│                                              │                              │
│                                              ▼                              │
│                                     ┌──────────────────┐                    │
│  PUBLIC CONSUMPTION                 │   API / DASHBOARD │                   │
│  ┌──────────────┐                   │                  │                    │
│  │ Journalists  │◄─────HTTPS──────│   • Rate limited  │                    │
│  │ Researchers  │                   │   • Authenticated │                    │
│  │ Citizens     │                   │   • Audit logged  │                    │
│  └──────────────┘                   │   • Aggregated    │                    │
│                                      └──────────────────┘                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PRIVACY RISK ASSESSMENT (NIST FRAMEWORK)

### 3.1 Identify-P (Identify Privacy Risks)

| Risk ID | Description | Likelihood | Impact | Risk Level |
|---------|-------------|-----------|--------|-----------|
| **PRIV-001** | Re-identification of small-dollar donors through aggregation with commercial datasets | Medium | High | **HIGH** |
| **PRIV-002** | Geolocation inference from donor city + employer data | Medium | Medium | **MEDIUM** |
| **PRIV-003** | Pattern analysis revealing political associations of private citizens | Medium | High | **HIGH** |
| **PRIV-004** | Retaliation against donors by employers or government entities | Low | Critical | **HIGH** |
| **PRIV-005** | Doxxing of individuals through body camera footage | Low | Critical | **HIGH** |
| **PRIV-006** | Unauthorized access to user account data | Low | High | **MEDIUM** |
| **PRIV-007** | Data breach exposing all historical data | Low | Critical | **HIGH** |
| **PRIV-008** | Third-party analytics tracking users | Low | Medium | **LOW** |
| **PRIV-009** | Subpoena of user access logs (chilling effect) | Medium | High | **HIGH** |
| **PRIV-010** | Inference of sensitive attributes from political donation patterns | Medium | Medium | **MEDIUM** |

### 3.2 Govern-P (Govern Privacy Risk Management)

| Control | Implementation | Status |
|---------|---------------|--------|
| **Privacy Officer appointment** | Full-time Privacy Officer, reports to Ethics Committee | ✅ Implemented |
| **Privacy by Design** | Privacy requirements in all system design documents | 🔄 In Progress |
| **Data minimization policy** | Collection limited to mission-necessary data | ✅ Implemented |
| **Retention schedule** | Documented retention periods by data category | 🔄 In Progress |
| **Third-party sharing policy** | No sale of data; limited sharing with academic partners under MOU | ✅ Implemented |
| **User consent framework** | Granular consent for account data; no consent required for public records | ✅ Implemented |
| **Privacy training** | Annual training for all staff | ⏳ Planned |
| **Privacy impact threshold** | PIA required for all new data sources | ✅ Implemented |

### 3.3 Control-P (Control Privacy Risks)

| Risk | Control | Implementation | Effectiveness |
|------|---------|---------------|---------------|
| **PRIV-001** | Aggregation thresholds | Donors <$200 aggregated; 1-5 donors in geography suppressed | High |
| **PRIV-001** | Differential privacy | Laplace noise (ε=1.0) added to aggregate queries | Medium-High |
| **PRIV-002** | Geolocation scrubbing | Precise addresses removed; city/state only for $200+ donors | High |
| **PRIV-003** | Query logging | All bulk queries logged; anomaly detection on suspicious patterns | Medium |
| **PRIV-004** | Donor protection program | Rapid response to reported retaliation; legal referral network | Medium |
| **PRIV-005** | Automated redaction | Face detection + manual review for BWC content | High |
| **PRIV-006** | Encryption + access control | AES-256-GCM at rest, TLS 1.3 in transit, RBAC | High |
| **PRIV-007** | Defense in depth | See THREAT_MODEL.md; incident response plan | Medium |
| **PRIV-008** | No third-party analytics | Self-hosted analytics only (Plausible/Matomo) | High |
| **PRIV-009** | Warrant canary | Monthly warrant canary; minimal log retention (90 days) | Medium |
| **PRIV-010** | Research ethics review | Academic IRB review for sensitive pattern research | Medium |

### 3.4 Communicate-P (Communicate Privacy Risks)

| Mechanism | Frequency | Audience |
|-----------|-----------|----------|
| Privacy policy (website) | Updated as needed | All users |
| This PIA document | Quarterly review | Regulators, partners, public |
| Transparency report | Quarterly | Public |
| User notifications | Within 72 hours of discovery | Affected users |
| Regulatory notification | As required by law | Relevant authorities |

---

## 4. GEOLOCATION SCRUBBING PROTOCOL

### 4.1 Donor Location Data Handling

| Donation Amount | Location Granularity | Additional Processing |
|----------------|---------------------|----------------------|
| **$0 - $199** | State only | Immediate aggregation; individual records purged after aggregation |
| **$200 - $999** | City, State | Store city/state; suppress if < 5 donors in city |
| **$1,000 - $4,999** | City, State | Store city/state; always displayed (public record) |
| **$5,000+** | City, State + ZIP (first 3 digits) | Store with scrubbing; display city/state only |
| **$100,000+** | City, State | Full public record; additional verification |

### 4.2 Employer Data Handling

| Employer Type | Display | Notes |
|--------------|---------|-------|
| **Self-employed** | "Self-employed" | Never display home address |
| **Retired** | "Retired" | No additional info |
| **Unemployed** | "Not employed" | No additional info |
| **Government agency** | Agency name (public record) | No unit/office detail |
| **Private corporation** | Corporate name (public record) | No department/location detail |
| **Non-profit** | Organization name (public record) | No program/location detail |

### 4.3 Geolocation Scrubbing Implementation

```python
# CIVWATCH Geolocation Scrubbing Pseudocode

def scrub_donor_geolocation(donor_record):
    """
    Apply geolocation scrubbing based on donation amount and aggregation thresholds.
    """
    amount = donor_record['contribution_amount']
    city = donor_record['contributor_city']
    state = donor_record['contributor_state']
    zip_code = donor_record['contributor_zip']
    
    # Tier 1: Small donors — aggregate immediately
    if amount < 200:
        return {
            'state': state,
            'amount_bucket': get_amount_bucket(amount),
            'count': 1
        }
    
    # Tier 2: Medium donors — check aggregation threshold
    if amount < 1000:
        donor_count = count_donors_in_city(city, state)
        if donor_count < 5:
            # Suppress city, aggregate at state level
            return {
                'state': state,
                'amount_bucket': get_amount_bucket(amount),
                'count': 1
            }
        return {
            'city': city,
            'state': state,
            'amount': amount,
            'employer': scrub_employer(donor_record['contributor_employer'])
        }
    
    # Tier 3: Large donors — public record, minimal scrubbing
    return {
        'city': city,
        'state': state,
        'zip_3digit': zip_code[:3] if amount >= 5000 else None,
        'amount': amount,
        'employer': donor_record['contributor_employer'],
        'occupation': donor_record['contributor_occupation']
    }

def apply_differential_privacy(aggregate_query, epsilon=1.0):
    """
    Add Laplace noise to aggregate queries for differential privacy.
    """
    sensitivity = 1  # Adding/removing one donor changes count by 1
    noise = np.random.laplace(0, sensitivity / epsilon)
    return max(0, aggregate_query + noise)  # Ensure non-negative
```

---

## 5. DIFFERENTIAL PRIVACY IMPLEMENTATION

### 5.1 Privacy Budget

| Query Type | Epsilon (ε) per Query | Daily Budget | Rationale |
|-----------|----------------------|-------------|-----------|
| **Count queries** | 0.1 | 1.0 | Low sensitivity; high utility |
| **Sum queries** | 0.5 | 2.0 | Medium sensitivity; clipped at 99th percentile |
| **Mean queries** | 0.3 | 1.5 | Derived from sum + count |
| **Complex analytics** | 1.0 | 5.0 | Higher sensitivity; strict access control |

### 5.2 Privacy Budget Management

```python
# Privacy Budget Manager Pseudocode

class PrivacyBudgetManager:
    def __init__(self, daily_budget=10.0):
        self.daily_budget = daily_budget
        self.consumed = 0.0
        self.reset_time = datetime.now() + timedelta(days=1)
    
    def consume(self, epsilon):
        if self.consumed + epsilon > self.daily_budget:
            raise PrivacyBudgetExceeded(
                f"Daily privacy budget exhausted. "
                f"Consumed: {self.consumed}, Requested: {epsilon}, "
                f"Budget: {self.daily_budget}"
            )
        self.consumed += epsilon
        return True
    
    def reset(self):
        if datetime.now() >= self.reset_time:
            self.consumed = 0.0
            self.reset_time = datetime.now() + timedelta(days=1)
```

---

## 6. USER DATA PROTECTION

### 6.1 Account Data

| Data Field | Purpose | Storage | Retention |
|-----------|---------|---------|-----------|
| **Email address** | Authentication, notifications | Hashed index, encrypted value | Account lifetime + 90 days |
| **Password** | Authentication | bcrypt (cost factor 12) | Updated on change; never logged |
| **Role** | Authorization | Plaintext in DB | Account lifetime |
| **API key** | Programmatic access | Hashed in DB; plaintext shown once | Until rotation or revocation |
| **Preferences** | User experience | Encrypted JSON | Account lifetime |
| **Access logs** | Security audit | Rotated 90 days | 90 days |

### 6.2 User Rights

| Right | Implementation | Timeline |
|-------|---------------|----------|
| **Access** | Self-service data export | Immediate |
| **Correction** | Self-service profile edit | Immediate |
| **Deletion** | Self-service account deletion | 30 days (verification period) |
| **Portability** | JSON/CSV export | Immediate |
| **Restriction** | Account suspension option | Immediate |
| **Objection** | Email to privacy@civwatch.io | 30 days response |

### 6.3 No Third-Party Tracking

| Service | Used? | Alternative |
|---------|-------|-------------|
| Google Analytics | **No** | Self-hosted Plausible |
| Mixpanel | **No** | Self-hosted Matomo |
| Facebook Pixel | **No** | None |
| Google Fonts (CDN) | **No** | Self-hosted fonts |
| CDN (Cloudflare) | Optional | Self-hosted if privacy-sensitive |
| reCAPTCHA | **No** | hCaptcha or self-hosted alternative |

---

## 7. LAW ENFORCEMENT REQUEST HANDLING

### 7.1 Request Types

| Request Type | Response |
|-------------|----------|
| **Subpoena** | Review with legal counsel; comply only if legally required; notify user if not prohibited |
| **Search warrant** | Require valid warrant signed by judge; comply with specific scope only |
| **National security letter** | Consult EFF legal team; challenge if overly broad |
| **Informal request** | Decline; require formal legal process |
| **International request** | Decline unless treaty-based with U.S. court approval |

### 7.2 Response Protocol

```
┌─────────────────────────────────────────────────────────────┐
│           LAW ENFORCEMENT REQUEST RESPONSE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. RECEIPT                                                │
│     ├── Log receipt timestamp (not content)                │
│     ├── Notify Privacy Officer + General Counsel           │
│     └── Acknowledge receipt within 24 hours                │
│                                                              │
│  2. REVIEW                                                  │
│     ├── Verify legal validity (proper jurisdiction, scope) │
│     ├── Assess scope — is it overbroad?                    │
│     ├── Determine if notification to user is prohibited    │
│     └── Consult EFF if novel or concerning                 │
│                                                              │
│  3. RESPONSE                                                │
│     ├── Comply with valid, scoped request                  │
│     ├── Challenge overbroad requests (move to quash)       │
│     └── Publish aggregate statistics in transparency report │
│                                                              │
│  4. POST-RESPONSE                                          │
│     ├── Notify user (if not prohibited)                    │
│     ├── Update warrant canary                              │
│     └── Document in quarterly transparency report          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Warrant Canary

CIVWATCH maintains a cryptographically signed warrant canary at `/canary.txt`:

```
-----BEGIN WARRANT CANARY-----
CIVWATCH Civic Transparency Platform
Canary ID: CIVW-CANARY-2026-001
Date: 2026-06-24
Valid Until: 2026-07-24

Declarations:
1. CIVWATCH has not received any national security letters.
2. CIVWATCH has not received any FISA court orders.
3. CIVWATCH has not been subject to any gag orders.
4. No government has requested installation of surveillance equipment.
5. No government has requested access to encryption keys.

This canary is signed with CIVWATCH's GPG key (0xCIVWATCH2026).
It will be updated monthly. Absence of an update indicates
potential compromise.

Signature:
[PGP SIGNATURE]
-----END WARRANT CANARY-----
```

---

## 8. DATA RETENTION SCHEDULE

| Data Category | Retention Period | Justification | Destruction Method |
|--------------|-----------------|---------------|-------------------|
| **Raw FEC data** | Permanent | Public record; research value | N/A |
| **Aggregated donor data** | Permanent | Public transparency | N/A |
| **Individual donor records (< $200)** | 6 years (FEC requirement) | Legal compliance | Cryptographic erasure |
| **User account data** | Account lifetime + 90 days | Service provision | Secure deletion |
| **API access logs** | 90 days | Security monitoring | Automated purge |
| **Audit logs** | 7 years (legal requirement) | Accountability | Archive to cold storage |
| **Error logs** | 30 days | Debugging | Automated purge |
| **Backup data** | 30 days (rolling) | Disaster recovery | Cryptographic erasure |
| **FOIA request records** | 7 years | Legal compliance | Secure deletion |
| **Body camera policy docs** | Permanent | Public transparency | N/A |

---

## 9. PRIVACY COMPLIANCE CHECKLIST

| # | Requirement | Status | Review Date | Owner |
|---|-------------|--------|-------------|-------|
| 1 | Privacy Officer appointed | ✅ Complete | 2026-06-24 | Legal |
| 2 | This PIA completed | ✅ Complete | 2026-06-24 | Privacy Officer |
| 3 | Privacy policy published | 🔄 In Progress | 2026-07-01 | Privacy Officer |
| 4 | Geolocation scrubbing implemented | 🔄 In Progress | 2026-07-15 | Engineering |
| 5 | Differential privacy for aggregate queries | 🔄 In Progress | 2026-07-15 | Engineering |
| 6 | Aggregation thresholds enforced | 🔄 In Progress | 2026-07-15 | Engineering |
| 7 | User data deletion process | 🔄 In Progress | 2026-07-01 | Engineering |
| 8 | Warrant canary operational | ⏳ Planned | 2026-07-15 | Security |
| 9 | Privacy training for staff | ⏳ Planned | 2026-08-01 | HR/Legal |
| 10 | Third-party privacy audit | ⏳ Planned | 2026-09-01 | Privacy Officer |
| 11 | State privacy law compliance (CCPA, etc.) | ⏳ Planned | 2026-07-15 | Legal |
| 12 | Data processing agreement (academic partners) | ⏳ Planned | 2026-07-15 | Legal |

---

## 10. REFERENCES

- [NIST Privacy Framework v1.0](https://www.nist.gov/privacy-framework)
- [5 U.S.C. § 552a — Privacy Act of 1974](https://www.govinfo.gov/app/details/USCODE-2011-title5/USCODE-2011-title5-partI-chap5-subchapII-sec552a)
- [GDPR (EU 2016/679)](https://gdpr.eu/) — Reference for best practices
- [EFF Privacy Guide for Civic Data](https://www.eff.org/issues/transparency)
- [Sunlight Foundation Open Data Guidelines](https://sunlightfoundation.com/policy/open-data/)
- [CCPA/CPRA](https://cppa.ca.gov/) — California Consumer Privacy Act
- [State Privacy Law Tracker](https://iapp.org/resources/article/state-privacy-legislation-tracker/)

---

*This Privacy Impact Assessment is a living document. All changes require Privacy Officer approval and are logged in the version history.*

*Last Updated: 2026-06-24 | Next Review: 2026-09-24*
