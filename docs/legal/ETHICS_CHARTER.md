# CIVWATCH Ethics Charter

> **Document Classification**: ETHICS-CORE | **Review Cycle**: Quarterly | **Effective Date**: 2026-06-24
> **Standards**: Sunlight Foundation Open Data Ethics | NIST AI Ethics Framework | Journalist Code of Ethics

---

## 1. NON-PARTISAN PLEDGE

### 1.1 Core Principle

**CIVWATCH is strictly non-partisan.** We monitor, analyze, and publish data on all political actors, institutions, and processes without regard to:
- Political party affiliation
- Ideological position
- Incumbency status
- Power or influence level
- Relationship to CIVWATCH staff or partners

### 1.2 Non-Partisanship Framework

| Standard | Implementation | Verification |
|----------|---------------|------------|
| Equal scrutiny | Same anomaly detection applied to all politicians | Statistical parity audit |
| Equal access | All data available to all users without preference | API access logs review |
| Equal publication | No suppression based on political identity | Editorial decision log |
| Equal timing | No coordinated release with political campaigns | Release timing analysis |
| Transparent methodology | All algorithms and scoring systems published | Public code review |

### 1.3 Prohibited Activities

The following are **strictly prohibited** for all CIVWATCH staff, contractors, and contributors:

| Prohibition | Rationale | Enforcement |
|------------|-----------|-------------|
| Coordinating releases with political campaigns | Maintains independence | Immediate termination, public disclosure |
| Accepting funding from political campaigns/parties | Prevents capture | Funding transparency, recusal rules |
| Personal political activity using CIVWATCH data or brand | Separates personal/professional | Ethics committee review |
| Selective data publication favoring one side | Prevents bias | Algorithmic audit, random sampling |
| Allowing personal political views to influence analysis | Objectivity requirement | Peer review, multi-party sign-off |
| Accepting gifts from monitored entities | Prevents corruption | Gift policy, disclosure requirements |

### 1.4 Political Activity Policy for Staff

CIVWATCH staff retain their First Amendment rights to personal political expression. However:
- Personal political activity **must not** reference CIVWATCH or use CIVWATCH data
- Staff in analytical roles **must disclose** personal political contributions (> $200) to the Ethics Committee
- Staff **may not** engage in partisan political activity (campaign work, fundraising) for entities they monitor
- Public-facing staff **must recuse** from analysis involving candidates/causes they personally support

---

## 2. DATA HANDLING ETHICS

### 2.1 Data Minimization Principle

We collect and retain **only** the minimum data necessary to fulfill our civic transparency mission.

| Data Category | Collection | Retention | Deletion |
|--------------|-----------|-----------|----------|
| **Public campaign finance data** | From FEC API (public) | Permanent (public record) | Never (public record) |
| **Public lobbying disclosures** | From Senate/House (public) | Permanent (public record) | Never (public record) |
| **Public voting records** | From Congress.gov (public) | Permanent (public record) | Never (public record) |
| **Public body camera policies** | From FOIA requests (public) | Permanent (public record) | Never (public record) |
| **Individual donor names** | From FEC (public) | As required by law | Aggregate after 6 years |
| **Small-dollar donor addresses** | From FEC (public, but sensitive) | Scrub geolocation immediately | Hash/aggregate immediately |
| **Personal phone numbers** | Never collected | N/A | N/A |
| **Social Security Numbers** | Never collected | N/A | N/A |
| **Private citizen data (non-donor)** | Never collected | N/A | N/A |
| **User account data** | Minimal (email, role) | Account lifetime + 90 days | Secure deletion on request |
| **API access logs** | IP, timestamp, endpoint | 90 days | Automated purge |

### 2.2 Aggregation Thresholds (Anti-Doxxing)

To prevent doxxing of small-dollar donors while maintaining transparency:

| Threshold | Application | Rationale |
|-----------|------------|-----------|
| **$200+ individual contributions** | Display with name, city, state, employer, occupation | FEC reporting threshold |
| **Under $200 individual contributions** | Aggregate only (count, total, date range) | Privacy protection for small donors |
| **1-5 donors in a geography** | Suppress location detail; aggregate to county or state | Prevents re-identification |
| **Non-campaign finance data** | Aggregate to prevent individual identification | General privacy protection |
| **Body camera footage** | Redact civilian faces, minors, victims per policy | Victim protection |
| **Police misconduct records** | Verify through court records before publication | Prevent false accusations |

### 2.3 Redaction Policy

All published data undergoes systematic redaction review:

```
┌─────────────────────────────────────────────────────────────┐
│              REDACTION REVIEW PIPELINE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  STEP 1: AUTOMATED REDACTION                                │
│  ├── PII pattern detection (SSN, phone, email regex)       │
│  ├── Address geocoding → aggregation threshold check       │
│  ├── Face detection for BWC footage (auto-blur civilians)  │
│  └── Minor age detection (auto-redact juvenile records)    │
│                                                              │
│  STEP 2: MANUAL REVIEW                                      │
│  ├── Human review of edge cases                             │
│  ├── Contextual assessment (active investigations, etc.)   │
│  └── Override authority (senior editors only)              │
│                                                              │
│  STEP 3: PUBLICATION GATE                                   │
│  ├── Automated PII scan on final output                    │
│  ├── "Four eyes" principle: two-person sign-off            │
│  └── 24-hour cooling-off period for sensitive content      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. ALGORITHMIC ETHICS

### 3.1 Anomaly Detection Fairness

Our anomaly detection systems are audited for fairness across political dimensions:

| Audit Dimension | Method | Frequency | Target |
|----------------|--------|-----------|--------|
| Party parity | False positive rate by party | Monthly | < 5% variance |
| Incumbent/challenger parity | Alert rate by office status | Monthly | < 5% variance |
| Geographic parity | Coverage by state/district | Monthly | 100% coverage |
| Temporal parity | No release timing bias | Per release | Uniform distribution |
| Racial/gender proxy parity | Audit for proxy discrimination | Quarterly | No disparate impact |

### 3.2 Confidence Scoring Transparency

All CIVWATCH analyses include clear confidence indicators:

| Confidence Level | Meaning | Presentation |
|-----------------|---------|-------------|
| **Verified** | Primary source confirmed, multiple corroboration | Green checkmark, "Verified" |
| **Likely** | Primary source confirmed, single corroboration | Yellow indicator, "Likely" |
| **Unconfirmed** | Single source, no corroboration | Orange indicator, "Unconfirmed" |
| **Disputed** | Contradictory sources or official denial | Red indicator, "Disputed" |
| **Erroneous** | Identified as incorrect post-publication | Strikethrough, correction noted |

### 3.3 Correction Policy

| Error Type | Timeline | Process |
|-----------|----------|---------|
| **Factual error** | Within 24 hours of discovery | Correction published, original annotated |
| **Methodology error** | Within 72 hours | Analysis re-run, correction published, methodology updated |
| **Source data error** | Upon source correction | Re-analysis, correction published |
| **Interpretation error** | Within 7 days | Clarification published, analysis expanded |

---

## 4. FUNDING TRANSPARENCY

### 4.1 Funding Sources

CIVWATCH funding is published quarterly in `TRANSPARENCY_REPORT.md`:

| Source Type | Accepted? | Disclosure Level |
|------------|-----------|-----------------|
| Individual donations (< $5,000) | Yes | Aggregate only (count, total) |
| Individual donations (≥ $5,000) | Yes | Name, amount, date (published) |
| Foundation grants | Yes | Organization name, amount, purpose (published) |
| Corporate donations | No | N/A — policy prohibition |
| Political campaign donations | No | N/A — policy prohibition |
| Political party donations | No | N/A — policy prohibition |
| Government grants | Case-by-case | Full disclosure if accepted; recusal rules apply |
| Program-related investments | Yes | Terms disclosed |

### 4.2 Conflict of Interest

| Situation | Action Required |
|-----------|----------------|
| Funder is monitored by CIVWATCH | Full recusal; data handled by independent team |
| Funder lobbies on issues CIVWATCH tracks | Disclosure; firewall between funding and analysis |
| Staff has personal financial interest in monitored entity | Recusal; disclosure to Ethics Committee |
| Board member is former politician | Cooling-off period (2 years); recusal from related analysis |
| Board member is current lobbyist | Prohibited |

---

## 5. BODY CAMERA ETHICS

### 5.1 Victim Protection

| Scenario | Action |
|----------|--------|
| Footage shows domestic violence victim | Redact victim; publish policy analysis only |
| Footage shows sexual assault victim | Redact victim; publish policy compliance only |
| Footage shows minor | Redact minor; comply with state juvenile laws |
| Footage shows deceased individual | Family notification period (30 days) before publication |
| Footage shows officer injury | No special treatment — officer is public employee |

### 5.2 Officer Fairness

| Principle | Implementation |
|-----------|---------------|
| Presumption of innocence | CIVWATCH publishes policy compliance, not guilt |
| Due process | Wait for administrative/court proceedings before analysis |
| Context | Include department policy context, not just footage |
| Proportionality | Severity of analysis matches severity of alleged violation |
| Right to respond | Officers/departments may submit response for publication |

---

## 6. CAMPAIGN PROMISE ETHICS

### 6.1 Promise Tracking Standards

| Standard | Implementation |
|----------|---------------|
| **Verbatim sourcing** | Promise text quoted from primary source (debate transcript, policy paper, official statement) |
| **Date and context** | Full context of promise provided |
| **Status evidence** | Each status change (Kept/Broken/In Progress) requires documented evidence |
| **Multiple reviewers** | Status changes require two independent reviewers |
| **Candidate response** | Candidates may submit evidence of promise fulfillment |
| **Correction process** | Erroneous tracking corrected within 72 hours |

### 6.2 Promise Status Definitions

| Status | Definition | Evidence Required |
|--------|-----------|-------------------|
| **Kept** | Promise fully implemented as stated | Legislative text, executive order, documented action |
| **Compromised** | Promise partially implemented or modified | Legislative text showing partial implementation |
| **In Progress** | Active effort toward implementation | Bill introduced, executive action initiated |
| **Broken** | Promise abandoned or actively contradicted | Statement of abandonment, veto, contradictory action |
| **Not Yet Rated** | Promise made, insufficient time to assess | Date of promise, expected timeline |

---

## 7. ETHICS GOVERNANCE

### 7.1 Ethics Committee Structure

```
┌─────────────────────────────────────────────────────────────┐
│              CIVWATCH ETHICS GOVERNANCE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ETHICS COMMITTEE                                           │
│  ├── Chair: Independent external expert (3-year term)      │
│  ├── Members:                                               │
│  │   ├── 1 x Journalist ethicist                            │
│  │   ├── 1 x Legal scholar (First Amendment)               │
│  │   ├── 1 x Data scientist (algorithmic fairness)         │
│  │   ├── 1 x Community representative                       │
│  │   └── 1 x Former government official (bipartisan)       │
│  ├── Meetings: Quarterly + emergency sessions              │
│  └── Authority: Can halt publication, mandate corrections  │
│                                                              │
│  INTERNAL ETHICS OFFICER                                    │
│  ├── Full-time role                                         │
│  ├── Reports to Ethics Committee (dotted line to ED)       │
│  ├── Reviews all publications before release               │
│  └── Investigates complaints                               │
│                                                              │
│  WHISTLEBLOWER CHANNEL                                      │
│  ├── Encrypted: ethics@civwatch.io (PGP key published)     │
│  ├── Anonymous submission: SecureDrop instance             │
│  └── No retaliation: Explicit policy, board-level oversight │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Ethics Review Triggers

| Trigger | Review Process | Timeline |
|---------|---------------|----------|
| New data source integration | Ethics review of source legality, privacy implications | Before integration |
| New analysis methodology | Fairness audit, bias testing | Before deployment |
| External ethics complaint | Investigation by Ethics Committee | 14 days |
| Staff ethics concern | Internal review + Ethics Committee | 7 days |
| Publication of sensitive data | Mandatory pre-publication review | 48 hours |
| Funding source change | Conflict of interest review | Before acceptance |
| Algorithmic bias alert | Immediate review, potential rollback | 24 hours |

---

## 8. EXTERNAL ACCOUNTABILITY

### 8.1 Third-Party Audits

| Audit Type | Frequency | Auditor |
|-----------|-----------|---------|
| **Algorithmic fairness audit** | Annual | Independent academic institution |
| **Funding audit** | Annual | CPA firm (published) |
| **Security audit** | Annual | Third-party penetration testing firm |
| **Legal compliance audit** | Annual | External legal counsel |
| **Ethics charter compliance** | Annual | Ethics Committee + external review |

### 8.2 Public Accountability Mechanisms

| Mechanism | Description |
|-----------|-------------|
| **Quarterly transparency reports** | Published on website, includes all governance metrics |
| **Annual report** | Comprehensive: financials, operations, impact, ethics compliance |
| **Open board meetings** | Quarterly, public attendance (virtual) |
| **Public comment period** | 30-day comment on major policy changes |
| **Academic advisory board** | Peer review of methodologies |
| **Ombudsman** | Independent public advocate for user concerns |

---

## 9. ACKNOWLEDGMENT REQUIREMENT

All CIVWATCH staff, contractors, and significant contributors must sign the following acknowledgment annually:

---

**CIVWATCH ETHICS CHARTER ACKNOWLEDGMENT**

I, _________________________ , acknowledge that I have read, understood, and agree to comply with the CIVWATCH Ethics Charter. I understand that:

1. CIVWATCH is strictly non-partisan and I must not allow personal political views to influence my work.
2. I must protect the privacy of individuals, especially small-dollar donors and vulnerable persons in body camera footage.
3. I must report any ethics concerns through the designated channels without fear of retaliation.
4. Violations of this charter may result in termination and public disclosure.
5. I will prioritize truth, accuracy, and fairness in all data handling and analysis.

Signed: _________________________ Date: ___________

---

*This Ethics Charter is a living document. All substantive changes require Ethics Committee approval and 30-day public comment period.*

*Last Updated: 2026-06-24 | Next Review: 2026-09-24*
