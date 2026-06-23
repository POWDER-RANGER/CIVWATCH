# CIVWATCH Body Camera Monitoring Module

> **Status**: SPECIFICATION v1.0 | **Target**: Phase 2 (Weeks 5-12)
> **Coverage Target**: Top 100 cities in Phase 2; 18,000+ departments in Phase 3
> **Sources**: BJS, Police Data Initiative, MuckRock FOIA Database, direct FOIA

---

## 1. MODULE OVERVIEW

The Body Camera Monitoring Module tracks, analyzes, and scores police department body camera (BWC) policies across the United States. It provides:

- **Policy Database**: Structured repository of BWC policies
- **Accountability Dashboard**: Interactive map and scoring system
- **Incident Correlation**: Cross-reference BWC compliance with civilian complaints
- **Citizen Reporting**: Encrypted tip line for BWC-related issues

> **Mission**: Ensure that body cameras serve their intended purpose — accountability and transparency — rather than becoming tools of surveillance without oversight.

---

## 2. POLICY TRACKER DATABASE

### 2.1 Department Record (`bwc_department`)

```json
{
  "civwatch_id": "bwc_dept_nycpd_001",
  "version": 1,
  "created_at": "2026-06-24T10:00:00Z",
  "updated_at": "2026-06-24T10:00:00Z",
  
  "department": {
    "name": "New York City Police Department",
    "abbreviation": "NYPD",
    "jurisdiction_type": "municipal",
    "city": "New York",
    "state": "NY",
    "county": "New York",
    "fips_code": "36081",
    "population_served": 8336817,
    "officer_count": 36000,
    "annual_budget": 5500000000,
    "website": "https://www1.nyc.gov/site/nypd/index.page"
  },
  
  "bwc_program": {
    "has_bwc_program": true,
    "program_start_date": "2017-04-01",
    "vendor": "Axon Enterprise Inc.",
    "devices_deployed": 24000,
    "officers_with_bwcs": 20000,
    "coverage_percentage": 55.6,
    "program_phase": "citywide",
    "estimated_annual_cost": 25000000
  },
  
  "policy": {
    "has_written_policy": true,
    "policy_date": "2023-01-15",
    "policy_version": "4.2",
    "policy_url": "https://www1.nyc.gov/assets/nypd/downloads/...",
    "policy_obtained_via": "foia",
    "policy_document_url": "https://civwatch.io/docs/bwc/nypd_policy_2023.pdf",
    
    "activation_requirements": {
      "mandatory_activation_scenarios": [
        "arrests",
        "searches",
        "use_of_force",
        "pursuits",
        "mental_health_crisis",
        "domestic_violence",
        "traffic_stops"
      ],
      "discretionary_activation_scenarios": [
        "investigative_encounters",
        "community_engagement"
      ],
      "prohibited_deactivation_scenarios": [
        "use_of_force",
        "arrests"
      ],
      "supervisor_override_allowed": false,
      "officer_discretion_language": "officers are expected to activate"
    },
    
    "recording_restrictions": {
      "victim_privacy_protections": true,
      "juvenile_protections": true,
      "medical_privacy_protections": true,
      "witness_protection": false,
      "internal_privacy_provisions": false
    },
    
    "access_and_retention": {
      "retention_period_days": 365,
      "flagged_retention_period_days": 2555,
      "supervisor_review_rights": "periodic_audit",
      "officer_review_before_report": false,
      "public_access_procedure": "foia_request",
      "public_access_timeline_days": 30,
      "release_approval_authority": "legal_bureau",
      "redaction_policy": "faces_blurred_minors_redacted"
    },
    
    "disciplinary_provisions": {
      "failure_to_activate_penalty": "subject_to_discipline",
      "tampering_penalty": "criminal_charge_possible",
      "deletion_penalty": "criminal_charge_possible",
      "disciplinary_transparency": false,
      "civilian_oversight": true
    }
  },
  
  "compliance_score": {
    "overall_score": 72,
    "activation_score": 80,
    "transparency_score": 65,
    "accountability_score": 70,
    "retention_score": 75,
    "civil_rights_score": 70,
    "scoring_version": "bwc_score_v2"
  },
  
  "foia_history": [
    {
      "request_date": "2026-01-15",
      "request_method": "email",
      "response_date": "2026-03-20",
      "days_to_response": 64,
      "status": "fulfilled",
      "documents_received": 1,
      "redactions": "minimal",
      "fees_charged": 0,
      "request_url": "https://civwatch.io/foia/nypd_20260115"
    }
  ],
  
  "incidents": {
    "total_bwc_related_complaints_12mo": 47,
    "camera_off_complaints": 12,
    "malfunction_complaints": 8,
    "access_denied_complaints": 15,
    "retaliation_complaints": 5,
    "civilian_fatality_recordings": 3,
    "use_of_force_recordings": 892
  },
  
  "oversight": {
    "civilian_review_board": true,
    "board_name": "Civilian Complaint Review Board (CCRB)",
    "board_powers": ["investigate", "recommend_discipline"],
    "board_independence_score": 75,
    "elected_official_oversight": true,
    "court_oversight": true,
    "doj_consent_decree": false
  }
}
```

---

## 3. BWC POLICY SCORING SYSTEM

### 3.1 Scoring Dimensions

| Dimension | Weight | Max Score | Criteria |
|-----------|--------|-----------|----------|
| **Activation Requirements** | 20% | 100 | Mandatory scenarios defined; limited officer discretion; prohibited deactivation |
| **Transparency** | 20% | 100 | Public access policy; timely release; clear procedure; minimal redaction |
| **Accountability** | 20% | 100 | Disciplinary provisions; civilian oversight; transparency of discipline |
| **Retention** | 15% | 100 | Adequate retention period; flagged incident retention; chain of custody |
| **Civil Rights Protections** | 15% | 100 | Victim privacy; juvenile protections; medical privacy; witness protection |
| **Technology Standards** | 10% | 100 | Pre-event buffer; tamper-evident; cloud security; access logging |

### 3.2 Detailed Scoring Rubric

#### Activation Requirements (20%)

| Criterion | Points | Notes |
|-----------|--------|-------|
| Mandatory activation for arrests | 10 | Must explicitly require |
| Mandatory activation for searches | 10 | Must explicitly require |
| Mandatory activation for use of force | 10 | Must explicitly require |
| Mandatory activation for pursuits | 10 | Must explicitly require |
| Limited officer discretion | 20 | "Shall" vs. "should" language |
| Prohibited deactivation during critical incidents | 10 | Cannot turn off during use of force |
| Supervisor notification for failures | 10 | Automatic alert |
| Audio always recorded with video | 10 | Not video-only |
| Pre-event buffer (30+ seconds) | 10 | Records before activation |

#### Transparency (20%)

| Criterion | Points | Notes |
|-----------|--------|-------|
| Written policy publicly available | 20 | Without requiring FOIA |
| Clear public access procedure | 15 | Defined process for requesting footage |
| Release within 30 days (routine) | 15 | Timely access |
| Release without requiring court order | 10 | Administrative release allowed |
| Minimal redaction (only PII/victims) | 10 | Not blanket redaction |
| Subject access to own footage | 10 | People recorded can request their own footage |
| Media access provisions | 10 | Press can request with expedited process |
| Regular public reporting on BWC usage | 10 | Annual or quarterly statistics published |

#### Accountability (20%)

| Criterion | Points | Notes |
|-----------|--------|-------|
| Failure to activate = disciplinary violation | 20 | Explicit penalty |
| Tampering = criminal charge | 15 | Potential felony |
| Independent civilian oversight | 20 | Civilian review board with investigation power |
| Disciplinary outcomes published | 15 | Public record of BWC-related discipline |
| Officer cannot review before writing report | 10 | Prevents report-fitting |
| Supervisor regular audit of footage | 10 | Proactive review, not complaint-driven |
| Whistleblower protection | 10 | Officers who report violations protected |

### 3.3 Overall Score Interpretation

| Score Range | Grade | Description |
|-------------|-------|-------------|
| **90-100** | A | Exemplary policy; national model |
| **80-89** | B | Good policy; minor improvements needed |
| **70-79** | C | Adequate policy; significant gaps |
| **60-69** | D | Weak policy; major reforms needed |
| **0-59** | F | Inadequate or no policy |
| **N/A** | NR | No BWC program or policy not obtained |

---

## 4. ACCOUNTABILITY DASHBOARD

### 4.1 Dashboard Components

| Component | Description | Data Source |
|-----------|-------------|-------------|
| **Interactive Map** | Color-coded map: BWC program status by department | BJS + CIVWATCH database |
| **Scorecard Table** | Sortable table: all departments with scores | CIVWATCH database |
| **Comparison Tool** | Side-by-side policy comparison | CIVWATCH database |
| **Trend Analysis** | Score changes over time | Historical data |
| **FOIA Tracker** | Status of pending FOIA requests | CIVWATCH FOIA system |
| **Incident Feed** | Recent BWC-related incidents | News + public records |

### 4.2 Map Color Coding

| Color | Meaning | Criteria |
|-------|---------|----------|
| **Green** | Exemplary | Score ≥ 90; full program; public policy |
| **Light Green** | Good | Score 80-89; full program; public policy |
| **Yellow** | Adequate | Score 70-79; program exists |
| **Orange** | Needs Improvement | Score 60-69; program exists |
| **Red** | Inadequate | Score < 60; program exists |
| **Gray** | No Program | No BWC program |
| **Black** | Unknown | Policy not obtained |

### 4.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/bwc/departments` | List all departments (paginated) |
| `GET` | `/api/v1/bwc/departments/{id}` | Get department details |
| `GET` | `/api/v1/bwc/departments/state/{state}` | Filter by state |
| `GET` | `/api/v1/bwc/scorecard` | Scorecard data |
| `GET` | `/api/v1/bwc/map-data` | GeoJSON for map rendering |
| `GET` | `/api/v1/bwc/compare?depts=A,B,C` | Compare departments |
| `GET` | `/api/v1/bwc/trends` | Trend data |
| `GET` | `/api/v1/bwc/foia-status` | FOIA request status |
| `POST` | `/api/v1/bwc/tip` | Submit encrypted tip |

---

## 5. INCIDENT CORRELATION ENGINE

### 5.1 Correlation Logic

```python
class BWCIncidentCorrelator:
    """
    Correlate BWC policy compliance with civilian complaints and use-of-force incidents.
    """
    
    CORRELATION_RULES = [
        {
            "name": "camera_off_complaint",
            "description": "Complaint filed about BWC being off during incident",
            "indicators": [
                "complaint mentions 'camera' or 'recording'",
                "complaint filed within 24h of incident",
                "incident type in mandatory_activation_scenarios"
            ],
            "severity": "high",
            "auto_flag": True
        },
        {
            "name": "use_of_force_no_recording",
            "description": "Use of force incident with no BWC recording",
            "indicators": [
                "use_of_force_report filed",
                "no corresponding BWC footage",
                "officer had assigned BWC"
            ],
            "severity": "critical",
            "auto_flag": True
        },
        {
            "name": "civilian_fatality_no_release",
            "description": "Civilian fatality with no BWC footage released",
            "indicators": [
                "civilian_death_report filed",
                "> 30 days since incident",
                "no public footage release",
                "FOIA request pending or denied"
            ],
            "severity": "critical",
            "auto_flag": True
        },
        {
            "name": "pattern_failure",
            "description": "Pattern of BWC failures by same officer",
            "indicators": [
                "≥ 3 BWC-related complaints against same officer in 12 months",
                "complaints involve different incidents"
            ],
            "severity": "high",
            "auto_flag": True
        }
    ]
    
    def correlate(self, incident: Incident, department: Department) -> CorrelationResult:
        """Correlate an incident with BWC policy compliance."""
        flags = []
        
        for rule in self.CORRELATION_RULES:
            if self._match_rule(rule, incident, department):
                flags.append({
                    "rule": rule["name"],
                    "severity": rule["severity"],
                    "description": rule["description"],
                    "policy_gap": self._identify_policy_gap(rule, department)
                })
        
        return {
            "incident_id": incident.id,
            "department_id": department.civwatch_id,
            "flags": flags,
            "policy_compliance_score": department.compliance_score.overall_score,
            "recommended_actions": self._generate_recommendations(flags, department)
        }
```

---

## 6. CITIZEN REPORTING SYSTEM

### 6.1 Encrypted Tip Line

| Feature | Implementation |
|---------|---------------|
| **Submission method** | Web form + Signal bot |
| **Encryption** | Client-side encryption (OpenPGP.js) |
| **Anonymity** | No IP logging; optional contact info |
| **Tip types** | Camera off, malfunction, policy violation, footage denial |
| **Follow-up** | Anonymous two-way communication via SecureDrop-style reply |
| **Escalation** | Tips with evidence forwarded to oversight board |
| **Retention** | Encrypted tips retained 90 days; metadata purged immediately |

### 6.2 Tip Categories

| Category | Description | Required Info |
|----------|-------------|---------------|
| **Camera Off** | Officer failed to activate BWC when required | Department, date/time, incident type |
| **Malfunction** | BWC malfunction during critical incident | Department, date, nature of malfunction |
| **Policy Violation** | Department policy not followed | Department, specific policy violated |
| **Access Denied** | Request for footage denied | Department, date of request, reason given |
| **Retaliation** | Retaliation for BWC complaint | Department, nature of retaliation |
| **Quality Issue** | Footage unusable (obstructed, deleted, etc.) | Department, description |

---

## 7. FOIA AUTOMATION

### 7.1 FOIA Request Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│              BWC FOIA AUTOMATION PIPELINE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DEPARTMENT IDENTIFICATION                               │
│     ├── Census of Law Enforcement Agencies (CLEA) data     │
│     ├── BJS Law Enforcement Management and Admin Stats     │
│     └── Public records cross-reference                      │
│                                                              │
│  2. TEMPLATE SELECTION                                      │
│     ├── State-specific FOIA statute auto-detection         │
│     ├── Jurisdiction type (state/county/municipal)         │
│     └── Fee waiver justification auto-generation           │
│                                                              │
│  3. REQUEST GENERATION                                      │
│     ├── Fill template with department details              │
│     ├── Generate PDF with letterhead                       │
│     └── Auto-email to department records officer           │
│                                                              │
│  4. TRACKING                                                │
│     ├── Record request in database                         │
│     ├── Calculate statutory deadline (auto)                │
│     ├── Send follow-up at 50% of deadline                  │
│     └── Escalation workflow for non-response               │
│                                                              │
│  5. RESPONSE PROCESSING                                     │
│     ├── Document upload and OCR                            │
│     ├── Policy extraction and structuring                  │
│     ├── Score calculation                                  │
│     └── Public release with redaction check                │
│                                                              │
│  6. COMPLIANCE                                              │
│     ├── Track compliance with state FOIA deadlines         │
│     ├── Identify departments with poor compliance          │
│     └── Publish compliance statistics                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Coverage Targets

| Phase | Target | Timeline | Method |
|-------|--------|----------|--------|
| **Phase 2** | Top 100 cities by population | Weeks 5-12 | Direct FOIA |
| **Phase 2b** | All cities > 100,000 population | Weeks 13-16 | Direct FOIA |
| **Phase 3** | All cities > 50,000 population | Weeks 17-24 | Direct FOIA + partnerships |
| **Phase 4** | All 18,000+ departments | Ongoing | Crowdsourcing + partnerships |

---

## 8. DATA SOURCES

| Source | URL | Data Type | Update Frequency |
|--------|-----|-----------|-----------------|
| **BJS Body-Worn Cameras** | `bjs.ojp.gov/topics/law-enforcement/body-worn-cameras` | Statistics, research | Annual |
| **Police Data Initiative** | `policedatainitiative.org` | Department participation | Quarterly |
| **MuckRock FOIA Database** | `muckrock.com/foi/` | FOIA responses, documents | Real-time |
| **CLEA (Census of Law Enforcement Agencies)** | `bjs.ojp.gov/data-collection/census-law-enforcement-agencies-clea` | Department directory | Annual |
| **LEMAS (Law Enforcement Management and Administrative Statistics)** | `bjs.ojp.gov/data-collection/law-enforcement-management-and-administrative-statistics-lemas` | Management surveys | Every 3-4 years |
| **State BWC Laws Database** | State legislative websites | Statutory requirements | As enacted |

---

*Last Updated: 2026-06-24 | Version: 1.0*
