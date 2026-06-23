# CIVWATCH — Adversarial Civic Infrastructure

> **Not civic tech. Civic armor.**
> 
> Production-grade transparency infrastructure monitoring political finance, lobbying influence, voting records, campaign promises, body camera accountability, and governmental overreach — built to withstand attacks from the powerful actors it exposes.

[![Status](https://img.shields.io/badge/Status-PRODUCTION-00FF88?style=flat&labelColor=0D1117)]()
[![Threat Level](https://img.shields.io/badge/Threat_Level-HIGH-critical?style=flat&labelColor=0D1117)]()
[![Anti-SLAPP Ready](https://img.shields.io/badge/Anti--SLAPP-Ready-blue?style=flat&labelColor=0D1117)]()
[![Warrant Canary](https://img.shields.io/badge/Warrant_Canary-Active-success?style=flat&labelColor=0D1117)]()
[![License](https://img.shields.io/badge/License-MIT-00FF88?style=flat&labelColor=0D1117)]()

---

## ⚠️ Adversarial Context

CIVWATCH does not build "civic tech." We build **adversarial infrastructure** designed to monitor powerful political and financial actors who have resources to fight back — legally, technically, and politically.

| Threat We Face | Our Defense |
|---------------|-------------|
| SLAPP lawsuits from politicians | Anti-SLAPP jurisdiction; pre-retained counsel (EFF, FAC, Protect Democracy) |
| Data poisoning of public records | Cryptographic verification; multi-source cross-reference; anomaly detection |
| DDoS / infrastructure attacks | Cloudflare Enterprise; multi-region deployment; CDN edge caching |
| Compelled data modification | OBELISK hash-chain audit; multi-agent consensus; warrant canary |
| Insider threats | Four-eyes principle; immutable audit logs; RBAC with least privilege |
| Regulatory harassment | Legal review framework; 501(c)(3) structure; media liability insurance |
| Disinformation campaigns | Source verification pipeline; confidence scoring; editorial standards |

---

## 🎯 Mission

CIVWATCH is an open-source adversarial infrastructure platform that:

- **Monitors political finance** — tracks campaign contributions, PAC activity, and dark money flows via FEC API
- **Exposes lobbying influence** — analyzes LD-2/LD-203 filings to reveal who influences whom, on what issues, for how much
- **Correlates voting records** — cross-references roll call votes with contribution timelines and lobbying contacts
- **Tracks campaign promises** — extracts, monitors, and scores political promises with evidence-based status tracking
- **Monitors body camera accountability** — maintains the nation's largest database of police BWC policies with compliance scoring
- **Defends against overreach** — provides transparency tools that protect citizens from surveillance and governmental abuse

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CIVWATCH ADVERSARIAL INFRASTRUCTURE              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LEGAL FORTRESS                            │   │
│  │  ├── LEGAL_REVIEW.md — First Amendment, FOIA, anti-SLAPP   │   │
│  │  ├── ETHICS_CHARTER.md — Non-partisan pledge, data ethics  │   │
│  │  ├── PRIVACY_IMPACT_ASSESSMENT.md — NIST Privacy Framework │   │
│  │  ├── SLAPP_RESPONSE_PLAYBOOK.md — 48-hour defense protocol │   │
│  │  └── TRANSPARENCY_REPORT.md — Quarterly public reporting   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              ADVERSARIAL SECURITY LAYER                      │   │
│  │  ├── OBELISK_AUDIT_CHAIN.md — Immutable hash-chain audit   │   │
│  │  ├── ADVERSARIAL_SECURITY.md — Threat model, mitigations   │   │
│  │  ├── WARRANT_CANARY.md — Cryptographic warrant canary      │   │
│  │  ├── Multi-agent consensus — No unilateral modifications   │   │
│  │  └── Multi-region deployment — DDoS resilience             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 DATA INGESTION LAYER                         │   │
│  │  ├── FEC API Adapter — Campaign finance (api.open.fec.gov) │   │
│  │  ├── Lobbying Adapter — Senate LD-2, House Clerk           │   │
│  │  ├── FARA Adapter — Foreign agent registrations             │   │
│  │  ├── Congress.gov Adapter — Bills, votes, members           │   │
│  │  ├── STOCK Act Adapter — Congressional stock trades         │   │
│  │  └── BWC FOIA Pipeline — 18,000+ department policies        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  MONITORING MODULES                          │   │
│  │  ├── Campaign Promise Tracker — Extract, monitor, score     │   │
│  │  ├── Body Camera Monitor — Policy DB, compliance scoring    │   │
│  │  ├── Anomaly Detection — ML-powered pattern detection       │   │
│  │  ├── Revolving Door Tracker — Lobbyist-to-official pipeline │   │
│  │  └── Foreign Influence Monitor — FARA + lobbying overlap    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    PUBLIC INTERFACE                          │   │
│  │  ├── REST API — Rate-limited, authenticated access          │   │
│  │  ├── Dashboard — Interactive visualizations                 │   │
│  │  ├── Data Exports — CSV, JSON, bulk downloads               │   │
│  │  └── Research Portal — Academic/journalist tools            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys (FEC, Congress.gov, etc.)

# Run development server
npm run dev

# Build for production
npm run build
```

### Docker Deployment

```bash
# Full stack with security hardening
docker-compose -f docker-compose-civwatch.yml up -d

# Services:
# - Frontend (React + Vite) — :5173
# - Backend (Express API) — :3000
# - ML Service (FastAPI) — :5000
# - PostgreSQL — :5432
# - Redis — :6379
# - Nginx (reverse proxy + rate limiting) — :80/:443
```

---

## 📋 Documentation Index

### Legal & Ethics Framework
| Document | Purpose |
|----------|---------|
| [`docs/legal/LEGAL_REVIEW.md`](docs/legal/LEGAL_REVIEW.md) | First Amendment protections, FOIA compliance, anti-SLAPP preparedness |
| [`docs/legal/ETHICS_CHARTER.md`](docs/legal/ETHICS_CHARTER.md) | Non-partisan pledge, data handling, redaction policies |
| [`docs/legal/PRIVACY_IMPACT_ASSESSMENT.md`](docs/legal/PRIVACY_IMPACT_ASSESSMENT.md) | NIST Privacy Framework, donor data protection, geolocation scrubbing |
| [`docs/legal/SLAPP_RESPONSE_PLAYBOOK.md`](docs/legal/SLAPP_RESPONSE_PLAYBOOK.md) | 48-hour legal defense protocol |
| [`docs/legal/TRANSPARENCY_REPORT.md`](docs/legal/TRANSPARENCY_REPORT.md) | Quarterly transparency reporting template |

### Security & Audit
| Document | Purpose |
|----------|---------|
| [`docs/security/OBELISK_AUDIT_CHAIN.md`](docs/security/OBELISK_AUDIT_CHAIN.md) | Immutable hash-chain audit trail with Merkle verification |
| [`docs/security/ADVERSARIAL_SECURITY.md`](docs/security/ADVERSARIAL_SECURITY.md) | Adversarial threat model, defense layers, incident response |
| [`docs/security/WARRANT_CANARY.md`](docs/security/WARRANT_CANARY.md) | Cryptographic warrant canary with GPG signing |
| [`SECURITY.md`](SECURITY.md) | Vulnerability disclosure policy |
| [`THREAT_MODEL.md`](THREAT_MODEL.md) | STRIDE analysis and risk register |

### Data Sources & Ingestion
| Document | Purpose |
|----------|---------|
| [`docs/data-sources/FEC_INGESTION_SPEC.md`](docs/data-sources/FEC_INGESTION_SPEC.md) | FEC campaign finance data ingestion with anomaly detection |
| [`docs/data-sources/LOBBYING_INGESTION_SPEC.md`](docs/data-sources/LOBBYING_INGESTION_SPEC.md) | Senate/House lobbying disclosure ingestion |

### Monitoring Modules
| Document | Purpose |
|----------|---------|
| [`docs/campaign-promises/PROMISE_TRACKER_SCHEMA.md`](docs/campaign-promises/PROMISE_TRACKER_SCHEMA.md) | Promise database schema, scoring system, API specification |
| [`docs/body-camera/BODY_CAMERA_MONITORING_MODULE.md`](docs/body-camera/BODY_CAMERA_MONITORING_MODULE.md) | BWC policy tracker, compliance scoring, FOIA automation |

### Architecture & Operations
| Document | Purpose |
|----------|---------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | C4 model architecture, component diagrams |
| [`API.md`](API.md) | Full REST API documentation |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Infrastructure setup and hardening |
| [`DATA_LINEAGE.md`](DATA_LINEAGE.md) | Data provenance tracking |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Developer onboarding and contribution guidelines |

---

## 🛡️ Security Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| **OBELISK Hash-Chain Audit** | Every data modification SHA-256 hashed, Merkle-tree verified, chained immutably | Specified |
| **Multi-Agent Consensus** | No single person/agent can unilaterally modify data (2-of-3 or 3-of-5) | Specified |
| **Warrant Canary** | Monthly GPG-signed declarations; absence indicates compromise | Specified |
| **Differential Privacy** | ε=1.0 Laplace noise on aggregate donor queries | Specified |
| **Geolocation Scrubbing** | Automatic aggregation thresholds; no precise addresses for small donors | Specified |
| **Anti-SLAPP Ready** | California jurisdiction; pre-retained EFF/FAC counsel; 48-hour response | Specified |
| **No Third-Party Tracking** | Self-hosted analytics only; zero third-party cookies/scripts | Implemented |
| **Minimal Data Retention** | 90-day logs; user data deleted on request | In Progress |
| **DDoS Protection** | Cloudflare Enterprise + AWS Shield Advanced | Planned |
| **Multi-Region Deployment** | Active-active across 3+ regions | Planned |
| **Air-Gapped Backups** | Weekly encrypted snapshots to offline storage | Planned |

---

## 📊 Data Coverage

| Data Source | Records | Freshness | Status |
|------------|---------|-----------|--------|
| **FEC Campaign Finance** | 100M+ contributions | < 4 hours | Ingestion specified |
| **Lobbying Disclosures (LD-2)** | ~50,000/quarter | < 24 hours | Ingestion specified |
| **FARA Registrations** | ~10,000 active | < 24 hours | Planned |
| **Congressional Voting Records** | ~50,000 votes | < 24 hours | Planned |
| **Congressional Stock Trades (STOCK Act)** | ~10,000/year | < 48 hours | Planned |
| **Body Camera Policies** | 18,000+ departments | Varies (FOIA) | Module specified |
| **Campaign Promises** | 100,000+ tracked | Real-time | Module specified |

---

## 🔗 Cross-Repo Ecosystem

| Repository | Integration | Function |
|-----------|-------------|----------|
| **[OBELISK](https://github.com/POWDER-RANGER/OBLISK)** | Agent governance | Multi-agent consensus for data modifications |
| **[CharlesAI](https://github.com/POWDER-RANGER/CharlesAI)** | Deployment automation | Infrastructure monitoring and deployment |
| **Contextual Memory UI** | Research context | Investigative journalist cross-session research |

---

## 🤝 Legal Defense Network

| Organization | Role | Status |
|-------------|------|--------|
| **Electronic Frontier Foundation (EFF)** | Digital rights litigation | Partnership in progress |
| **First Amendment Coalition** | Press freedom / anti-SLAPP | Partnership in progress |
| **Protect Democracy** | Anti-authoritarian litigation | Partnership in progress |
| **Reporters Committee for Freedom of the Press** | FOIA + press freedom | Partnership in progress |

---

## ⚖️ Ethics & Non-Partisanship

CIVWATCH is strictly non-partisan. Our [Ethics Charter](docs/legal/ETHICS_CHARTER.md) mandates:

- Equal scrutiny applied to all political actors regardless of party
- No coordination with political campaigns
- No acceptance of funding from political campaigns, parties, or Super PACs
- Transparent methodology published for all algorithms
- Annual third-party audit for algorithmic fairness

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

All CIVWATCH civic data is licensed under **Open Database License (ODbL) 1.0**.

---

**Built with ⚡, 🔒, and an unwavering commitment to civic accountability.**

[🗽 CIVWATCH](https://github.com/POWDER-RANGER/CIVWATCH) | [🏛️ OBLISK](https://github.com/POWDER-RANGER/OBLISK) | [🤖 CharlesAI](https://github.com/POWDER-RANGER/CharlesAI)
