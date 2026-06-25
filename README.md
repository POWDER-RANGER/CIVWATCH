<!-- ══════════════════════════════════════════ CIVWATCH HEADER -->
<div align="center">

[![Header](https://capsule-render.vercel.app/api?type=waving&color=0:0D1117,35:0D2818,70:1B5E20,100:00C853&height=300&section=header&text=CIVWATCH&fontSize=80&fontColor=00FF88&animation=fadeIn&fontAlignY=42&desc=Adversarial+Civic+Infrastructure+%E2%80%94+Not+Civic+Tech.+Civic+Armor.&descColor=69F0AE&descSize=18&descAlignY=64)](https://github.com/POWDER-RANGER/CIVWATCH)

<br>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=18&duration=2600&pause=700&color=00FF88&center=true&vCenter=true&width=900&lines=MONITORING+POLITICAL+FINANCE+%E2%80%94+EXPOSING+LOBBYING+INFLUENCE;TRACKING+CAMPAIGN+PROMISES+%E2%80%94+BWC+ACCOUNTABILITY;BUILT+TO+WITHSTAND+ATTACKS+FROM+ACTORS+IT+EXPOSES;Anti-SLAPP+Ready+%E2%80%94+Cryptographic+Verification+%E2%80%94+Warrant+Canary+Active)](https://github.com/POWDER-RANGER/CIVWATCH)

<br>

![](https://img.shields.io/badge/STATUS-PRODUCTION-00FF88?style=for-the-badge&labelColor=0D1117)
![](https://img.shields.io/badge/THREAT_LEVEL-HIGH-FF6D00?style=for-the-badge&labelColor=0D1117)
![](https://img.shields.io/badge/ANTI--SLAPP-READY-2979FF?style=for-the-badge&labelColor=0D1117)
![](https://img.shields.io/badge/WARRANT_CANARY-ACTIVE-00E676?style=for-the-badge&labelColor=0D1117)
![](https://img.shields.io/badge/LICENSE-MIT+ODbL-00FF88?style=for-the-badge&labelColor=0D1117)

</div>

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
╔═══════════════════════════════════════════════════════════════════════╗
║                    CIVWATCH ADVERSARIAL INFRASTRUCTURE               ║
║                                                                      ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │                    LEGAL FORTRESS                             │   ║
║  │  ├── LEGAL_REVIEW.md — First Amendment, FOIA, anti-SLAPP    │   ║
║  │  ├── ETHICS_CHARTER.md — Non-partisan pledge, data ethics   │   ║
║  │  ├── PRIVACY_IMPACT_ASSESSMENT.md — NIST Privacy Framework  │   ║
║  │  ├── SLAPP_RESPONSE_PLAYBOOK.md — 48-hour defense protocol  │   ║
║  │  └── TRANSPARENCY_REPORT.md — Quarterly public reporting    │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                              │                                       ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │              ADVERSARIAL SECURITY LAYER                       │   ║
║  │  ├── OBELISK_AUDIT_CHAIN.md — Immutable hash-chain audit    │   ║
║  │  ├── ADVERSARIAL_SECURITY.md — Threat model, mitigations    │   ║
║  │  ├── WARRANT_CANARY.md — Cryptographic warrant canary       │   ║
║  │  ├── Multi-agent consensus — No unilateral modifications    │   ║
║  │  └── Multi-region deployment — DDoS resilience              │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                              │                                       ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │                 DATA INGESTION LAYER                          │   ║
║  │  ├── FEC API Adapter — Campaign finance (api.open.fec.gov)  │   ║
║  │  ├── Lobbying Adapter — Senate LD-2, House Clerk            │   ║
║  │  ├── FARA Adapter — Foreign agent registrations              │   ║
║  │  ├── Congress.gov Adapter — Bills, votes, members            │   ║
║  │  ├── STOCK Act Adapter — Congressional stock trades          │   ║
║  │  └── BWC FOIA Pipeline — 18,000+ department policies         │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                              │                                       ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │                  MONITORING MODULES                           │   ║
║  │  ├── Campaign Promise Tracker — Extract, monitor, score      │   ║
║  │  ├── Body Camera Monitor — Policy DB, compliance scoring     │   ║
║  │  ├── Anomaly Detection — ML-powered pattern detection        │   ║
║  │  ├── Revolving Door Tracker — Lobbyist-to-official pipeline  │   ║
║  │  └── Foreign Influence Monitor — FARA + lobbying overlap     │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                              │                                       ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │                    PUBLIC INTERFACE                            │   ║
║  │  ├── REST API — Rate-limited, authenticated access           │   ║
║  │  ├── Dashboard — Interactive visualizations                  │   ║
║  │  ├── Data Exports — CSV, JSON, bulk downloads                │   ║
║  │  └── Research Portal — Academic/journalist tools             │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════╝
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

## 🛡️ Security Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| **OBELISK Hash-Chain Audit** | SHA-256 hashed, Merkle-tree verified, chained immutably | ✅ Specified |
| **Multi-Agent Consensus** | 2-of-3 or 3-of-5 — no unilateral modifications | ✅ Specified |
| **Warrant Canary** | Monthly GPG-signed declarations | ✅ Specified |
| **Differential Privacy** | ε=1.0 Laplace noise on aggregate queries | ✅ Specified |
| **Anti-SLAPP Ready** | CA jurisdiction; pre-retained EFF/FAC counsel | ✅ Specified |
| **No Third-Party Tracking** | Self-hosted analytics only | ✅ Implemented |

---

## 📈 GitHub Stats

<div align="center">

![CIVWATCH Stats](https://github-readme-stats.vercel.app/api?username=POWDER-RANGER&repo=CIVWATCH&show_icons=true&theme=merko&hide_border=true)

</div>

---

## 🔗 POWDER-RANGER Ecosystem

### 🌐 Live .io Pages
| Project | Link | Description |
|---------|------|-------------|
| **Main Portfolio** | [powder-ranger.github.io](https://powder-ranger.github.io) | Master portfolio with all 46 repos |
| **CIVWATCH** | [powder-ranger.github.io/CIVWATCH](https://powder-ranger.github.io/CIVWATCH) | Civic transparency platform demo |
| **OBLISK** | [powder-ranger.github.io/OBLISK](https://powder-ranger.github.io/OBLISK) | Multi-agent AI orchestration |
| **AI Nexus** | [powder-ranger.github.io/ai-nexus](https://powder-ranger.github.io/ai-nexus) | Browser-based AI platform |
| **Dollar Gravity** | [powder-ranger.github.io/dollar-gravity-framework](https://powder-ranger.github.io/dollar-gravity-framework) | USD gravity visualization |

### 🔧 Core Repositories
| Repository | Language | Purpose |
|-----------|----------|---------|
| **[CIVWATCH](https://github.com/POWDER-RANGER/CIVWATCH)** | TypeScript | Civic transparency platform (this repo) |
| **[OBLISK](https://github.com/POWDER-RANGER/OBLISK)** | Python | Multi-agent AI with encrypted vaults |
| **[RED-AGENT-GOV](https://github.com/POWDER-RANGER/RED-AGENT-GOV)** | Python | Governance-enforced agent engine |
| **[CharlesAI](https://github.com/POWDER-RANGER/CharlesAI)** | PowerShell | COMET Agent with memory & orchestration |
| **[OBELISK-Enterprise](https://github.com/POWDER-RANGER/OBELISK-Enterprise)** | Python | $2.5M AI Governance Platform |
| **[NSO Kryptonite](https://github.com/POWDER-RANGER/nso-kryptonite-platform)** | TypeScript | Adversarial defense command center |
| **[AI Nexus](https://github.com/POWDER-RANGER/ai-nexus)** | JavaScript | Browser-based complete AI platform |
| **[Guiding Light AI](https://github.com/POWDER-RANGER/guiding-light-ai)** | Rust | Values-to-policies CLI tool |
| **[Dollar Gravity](https://github.com/POWDER-RANGER/dollar-gravity-framework)** | JavaScript | USD-centric finance-security dashboard |
| **[Dojin D](https://github.com/POWDER-RANGER/dojin-d)** | TypeScript | ECS combat simulation engine |
| **[Contextual Memory UI](https://github.com/POWDER-RANGER/contextual-memory-ui)** | JavaScript | AI memory infrastructure platform |
| **[OBELISK-Desktop-AI](https://github.com/POWDER-RANGER/OBELISK-Desktop-AI)** | PowerShell | Desktop AI orchestrator |
| **[POWDER-RANGER Bot](https://github.com/POWDER-RANGER/powder-ranger-bot)** | Python | Autonomous GTA V + MGS5 agent |
| **[CIVWATCH Cell Titan](https://github.com/POWDER-RANGER/civwatch-cell-titan)** | Shell | RF observability platform |
| **[CIVWATCH v3](https://github.com/POWDER-RANGER/civwatch-v3)** | HTML | Unified RF observability |

### 🎮 Creative & Research
| Repository | Language | Purpose |
|-----------|----------|---------|
| **[RainGod Comfy Studio](https://github.com/POWDER-RANGER/RainGod-Comfy-Studio)** | Python | AI music workflow studio |
| **[Systems Architecture Portfolio](https://github.com/POWDER-RANGER/systems-architecture-portfolio)** | Markdown | Master systems architecture docs |

---

## 🤝 Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Curtis_Farrar-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/curtis-farrar-g6b)
[![GitHub](https://img.shields.io/badge/GitHub-POWDER--RANGER-181717?style=flat&logo=github)](https://github.com/POWDER-RANGER)
[![Portfolio](https://img.shields.io/badge/Portfolio-powder--ranger.github.io-00FF88?style=flat&logo=githubpages)](https://powder-ranger.github.io)
[![ORCID](https://img.shields.io/badge/ORCID-0009--0008--9273--2458-A6CE39?style=flat&logo=orcid)](https://orcid.org/0009-0008-9273-2458)

---

## ⚖️ Ethics & Non-Partisanship

CIVWATCH is strictly non-partisan. Our [Ethics Charter](docs/legal/ETHICS_CHARTER.md) mandates equal scrutiny for all political actors, no coordination with campaigns, no funding from political campaigns or PACs, transparent methodology, and annual third-party audit for algorithmic fairness.

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details. All CIVWATCH civic data is licensed under **Open Database License (ODbL) 1.0**.

---

**Built with ⚡, 🔒, and an unwavering commitment to civic accountability.**

<div align="center">

[![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:00C853,35:1B5E20,70:0D2818,100:0D1117&height=150&section=footer)](https://github.com/POWDER-RANGER/CIVWATCH)

</div>
