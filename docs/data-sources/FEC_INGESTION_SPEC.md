# CIVWATCH FEC Data Ingestion Specification

> **Source**: Federal Election Commission (FEC) API | `api.open.fec.gov`
> **Data Type**: Campaign finance — contributions, expenditures, committees, candidates
> **Update Frequency**: Real-time (API) + Nightly (bulk)
> **Ingestion Type**: PULL (API polling) + PUSH (bulk downloads)

---

## 1. SOURCE OVERVIEW

### 1.1 API Endpoints

| Endpoint | Description | Rate Limit | Priority |
|----------|-------------|-----------|----------|
| `/v1/candidates/` | Candidate information | 1,000/hour | High |
| `/v1/candidate/{id}/` | Candidate details | 1,000/hour | High |
| `/v1/committees/` | Committee information | 1,000/hour | High |
| `/v1/committee/{id}/` | Committee details | 1,000/hour | High |
| `/v1/schedules/schedule_a/` | Individual contributions | 1,000/hour | Critical |
| `/v1/schedules/schedule_b/` | Disbursements | 1,000/hour | Critical |
| `/v1/schedules/schedule_e/` | Independent expenditures | 1,000/hour | High |
| `/v1/filings/` | All filings | 1,000/hour | High |
| `/v1/reports/financial/` | Financial reports | 1,000/hour | Medium |
| `/v1/communication-costs/` | Communication costs | 1,000/hour | Medium |
| `/v1/electioneering/` | Electioneering communications | 1,000/hour | Medium |

### 1.2 Authentication

```
Method: API Key (query parameter)
Parameter: api_key={CIVWATCH_FEC_API_KEY}
Registration: https://api.data.gov/signup/
```

### 1.3 Data Volume Estimates

| Cycle | Contributions (Schedule A) | Disbursements (Schedule B) | Committees | Filings |
|-------|---------------------------|---------------------------|------------|---------|
| 2024 Presidential | ~45M records | ~30M records | ~25,000 | ~500,000 |
| 2024 Congressional | ~15M records | ~10M records | ~15,000 | ~200,000 |
| 2026 Midterm (proj.) | ~20M records | ~12M records | ~20,000 | ~300,000 |

---

## 2. UNIFIED SCHEMA (CIVWATCH Normalized)

### 2.1 Contribution Record (`fec_contribution`)

```json
{
  "civwatch_id": "fec_sch_a_2026_c1234567_89012345",
  "ingestion_metadata": {
    "source": "fec_api",
    "endpoint": "/v1/schedules/schedule_a/",
    "ingested_at": "2026-06-24T14:30:00Z",
    "ingestion_batch": "batch_20260624_001",
    "hash_chain_block": "0xabc123...def456",
    "change_detected": false,
    "previous_version": null
  },
  "fec_source": {
    "transaction_id": "SA1234567890",
    "file_number": 1234567,
    "original_sub_id": "4012024261234567890",
    "filing_period": "2026Q2",
    "report_type": "Q2",
    "receipt_date": "2026-04-15"
  },
  "transaction": {
    "date": "2026-04-10",
    "amount": 250.00,
    "aggregate_amount": 750.00,
    "type": "individual",
    "memo_text": null,
    "memo_code": null
  },
  "contributor": {
    "name": "SMITH, JOHN",
    "name_parsed": {
      "first": "JOHN",
      "last": "SMITH",
      "middle": null,
      "prefix": null,
      "suffix": null
    },
    "address_scrubbed": {
      "street": "[REDACTED]",
      "city": "WASHINGTON",
      "state": "DC",
      "zip_5": "20001",
      "zip_full": "[REDACTED]"
    },
    "employer": "ACME CORPORATION",
    "occupation": "SOFTWARE ENGINEER",
    "type": "individual",
    "aggregate_bucket": "$200-$999"
  },
  "recipient": {
    "committee_id": "C12345678",
    "committee_name": "CITIZENS FOR DEMOCRACY PAC",
    "committee_type": "Q",
    "candidate_id": "H6DC12345",
    "candidate_name": "JANE DOE",
    "candidate_office": "H",
    "candidate_state": "DC",
    "candidate_district": "00"
  },
  "verification": {
    "source_verified": true,
    "source_signature_valid": false,
    "cross_reference_status": "pending",
    "anomaly_flags": [],
    "confidence_score": 0.98
  }
}
```

### 2.2 Committee Record (`fec_committee`)

```json
{
  "civwatch_id": "fec_cmte_C12345678",
  "fec_source": {
    "committee_id": "C12345678",
    "name": "CITIZENS FOR DEMOCRACY PAC",
    "type": "Q",
    "type_full": "Qualified PAC",
    "designation": "B",
    "designation_full": "Lobbyist/Registrant PAC",
    "filing_frequency": "Q",
    "first_filing_date": "2024-01-15",
    "last_filing_date": "2026-06-15",
    "registration_date": "2024-01-15"
  },
  "affiliation": {
    "party": "DEM",
    "party_full": "Democratic Party",
    "connected_organization": "CITIZENS FOR DEMOCRACY",
    "candidate_id": null,
    "leadership_pac": false
  },
  "financials": {
    "last_report_year": 2026,
    "cash_on_hand": 1250000.00,
    "debts_owed": 50000.00,
    "total_receipts": 8500000.00,
    "total_disbursements": 7300000.00
  },
  "lobbyist_registrant": {
    "is_lobbyist_pac": true,
    "registrant_name": "ACME LOBBYING LLC",
    "client_ids": ["LR12345", "LR67890"]
  }
}
```

---

## 3. INGESTION PIPELINE

### 3.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              FEC INGESTION PIPELINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FETCHER                                                  │
│     ├── Rate-limited API client (respect 1,000/hour)       │
│     ├── Pagination handling (per_page=100)                  │
│     ├── Retry with exponential backoff (max 5 attempts)    │
│     └── Checkpoint/resume (last_processed_transaction_id)   │
│                                                              │
│  2. VALIDATOR                                                │
│     ├── JSON Schema validation (fec_schema_v2.json)        │
│     ├── Data type checking (amounts numeric, dates valid)  │
│     ├── Range validation (amount > 0, date within cycle)   │
│     └── Cross-field validation (aggregate ≥ amount)        │
│                                                              │
│  3. CRYPTOGRAPHIC VERIFICATION                               │
│     ├── FEC filing signature check (when available)        │
│     ├── Hash verification against previous ingestion       │
│     └── Duplicate detection (transaction_id uniqueness)    │
│                                                              │
│  4. SANITIZER                                                │
│     ├── PII scrubbing (addresses, phone numbers)           │
│     ├── Employer normalization (standardize names)         │
│     ├── Geolocation scrubbing (apply PRIVACY_IMPACT rules) │
│     └── Occupation normalization (SOC code mapping)        │
│                                                              │
│  5. ENRICHER                                                 │
│     ├── Committee type classification                      │
│     ├── Lobbyist registrant flagging                       │
│     ├── Candidate linkage (cross-reference candidates/)    │
│     └── Industry classification (employer → NAICS)         │
│                                                              │
│  6. STORAGE                                                  │
│     ├── PostgreSQL (normalized tables)                     │
│     ├── OBELISK hash-chain (immutable audit trail)         │
│     └── Redis cache (hot queries, 24h TTL)                 │
│                                                              │
│  7. CHANGE DETECTION                                         │
│     ├── Amendment tracking (compare filing versions)       │
│     ├── Anomaly flagging (unusual amounts, patterns)       │
│     └── Alert generation (significant changes)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Ingestion Schedule

| Data Type | Frequency | Window | Priority |
|-----------|-----------|--------|----------|
| Schedule A (contributions) | Hourly | Last 24 hours | Critical |
| Schedule B (disbursements) | Hourly | Last 24 hours | Critical |
| Schedule E (IEs) | Hourly | Last 24 hours | High |
| Committee updates | Daily | Last 24 hours | High |
| Candidate updates | Daily | Last 24 hours | High |
| Filings (new) | Every 15 minutes | Real-time | Critical |
| Financial reports | Daily | Last 30 days | Medium |
| Bulk historical | Weekly | Full cycle refresh | Low |

---

## 4. ANOMALY DETECTION — FEC SPECIFIC

### 4.1 Contribution Pattern Anomalies

| Anomaly Type | Detection Method | Alert Threshold | Action |
|-------------|-----------------|-----------------|--------|
| **Straw donor pattern** | Multiple contributors at same address | ≥ 5 contributors, 1 address | Flag for review |
| **Conduit scheme** | Round-number amounts ($100, $250, $500) from same employer cluster | ≥ 20 contributors, same employer, same day | Flag for review |
| **Excessive bundling** | Individual aggregate near limit | > $3,300 (2026 limit) | Auto-alert |
| **Late-cycle surge** | > 5x average daily receipts in final 48 hours | Statistical outlier | Flag for review |
| **Corporate shell** | Employer is LLC with no public presence | Employer not in business registry | Research flag |
| **Foreign-linked** | Employer has known foreign ownership | Cross-reference FARA data | Cross-reference |
| **Refund pattern** | Multiple refunds to same contributor | ≥ 3 refunds, same name | Flag for review |

### 4.2 Anomaly Scoring

```python
# Pseudocode for FEC anomaly scoring

def score_contribution_anomaly(contribution, historical_context):
    score = 0.0
    flags = []
    
    # Straw donor detection
    address_cluster = get_contributors_at_address(
        contribution.contributor.address_hash
    )
    if len(address_cluster) >= 5:
        score += 0.3
        flags.append("STRAW_DONOR_CLUSTER")
    
    # Amount roundness (conduit indicator)
    if is_round_number(contribution.amount) and \
       get_same_employer_same_day_count(contribution) >= 20:
        score += 0.25
        flags.append("CONDUIT_PATTERN")
    
    # Late-cycle surge
    if is_within_48h_of_election(contribution.date) and \
       contribution.amount > historical_context.daily_average * 5:
        score += 0.2
        flags.append("LATE_CYCLE_SURGE")
    
    # Excessive aggregate
    if contribution.aggregate_amount > 3300:
        score += 0.15
        flags.append("NEAR_LIMIT_AGGREGATE")
    
    # Foreign-linked employer
    if is_foreign_linked_employer(contribution.contributor.employer):
        score += 0.1
        flags.append("FOREIGN_LINKED_EMPLOYER")
    
    return {
        "anomaly_score": min(score, 1.0),
        "flags": flags,
        "confidence": calculate_confidence(flags),
        "requires_human_review": score >= 0.5
    }
```

---

## 5. CROSS-REFERENCE INTEGRATION

### 5.1 Lobbying Data Correlation

```sql
-- Example: Correlate PAC contributions with lobbying contacts
SELECT 
    c.committee_id,
    c.committee_name,
    c.lobbyist_registrant.is_lobbyist_pac,
    l.client_name,
    l.issue_area_code,
    l.contact_date,
    SUM(c2.amount) as total_contributions,
    COUNT(DISTINCT c2.contributor_id) as unique_contributors
FROM fec_committee c
JOIN lobbying_disclosure l ON c.lobbyist_registrant.registrant_id = l.registrant_id
LEFT JOIN fec_contribution c2 ON c.committee_id = c2.recipient.committee_id
WHERE c.lobbyist_registrant.is_lobbyist_pac = true
    AND l.contact_date >= '2026-01-01'
GROUP BY c.committee_id, l.client_name, l.issue_area_code, l.contact_date
HAVING SUM(c2.amount) > 10000
ORDER BY total_contributions DESC;
```

### 5.2 FARA Correlation

```sql
-- Example: Flag contributions from FARA-registered agents
SELECT 
    fc.civwatch_id,
    fc.contributor.name,
    fc.contributor.employer,
    fc.recipient.committee_name,
    fc.transaction.amount,
    fc.transaction.date,
    fara.registrant_name,
    fara.foreign_principal
FROM fec_contribution fc
JOIN fara_registration fara ON 
    fc.contributor.employer ILIKE '%' || fara.registrant_name || '%'
WHERE fc.transaction.date >= '2026-01-01'
    AND fc.transaction.amount >= 200
ORDER BY fc.transaction.amount DESC;
```

---

## 6. DATA QUALITY METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Ingestion latency | < 2 hours from FEC filing | Timestamp comparison |
| Schema compliance | 100% | Validation pass rate |
| Duplicate rate | < 0.1% | transaction_id uniqueness |
| PII scrub completeness | 100% | Automated scan |
| Anomaly detection recall | > 90% | Human review feedback |
| Anomaly precision | > 85% | False positive rate |
| API uptime | > 99% | Health check |
| Data freshness | < 4 hours for critical endpoints | Staleness check |

---

## 7. ERROR HANDLING & RECOVERY

| Scenario | Response | Recovery |
|----------|----------|----------|
| FEC API rate limit (429) | Exponential backoff: 1s, 2s, 4s, 8s, 16s | Resume from checkpoint |
| FEC API downtime (5xx) | Switch to bulk data (if available) | Queue for retry |
| Schema mismatch | Log to error queue; alert engineering | Manual schema update |
| Duplicate flood | Deduplicate; investigate source | Alert on rate change |
| PII detection failure | Block ingestion; manual review | Fix scrubber; re-process |

---

## 8. REFERENCES

- [FEC API Documentation](https://api.open.fec.gov/developers/)
- [FEC Bulk Data](https://www.fec.gov/data/browse-data/?tab=bulk-data)
- [11 CFR § 104 — Contribution limits](https://www.ecfr.gov/current/title-11/chapter-I/subchapter-A/part-104)
- [52 U.S.C. § 30111 — Disclosure requirements](https://www.govinfo.gov/app/details/USCODE-2022-title52/USCODE-2022-title52-subtitleIII-chap301-subchapI-sec30111)
- [FEC Filing Formats](https://www.fec.gov/campaign-finance-data/file-format-help/)

---

*Last Updated: 2026-06-24 | Next Review: 2026-07-24*
