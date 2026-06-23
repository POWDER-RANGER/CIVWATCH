# CIVWATCH Lobbying Disclosure Ingestion Specification

> **Source**: Senate LD-2/LD-203, House Clerk | `lda.senate.gov`, `clerk.house.gov`
> **Data Type**: Lobbying contacts, issue areas, spending, registrant information
> **Update Frequency**: Quarterly (LD-2), Semi-annual (LD-203)
> **Ingestion Type**: PULL (XML downloads) + PARSE (HTML scraping backup)

---

## 1. SOURCE OVERVIEW

### 1.1 Senate Office of Public Records (SOPR)

| Endpoint/Resource | Description | Format | Update Frequency |
|------------------|-------------|--------|-----------------|
| `lda.senate.gov/api/v1/` | REST API (beta) | JSON | Real-time |
| `lda.senate.gov/compiled/` | Compiled quarterly data | XML, CSV | Quarterly |
| `lda.senate.gov/searches/` | Search interface | HTML | Real-time |

### 1.2 House Clerk

| Resource | Description | Format | Update Frequency |
|----------|-------------|--------|-----------------|
| `clerk.house.gov/lobby` | Lobbying disclosure search | HTML | Quarterly |
| Bulk XML downloads | Full LD-2 database | XML | Quarterly |

### 1.3 Data Volume Estimates

| Year | LD-2 Filings | LD-203 Filings | Unique Registrants | Unique Clients |
|------|-------------|---------------|-------------------|----------------|
| 2024 | ~45,000 | ~15,000 | ~12,000 | ~8,000 |
| 2026 (proj.) | ~50,000 | ~16,000 | ~13,000 | ~9,000 |

---

## 2. UNIFIED SCHEMA (CIVWATCH Normalized)

### 2.1 Lobbying Disclosure Record (`lobbying_disclosure`)

```json
{
  "civwatch_id": "lobby_ld2_2026_Q2_R123456_001",
  "ingestion_metadata": {
    "source": "senate_sopr",
    "ingested_at": "2026-06-24T14:30:00Z",
    "ingestion_batch": "lobby_batch_2026q2_001",
    "raw_file": "LD2_2026_Q2.xml",
    "hash_chain_block": "0xdef789...abc012",
    "change_detected": false
  },
  "filing": {
    "filing_type": "LD-2",
    "filing_uuid": "R123456-2026-Q2-001",
    "filing_period": "2026-Q2",
    "filing_date": "2026-04-15",
    "filing_year": 2026,
    "amended": false,
    "amendment_reason": null,
    "termination": false
  },
  "registrant": {
    "name": "ACME GOVERNMENT AFFAIRS LLC",
    "ppb_country": "USA",
    "ppb_state": "DC",
    "ppb_city": "WASHINGTON",
    "registrant_id": "R123456",
    "self_filer": false,
    "registrant_house_senate_id": "HS12345"
  },
  "client": {
    "name": "BIG PHARMA INC",
    "state": "NJ",
    "ppb_country": "USA",
    "client_id": "C789012",
    "active": true,
    "general_description": "Pharmaceutical research and development"
  },
  "lobbyists": [
    {
      "name": "JANE LOBBYIST",
      "covered_position": "Former Chief of Staff, Senator Smith",
      "covered_official": true,
      "former_congressional_staff": true,
      "former_executive_branch": false,
      "newlob": false
    }
  ],
  "issues": [
    {
      "general_issue_area": "HCR",
      "general_issue_area_full": "Health Care",
      "specific_issues": "Medicare Part D drug pricing reform; FDA approval pathways for biosimilars; 340B drug pricing program",
      "houses_and_agencies": ["HOUSE", "SENATE", "HHS", "FDA", "CMS"],
      "foreign_entity_interest": false
    }
  ],
  "financials": {
    "income": 50000.00,
    "income_raw": "$50,000",
    "expenses": null,
    "expenses_raw": null,
    "income_range_low": 50000,
    "income_range_high": 50000,
    "expense_range_low": null,
    "expense_range_high": null
  },
  "verification": {
    "source_verified": true,
    "cross_reference_fara": "pending",
    "cross_reference_fec": "pending",
    "anomaly_flags": [],
    "confidence_score": 0.95
  }
}
```

### 2.2 LD-203 Political Contribution Record (`lobbying_contribution`)

```json
{
  "civwatch_id": "lobby_ld203_2026_H1_R123456_001",
  "filing": {
    "filing_type": "LD-203",
    "filing_period": "2026-H1",
    "filing_date": "2026-07-30"
  },
  "registrant": {
    "name": "ACME GOVERNMENT AFFAIRS LLC",
    "registrant_id": "R123456"
  },
  "lobbyist": {
    "name": "JANE LOBBYIST",
    "covered_position": "Former Chief of Staff, Senator Smith"
  },
  "contribution": {
    "date": "2026-03-15",
    "amount": 2500.00,
    "recipient": "FRIENDS OF SENATOR SMITH",
    "recipient_type": "candidate_committee",
    "fec_committee_id": "C98765432",
    "payee": "FRIENDS OF SENATOR SMITH",
    "honoree": "Senator Smith",
    "event": "Annual Fundraising Dinner"
  }
}
```

---

## 3. INGESTION PIPELINE

### 3.1 Quarterly Ingestion Flow

```
┌─────────────────────────────────────────────────────────────┐
│           LOBBYING INGESTION PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  QUARTERLY CYCLE (LD-2)                                     │
│  ├── Day 1 of quarter: Set up monitoring                    │
│  ├── Day 21: First filings expected                         │
│  ├── Day 45: Bulk download available                        │
│  ├── Day 45-50: Full ingestion and validation               │
│  └── Day 50+: Change detection active                       │
│                                                              │
│  SEMI-ANNUAL CYCLE (LD-203)                                 │
│  ├── H1: Due July 30 (covers Jan-June)                      │
│  ├── H2: Due January 30 (covers July-Dec)                   │
│  └── Ingest within 7 days of availability                   │
│                                                              │
│  REAL-TIME MONITORING                                       │
│  ├── Senate SOPR API polling (daily)                        │
│  ├── Amendment detection (daily diff)                       │
│  └── New registrant alerts (real-time webhook if available) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 XML Parsing Specification

```python
# Senate LD-2 XML Schema Mapping

LD2_XML_NAMESPACE = "http://www.senate.gov/lobby"

FIELD_MAPPINGS = {
    "filingId": "filing.filing_uuid",
    "filingType": "filing.filing_type",
    "filingDate": "filing.filing_date",
    "reportYear": "filing.filing_year",
    "registrant.registrantName": "registrant.name",
    "registrant.ppCountry": "registrant.ppb_country",
    "registrant.ppState": "registrant.ppb_state",
    "client.clientName": "client.name",
    "client.clientID": "client.client_id",
    "lobbyist.name": "lobbyists[].name",
    "lobbyist.coveredPosition": "lobbyists[].covered_position",
    "lobbyist.coveredOfficial": "lobbyists[].covered_official",
    "issueArea.generalIssueArea": "issues[].general_issue_area",
    "issueArea.specificIssues": "issues[].specific_issues",
    "income": "financials.income",
    "expenses": "financials.expenses",
    "federalAgencies.houseAndSenate": "issues[].houses_and_agencies[]"
}
```

---

## 4. ANOMALY DETECTION — LOBBYING SPECIFIC

### 4.1 Revolving Door Detection

| Pattern | Detection Method | Alert Threshold | Significance |
|---------|-----------------|-----------------|-------------|
| **Hot revolving door** | Former official lobbies former office within 1 year | Any occurrence | STOCK Act cooling-off period violation |
| **Agency capture** | Multiple former officials from same agency lobby that agency | ≥ 3 former officials, same agency | Regulatory capture indicator |
| **Issue flip** | Lobbyist switches from public sector to opposing private interest | Within 2 years of leaving government | Conflict of interest |

### 4.2 Spending Anomaly Detection

| Anomaly Type | Detection Method | Alert Threshold |
|-------------|-----------------|-----------------|
| **Spike in client spending** | > 3x previous quarter | > 300% increase |
| **New issue area emergence** | Previously unreported issue | Any new issue for established client |
| **Late filing** | Filed after statutory deadline | > 45 days after quarter end |
| **Amendment flood** | Multiple amendments to same filing | ≥ 3 amendments |
| **Income reporting inconsistency** | LD-2 income ≠ LD-203 aggregate | > 10% variance |

### 4.3 Revolving Door Tracking

```sql
-- Detect revolving door violations
SELECT 
    l.lobbyist_name,
    l.covered_position,
    l.registrant_name,
    l.client_name,
    l.filing_period,
    ps.leave_date,
    ps.agency,
    ps.position_title,
    EXTRACT(DAYS FROM l.filing_date - ps.leave_date) as days_since_leaving
FROM lobbying_disclosure l
JOIN public_service ps ON l.lobbyist_name = ps.person_name
WHERE l.lobbyist_covered_official = true
    AND l.filing_date > ps.leave_date
    AND EXTRACT(DAYS FROM l.filing_date - ps.leave_date) < 365
    AND l.issues @> ANY(ps.agency_jurisdiction) -- lobbies former agency
ORDER BY days_since_leaving ASC;
```

---

## 5. CROSS-REFERENCE INTEGRATION

### 5.1 FEC Correlation

| Integration Point | Method | Value |
|------------------|--------|-------|
| Lobbyist → FEC contributions | Match lobbyist name to contributor name | Detect personal political giving by lobbyists |
| Client → FEC contributions | Match client PAC to contribution recipient | Detect client PAC giving while lobbying |
| Registrant → FEC contributions | Match registrant employees to contributions | Full financial picture |
| LD-203 → FEC itemization | Cross-reference specific contributions | Verify accuracy of both datasets |

### 5.2 FARA Correlation

| Integration Point | Method | Value |
|------------------|--------|-------|
| Client → FARA principal | Match lobbying client to FARA foreign principal | Detect undisclosed foreign lobbying |
| Registrant → FARA registrant | Same entity registered under both systems | Compliance verification |
| Issue overlap | FARA issues vs. lobbying issues | Detect parallel influence campaigns |

---

## 6. DATA QUALITY METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Quarterly ingestion completion | < 7 days from filing deadline | Days to complete |
| Amendment detection | 100% within 24 hours | Time to detect |
| Revolving door flag accuracy | > 90% | Human review feedback |
| Cross-reference coverage | > 95% of registrants matched to FEC | Match rate |
| XML parsing success rate | > 99.5% | Parse error rate |
| Income range precision | < 20% variance from actual | Range accuracy |

---

## 7. REFERENCES

- [Senate Lobbying Disclosure Act Database](https://lda.senate.gov/)
- [House Lobbying Disclosure](https://clerk.house.gov/lobby/)
- [2 U.S.C. § 1601-1614 — Lobbying Disclosure Act](https://www.govinfo.gov/app/details/USCODE-2011-title2/USCODE-2011-title2-chap26)
| [LD-2 XML Schema](https://lda.senate.gov/api/v1/schemas/)
- [LD-203 Filing Requirements](https://lda.senate.gov/ld203/filingRequirements/)
- [CRS Report: Lobbying Law and Ethics Rules](https://crsreports.congress.gov/)

---

*Last Updated: 2026-06-24 | Next Review: 2026-07-24*
