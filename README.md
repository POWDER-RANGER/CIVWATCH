[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=28&color=00F7FF&center=true&width=700&lines=CIVWATCH+%7C+Real-Time+Anomaly+Detection;Civic+Transparency+%2B+ML+Pipeline;Maintenance+Sprint%3A+CI%2FCD+%26+Quality)](https://git.io/typing-svg)

---

# CIVWATCH — Civic Transparency Platform

> 🔒 **Maintenance Sprint** — CIVWATCH is temporarily private while CI/CD, dependency hygiene, and quality gates are upgraded. Public access will return once the v0.4 pipeline is green.

CIVWATCH is a **civic transparency platform** that turns fragmented public records into legible, queryable feeds so residents can see how decisions are made, not just read PDFs.

It is designed as an end‑to‑end stack for:
- Collecting and normalizing civic data streams (agendas, minutes, budgets, contracts, votes).
- Indexing and enriching them with machine‑readable metadata.
- Exposing them through dashboards, APIs, and alerting workflows.

---

## ⚙️ Status

- **Repo visibility:** Private during maintenance sprint.
- **Focus areas:** CI/CD pipelines, test coverage, dependency hygiene, security scanning.[web:27]
- **Owner:** @POWDER-RANGER (systems architect • AI tooling • civic monitoring).[web:5]

Key sprint goals:
- Make `main` fully reproducible from a clean checkout.
- Enforce green CI and code‑owner review for core services (`api/`, `worker/`, `infra/`).[web:23]
- Tighten docs for install, configuration, and contribution.[web:24]

---

## 🎯 What Actually Works Right Now

This section is intentionally honest about current behavior vs. the full vision.[page:40]

| Component              | Status   | Details                                                                                           |
|------------------------|----------|---------------------------------------------------------------------------------------------------|
| **Backend Status API** | ✅ Live  | `GET /api/status` → `{status: 'ok'}` on `:3000`                                                  |
| **Frontend Bootstrap** | ✅ Renders | Static header + React scaffolding at `:4000`                                                    |
| **Analytics Module**   | ✅ Partial | `src/analytics/dataAnalyzer.ts` — mean, median, stddev calculations                             |
| **Test Stubs**         | ✅ Present | `tests/analytics/` — ready for real test implementation                                         |
| **Docker Compose**     | ⚠️ Partial | Services start; healthchecks need endpoint alignment                                            |
| **ML Service**         | ❌ Stub | Placeholder; DBSCAN + NLP planned                                                                |
| **Dashboard UI**       | ❌ Stub | React shell exists; no real components yet                                                       |
| **DB/Redis Integration** | ❌ Not Wired | PostgreSQL + Redis placeholders in compose                                                    |
| **Real‑Time Updates**  | ❌ Planned | WebSocket / streaming layer not built yet                                                      |

---

## 🗺️ Architecture Vision

```mermaid
flowchart LR
  subgraph Ingestion["📥 Data Ingestion"]
    APIs["Public APIs"]
    PDF["PDF Extraction"]
    Web["Web Scraping"]
  end

  subgraph Processing["⚙️ Processing Pipeline"]
    Clean["Data Cleaning"]
    NLP["NLP Analysis"]
    ML["DBSCAN Clustering"]
    Anomaly["Anomaly Detection"]
  end

  subgraph Storage["💾 Storage"]
    PG[("PostgreSQL")]
    Cache["Redis Cache"]
  end

  subgraph API["🔌 API Layer"]
    GraphQL["GraphQL Endpoint"]
    REST["REST API"]
  end

  subgraph Frontend["🎨 UI"]
    React["React Dashboard"]
    Maps["Interactive Maps"]
  end

  APIs --> Clean
  PDF --> Clean
  Web --> Clean
  Clean --> NLP
  Clean --> ML
  NLP --> Anomaly
  ML --> Anomaly
  Anomaly --> PG
  Anomaly --> Cache
  PG --> GraphQL
  PG --> REST
  GraphQL --> React
  REST --> React
  Cache --> Maps

