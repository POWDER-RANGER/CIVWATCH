[![Header](https://capsule-render.vercel.app/api?type=waving&color=0:0D1117,35:0D2818,70:1B5E20,100:00C853&height=300&section=header&text=CIVWATCH&fontSize=70&fontColor=00FF88&animation=fadeIn&fontAlignY=42&desc=Adversarial+Civic+Infrastructure+%E2%80%94+BETA&descColor=69F0AE&descSize=18&descAlignY=64)](https://github.com/POWDER-RANGER/CIVWATCH)

![](https://img.shields.io/badge/STATUS-BETA-FF9100?style=for-the-badge&labelColor=0D1117)
![](https://img.shields.io/badge/LICENSE-MIT-00C853?style=for-the-badge&labelColor=0D1117)

**CIVWATCH** is a civic transparency platform for monitoring government and political processes: political finance, lobbying influence, voting records, and public accountability.

> **Status: legacy integration source.** This repository is retained for backend/ML/operations assets being consolidated into CivilianIntelligence; its declared architecture and runtime status are not the unified product source of truth. Production claims have been downgraded to match reality. See the tables below.

## Current State

| Area | Status |
|------|--------|
| Architecture & planning docs | ✅ Complete (see below) |
| Backend / frontend / ML | 🟡 Substantial legacy implementation; not the unified production surface |
| ML anomaly detection | 🟡 Implemented in `ml/`, pending unified acceptance |
| Data ingestion pipelines | 🟡 Legacy implementation; being consolidated into CIVINTELLIGENCE |
| Security hardening | 🟡 Partial; container boundary hardened in this branch, security scans still require remediation |

## Consolidation

`CivilianIntelligence` is the system of record for the unified application. Use this repository as a migration source for political-finance, ML, ingestion, security, and operations components; do not create a second production integration surface here.

## Documentation Map

| Document | Purpose |
|----------|---------|
| [START_HERE.md](./START_HERE.md) | Execution plan — start with PR0 & PR1 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and data flow |
| [API.md](./API.md) | Planned endpoints |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | Threat model |
| [DATA_LINEAGE.md](./DATA_LINEAGE.md) | Data provenance |
| [RESPONSIBLE_DISCLOSURE.md](./RESPONSIBLE_DISCLOSURE.md) | Disclosure policy |
| [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | Master timeline |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment guide |

## Planned Modules

- **Political Finance Monitor** — campaign contributions, PAC activity, dark money flows
- **Lobbying Tracker** — LD-2/LD-203 filings and influence networks
- **Voting Record Correlator** — cross-reference votes with contributions and lobbying contacts
- **Promise Tracker** — political promises extracted, monitored, and scored with evidence

## Core Principles

- Public-interest first; neutral analysis over political spin
- Evidence-based reporting; transparent scoring and traceable context
- Defensive use only
---

## 🔔 Consolidation Notice

CIVINTELLIGENCE is being consolidated into the unified CIVINTELLIGENCE platform. See the
[consolidation charter and plan](https://github.com/POWDER-RANGER/CivilianIntelligence/blob/main/docs/CIVINTELLIGENCE.md).

## Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Curtis_Farrar-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/curtis-farrar-g6b)
[![GitHub](https://img.shields.io/badge/GitHub-POWDER--RANGER-181717?style=flat&logo=github)](https://github.com/POWDER-RANGER)

---

**Built for citizens, by citizens. Transparency is not optional.**

<div align="center">

[![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:00C853,35:0D2818,70:0D2818,100:0D1117&height=150&section=footer)](https://github.com/POWDER-RANGER/CIVWATCH)

</div>
