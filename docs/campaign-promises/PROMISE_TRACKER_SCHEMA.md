# CIVWATCH Campaign Promise Tracker — Schema & API Specification

> **Status**: SPECIFICATION v1.0 | **Target**: Phase 2 (Weeks 5-12)
> **Sources**: PolitiFact Promise Tracker (reference), ProPublica Represent, VoteSmart API

---

## 1. CORE CONCEPT

The Campaign Promise Tracker systematically extracts, monitors, and scores political promises made by candidates and officeholders. It provides structured accountability data for journalists, researchers, and citizens.

> **Principle**: Every tracked promise must have a verbatim primary source, documented evidence for status changes, and multi-reviewer validation.

---

## 2. DATA MODEL

### 2.1 Promise Entity (`campaign_promise`)

```json
{
  "civwatch_id": "promise_2026_jdoe_dc_h_001",
  "version": 1,
  "created_at": "2026-06-24T10:00:00Z",
  "updated_at": "2026-06-24T10:00:00Z",
  "status_changed_at": null,
  
  "subject": {
    "name": "Jane Doe",
    "current_role": "Representative",
    "state": "DC",
    "district": "00",
    "party": "DEM",
    "civwatch_politician_id": "pol_H6DC12345",
    "office_sought_when_promise_made": "H",
    "election_cycle": "2026",
    "is_incumbent": true
  },
  
  "promise": {
    "verbatim_text": "I will introduce legislation to require all federal law enforcement officers to wear body cameras within my first 100 days in office.",
    "paraphrased_summary": "Introduce federal body camera mandate legislation within 100 days",
    "category": "criminal_justice",
    "subcategory": "police_accountability",
    "keywords": ["body camera", "law enforcement", "federal", "legislation"],
    "specificity_score": 0.85,
    "quantifiable": true,
    "quantifiable_metric": "Introduce legislation within 100 days of taking office",
    "deadline_date": "2027-04-30",
    "deadline_description": "100 days after start of 119th Congress (Jan 3, 2027)"
  },
  
  "source": {
    "primary_source_type": "debate_transcript",
    "primary_source_url": "https://debates.org/2026/dc-house-debate-oct15/",
    "primary_source_date": "2026-10-15",
    "primary_source_context": "DC Congressional Debate, George Washington University",
    "verbatim_confirmed": true,
    "transcription_confidence": 0.99,
    "secondary_sources": [
      {
        "type": "news_report",
        "source": "Washington Post",
        "url": "https://wapo.st/...",
        "date": "2026-10-16"
      }
    ],
    "video_timestamp": "01:23:45",
    "archived_url": "https://web.archive.org/web/20261016/..."
  },
  
  "status": {
    "current_status": "in_progress",
    "status_history": [
      {
        "status": "made",
        "date": "2026-10-15",
        "evidence_url": "https://debates.org/2026/dc-house-debate-oct15/",
        "reviewed_by": ["reviewer_001", "reviewer_002"],
        "notes": "Promise made during debate"
      }
    ],
    "score": {
      "promise_kept_score": null,
      "progress_percentage": 15,
      "days_remaining": 310,
      "days_since_made": 253
    }
  },
  
  "review": {
    "review_count": 2,
    "reviewers": ["reviewer_001", "reviewer_002"],
    "last_reviewed_at": "2026-06-24T10:00:00Z",
    "review_status": "approved",
    "disputed": false,
    "dispute_resolution": null
  },
  
  "public_api": {
    "public": true,
    "published_at": "2026-06-24T12:00:00Z",
    "corrections": []
  }
}
```

### 2.2 Promise Status Definitions

| Status | Code | Definition | Evidence Required | Score Weight |
|--------|------|-----------|-------------------|-------------|
| **Made** | `made` | Promise extracted from primary source | Verbatim source, transcription | 0 |
| **In Progress** | `in_progress` | Active effort toward fulfillment | Bill introduced, executive order, documented action | 25 |
| **Compromised** | `compromised` | Partially fulfilled or significantly modified | Legislative text showing compromise | 50 |
| **Kept** | `kept` | Promise fully implemented as stated | Signed legislation, implemented policy, documented outcome | 100 |
| **Broken** | `broken` | Promise abandoned or actively contradicted | Statement of abandonment, contradictory action, expired deadline | 0 |
| **Stalled** | `stalled` | No progress for 180+ days despite opportunity | Timeline analysis, opportunity assessment | 10 |
| **Not Yet Rated** | `not_rated` | Insufficient time or information | Date tracking | — |

### 2.3 Status Transition Rules

```
                    ┌─────────────┐
                    │   MADE      │
                    │  (initial)  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ IN       │   │ STALLED  │   │ BROKEN   │
     │ PROGRESS │   │          │   │ (early)  │
     └────┬─────┘   └────┬─────┘   └──────────┘
          │              │
          ▼              ▼
     ┌──────────┐   ┌──────────┐
     │ COMPRO-  │   │ BROKEN   │
     │ MISED    │   │ (expired)│
     └────┬─────┘   └──────────┘
          │
          ▼
     ┌──────────┐
     │   KEPT   │
     └──────────┘
```

| Transition | Allowed? | Conditions |
|-----------|----------|-----------|
| `made` → `in_progress` | ✅ Yes | Evidence of action initiated |
| `made` → `stalled` | ✅ Yes | No progress for 180 days |
| `made` → `broken` | ✅ Yes | Explicit abandonment within 30 days of making |
| `in_progress` → `compromised` | ✅ Yes | Partial implementation documented |
| `in_progress` → `kept` | ✅ Yes | Full implementation verified |
| `in_progress` → `stalled` | ✅ Yes | No progress for 180 days |
| `in_progress` → `broken` | ✅ Yes | Explicit abandonment or contradictory action |
| `stalled` → `in_progress` | ✅ Yes | New evidence of action |
| `stalled` → `broken` | ✅ Yes | Deadline passes without action |
| `compromised` → `kept` | ✅ Yes | Remaining aspects implemented |
| `broken` → any | ❌ No | Broken is terminal (unless new promise made) |

---

## 3. ACCOUNTABILITY SCORING SYSTEM

### 3.1 Individual Promise Score

```python
def calculate_promise_score(promise) -> dict:
    """
    Calculate accountability score for a single promise.
    Returns score 0-100 with confidence interval.
    """
    
    # Base score from status
    status_scores = {
        'made': 0,
        'not_rated': 0,
        'stalled': 10,
        'in_progress': 25,
        'compromised': 50,
        'kept': 100,
        'broken': 0
    }
    
    base_score = status_scores.get(promise.status.current_status, 0)
    
    # Specificity bonus (more specific = higher weight)
    specificity_bonus = promise.promise.specificity_score * 10  # 0-10 points
    
    # Deadline performance
    deadline_bonus = 0
    if promise.promise.deadline_date:
        if promise.status.current_status == 'kept':
            # Bonus for early fulfillment
            fulfilled_early = promise.promise.deadline_date - promise.status.status_changed_at
            if fulfilled_early.days > 30:
                deadline_bonus = 5  # Early bird bonus
        elif promise.status.current_status == 'broken':
            # No additional penalty beyond base score of 0
            pass
    
    # Evidence quality multiplier
    evidence_quality = min(len(promise.status.status_history) * 0.1, 0.2)  # Max 0.2
    
    final_score = (base_score + specificity_bonus + deadline_bonus) * (1 + evidence_quality)
    final_score = min(final_score, 100)
    
    # Confidence interval based on review count
    confidence = 0.7 + (promise.review.review_count * 0.05)  # +5% per reviewer, max ~1.0
    
    return {
        'score': round(final_score, 1),
        'confidence': round(min(confidence, 0.95), 2),
        'ci_low': round(max(final_score * (1 - (1 - confidence)), 0), 1),
        'ci_high': round(min(final_score * (1 + (1 - confidence)), 100), 1),
        'components': {
            'base_score': base_score,
            'specificity_bonus': specificity_bonus,
            'deadline_bonus': deadline_bonus,
            'evidence_multiplier': 1 + evidence_quality
        }
    }
```

### 3.2 Politician Accountability Dashboard Score

| Metric | Calculation | Weight |
|--------|-------------|--------|
| **Overall Score** | Weighted average of all promise scores | 100% |
| **Promise Count** | Total tracked promises | Context |
| **Kept Rate** | Kept / (Kept + Broken) | 40% |
| **Progress Rate** | (In Progress + Compromised * 0.5) / Total | 20% |
| **Specificity-Weighted Score** | Average score weighted by specificity | 20% |
| **Responsiveness** | Average days to status change after deadline | 10% |
| **Evidence Quality** | Average review count per promise | 10% |

---

## 4. API SPECIFICATION

### 4.1 REST Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/promises` | List all promises (paginated) | Public |
| `GET` | `/api/v1/promises/{id}` | Get promise by CIVWATCH ID | Public |
| `GET` | `/api/v1/promises/politician/{politician_id}` | Get promises by politician | Public |
| `GET` | `/api/v1/promises/search?q={query}` | Full-text search | Public |
| `GET` | `/api/v1/promises/category/{category}` | Filter by category | Public |
| `GET` | `/api/v1/promises/status/{status}` | Filter by status | Public |
| `GET` | `/api/v1/promises/scoreboard` | Accountability scoreboard | Public |
| `POST` | `/api/v1/promises` | Submit new promise | Staff |
| `PUT` | `/api/v1/promises/{id}/status` | Update promise status | Staff + Review |
| `POST` | `/api/v1/promises/{id}/evidence` | Submit evidence | Staff + Public |
| `GET` | `/api/v1/scores/politician/{id}` | Get politician score | Public |
| `GET` | `/api/v1/scores/leaderboard` | Scoreboard leaderboard | Public |

### 4.2 Request/Response Examples

#### GET /api/v1/promises/{id}

```json
// Request
GET /api/v1/promises/promise_2026_jdoe_dc_h_001

// Response 200
{
  "civwatch_id": "promise_2026_jdoe_dc_h_001",
  "subject": {
    "name": "Jane Doe",
    "current_role": "Representative",
    "state": "DC",
    "party": "DEM"
  },
  "promise": {
    "verbatim_text": "I will introduce legislation to require all federal law enforcement officers to wear body cameras within my first 100 days in office.",
    "paraphrased_summary": "Introduce federal body camera mandate within 100 days",
    "category": "criminal_justice",
    "subcategory": "police_accountability",
    "specificity_score": 0.85,
    "deadline_date": "2027-04-30"
  },
  "status": {
    "current_status": "in_progress",
    "current_status_label": "In Progress",
    "score": {
      "promise_kept_score": 25.0,
      "progress_percentage": 15,
      "days_remaining": 310,
      "days_since_made": 253
    }
  },
  "source": {
    "primary_source_type": "debate_transcript",
    "primary_source_date": "2026-10-15",
    "verbatim_confirmed": true
  },
  "review": {
    "review_count": 2,
    "review_status": "approved",
    "disputed": false
  },
  "public_api": {
    "public": true,
    "published_at": "2026-06-24T12:00:00Z"
  }
}
```

#### GET /api/v1/scores/leaderboard

```json
// Request
GET /api/v1/scores/leaderboard?chamber=house&cycle=2026&limit=10

// Response 200
{
  "metadata": {
    "chamber": "house",
    "cycle": "2026",
    "generated_at": "2026-06-24T14:30:00Z",
    "total_politicians": 435,
    "min_promises_threshold": 5
  },
  "leaderboard": [
    {
      "rank": 1,
      "politician": {
        "name": "Jane Doe",
        "state": "DC",
        "district": "00",
        "party": "DEM",
        "civwatch_id": "pol_H6DC12345"
      },
      "score": 78.5,
      "confidence": 0.90,
      "promises": {
        "total": 25,
        "kept": 12,
        "broken": 3,
        "in_progress": 5,
        "compromised": 3,
        "stalled": 2
      }
    }
  ]
}
```

---

## 5. EXtraction Pipeline

### 5.1 Source Types & Extraction Methods

| Source Type | Extraction Method | Automation Level | Confidence |
|------------|------------------|-----------------|------------|
| **Debate transcripts** | NLP + human review | Semi-automated | 0.99 |
| **Campaign websites** | Web scraping + NLP | Automated | 0.90 |
| **Policy papers** | PDF extraction + NLP | Semi-automated | 0.95 |
| **Press releases** | RSS + NLP | Automated | 0.85 |
| **Social media** | API + NLP | Automated | 0.80 |
| **TV interviews** | Transcription service | Manual | 0.95 |
| **Town halls** | Audio transcription | Manual | 0.95 |

### 5.2 NLP Promise Detection

```python
class PromiseExtractor:
    """
    Extract promises from political text using NLP.
    """
    
    PROMISE_PATTERNS = [
        # "I will..." patterns
        r"I will\s+(.+?)(?:[.!?]|$)",
        r"I shall\s+(.+?)(?:[.!?]|$)",
        r"I promise\s+(?:to\s+)?(.+?)(?:[.!?]|$)",
        r"I pledge\s+(?:to\s+)?(.+?)(?:[.!?]|$)",
        r"I commit\s+(?:to\s+)?(.+?)(?:[.!?]|$)",
        
        # "We will..." patterns
        r"We will\s+(.+?)(?:[.!?]|$)",
        r"We must\s+(.+?)(?:[.!?]|$)",
        r"We need\s+(?:to\s+)?(.+?)(?:[.!?]|$)",
        
        # "My administration will..."
        r"My (?:administration|plan|proposal)\s+(?:will|would)\s+(.+?)(?:[.!?]|$)",
        r"As\s+\w+,\s+I\s+(?:will|would)\s+(.+?)(?:[.!?]|$)",
        
        # Goal-oriented patterns
        r"(?:goal|objective|aim)\s+(?:is\s+)?(?:to\s+)?(.+?)(?:[.!?]|$)",
        r"(?:ensure|guarantee|make\s+sure)\s+(?:that\s+)?(.+?)(?:[.!?]|$)",
    ]
    
    SPECIFICITY_INDICATORS = [
        # Quantitative indicators (+0.2 each)
        (r'\$[\d,]+', 'dollar_amount'),
        (r'\b\d+\s*(?:days?|weeks?|months?|years?)', 'timeframe'),
        (r'\b\d+(?:\.\d+)?\s*percent', 'percentage'),
        (r'\b(?:first|within)\s+\d+', 'deadline'),
        
        # Legislative indicators (+0.15)
        (r'\b(?:introduce|pass|sign)\s+(?:a\s+)?(?:bill|legislation|act|law)', 'legislative_action'),
        (r'\bexecutive\s+order', 'executive_action'),
        
        # Specific target indicators (+0.1)
        (r'\b(?:all|every|each)\s+\w+', 'universal_scope'),
        (r'\b(?:federal|state|local)\s+', 'jurisdiction_scope'),
    ]
    
    def extract_promises(self, text: str, source_metadata: dict) -> List[PromiseCandidate]:
        """Extract promise candidates from text."""
        candidates = []
        
        for pattern in self.PROMISE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                promise_text = match.group(1).strip()
                specificity = self._score_specificity(promise_text)
                
                candidate = PromiseCandidate(
                    text=promise_text,
                    full_context=text[max(0, match.start()-100):match.end()+100],
                    specificity_score=specificity,
                    source_metadata=source_metadata,
                    extraction_pattern=pattern,
                    confidence=self._calculate_confidence(promise_text, specificity)
                )
                candidates.append(candidate)
        
        # Deduplicate overlapping candidates
        return self._deduplicate(candidates)
    
    def _score_specificity(self, text: str) -> float:
        """Score how specific/measurable a promise is."""
        score = 0.0
        for pattern, indicator_type in self.SPECIFICITY_INDICATORS:
            if re.search(pattern, text, re.IGNORECASE):
                score += 0.15 if indicator_type in ['legislative_action', 'executive_action'] else 0.1
        return min(score, 1.0)
```

---

## 6. REVIEW WORKFLOW

### 6.1 Multi-Stage Review

```
Stage 1: AI EXTRACTION (Automated)
├── NLP promise detection
├── Specificity scoring
├── Category classification
└── Confidence threshold: ≥ 0.80

Stage 2: HUMAN REVIEWER A (Junior)
├── Verify verbatim text accuracy
├── Confirm source URL and date
├── Check specificity score
├── Propose category/subcategory
└── Approval/rejection

Stage 3: HUMAN REVIEWER B (Senior)
├── Review Reviewer A's work
├── Verify source interpretation
├── Confirm category accuracy
├── Check for partisan bias
└── Final approval

Stage 4: PUBLICATION
├── Add to public API
├── Notify subscribers
├── Archive source materials
└── Open for public evidence submission
```

### 6.2 Status Change Review

| Status Change | Review Required | Evidence Required | Timeline |
|--------------|----------------|-------------------|----------|
| `made` → `in_progress` | 1 reviewer | Bill text, executive order, or documented action | 48 hours |
| `in_progress` → `kept` | 2 reviewers | Signed law, implemented policy, documented outcome | 72 hours |
| `in_progress` → `compromised` | 2 reviewers | Legislative text showing partial implementation | 72 hours |
| `any` → `broken` | 2 reviewers + Ethics Officer | Abandonment statement or contradictory action | 72 hours |
| `made` → `stalled` | Automated | 180-day inactivity threshold | Automatic |
| Public correction | 2 reviewers | Corrected evidence | 24 hours |

---

## 7. CATEGORY TAXONOMY

### 7.1 Primary Categories

| Code | Name | Description | Example |
|------|------|-------------|---------|
| `economy` | Economy & Jobs | Economic policy, employment, trade | "Create 1 million manufacturing jobs" |
| `healthcare` | Healthcare | Health policy, insurance, public health | "Expand Medicaid to all states" |
| `education` | Education | K-12, higher ed, student debt | "Forgive $10,000 in student loans" |
| `environment` | Environment & Climate | Climate change, conservation, energy | "Achieve net-zero emissions by 2035" |
| `criminal_justice` | Criminal Justice | Policing, prisons, courts | "End mandatory minimum sentences" |
| `immigration` | Immigration | Border policy, DACA, visas | "Create pathway to citizenship" |
| `foreign_policy` | Foreign Policy | International relations, defense | "Withdraw troops from [country]" |
| `civil_rights` | Civil Rights | Voting rights, discrimination, LGBTQ+ | "Pass the Equality Act" |
| `government` | Government Reform | Ethics, transparency, campaign finance | "Ban stock trading by members of Congress" |
| `infrastructure` | Infrastructure | Transportation, broadband, utilities | "Build high-speed rail network" |
| `taxes` | Taxes & Budget | Tax policy, spending, deficit | "Raise corporate tax rate to 28%" |
| `social_security` | Social Security & Medicare | Retirement, disability, Medicare | "Expand Medicare to age 55+" |
| `technology` | Technology | AI regulation, privacy, antitrust | "Break up Big Tech monopolies" |
| `gun_policy` | Gun Policy | Second Amendment, gun control | "Universal background checks" |

---

## 8. PUBLIC API RATE LIMITS

| Tier | Requests/Hour | Endpoints | Authentication |
|------|--------------|-----------|---------------|
| **Public (no key)** | 100 | Read-only (GET) | None |
| **Researcher** | 1,000 | All read | API key |
| **Journalist** | 2,000 | All read + evidence submission | API key + verification |
| **Academic** | 5,000 | All read + bulk export | API key + .edu verification |
| **Staff** | 10,000 | Full CRUD | JWT + role |

---

*Last Updated: 2026-06-24 | Version: 1.0*
