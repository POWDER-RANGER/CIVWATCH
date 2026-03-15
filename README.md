# CIVWATCH — Civic Transparency Platform

> 🔒 Maintenance Sprint — CIVWATCH is temporarily private while CI/CD, dependency hygiene, and quality gates are upgraded. Public access will return once the v0.4 pipeline is green.

CIVWATCH is a **civic transparency platform** that turns fragmented public records into legible, queryable feeds so residents can see how decisions are made, not just read PDFs.

It is designed as an end‑to‑end stack for:
- Collecting and normalizing civic data streams (agendas, minutes, budgets, contracts, votes).
- Indexing and enriching them with machine‑readable metadata.
- Exposing them through dashboards, APIs, and alerting workflows.

---

## Status

- **Repo visibility:** Private during maintenance sprint.
- **Focus areas:** CI/CD pipelines, test coverage, dependency hygiene, security scanning.[web:27]
- **Owner:** @POWDER-RANGER (systems architect • AI tooling • civic monitoring).[web:5]

Key sprint goals:
- Make `main` fully reproducible from a clean checkout.
- Enforce green CI and code‑owner review for core services.
- Document install, configuration, and contribution paths clearly.

---

## Features

- **Civic data ingestion**
  - Pluggable pipelines for agendas, minutes, budgets, contracts, and vote records.
  - Normalization into a common schema suitable for search and analysis.

- **Search & exploration**
  - Text and filter‑based search over entities, dates, and decision types.
  - Human‑readable event timelines built from raw public records.

- **Monitoring & alerts**
  - Configurable watches on topics, agencies, and locations.
  - Alert channels (email / webhook) for new or changed records.

- **Auditability**
  - Provenance metadata for each artifact (source URL, timestamp, hash).
  - Change‑history where upstream records are corrected or replaced.

(This section should be kept in sync with the public docs and UI as they evolve.)

---

## Architecture

CIVWATCH is structured as a multi‑service TypeScript/Node stack with a documented installation tutorial.[web:24]

High‑level layout (simplified):

- `api/` — HTTP/GraphQL API surface for UI and integrations.
- `worker/` — ingestion, normalization, and enrichment workers.
- `ui/` — front‑end for browsing, search, and watch configuration.
- `infra/` — infrastructure as code, deployment manifests, CI/CD config.
- `docs/` — tutorials, architecture notes, and operator runbooks.[web:24]

Refer to `docs/` for up‑to‑date diagrams and detailed component descriptions.

---

## Installation

For detailed steps, see `docs/tutorials/installation.md`.[web:24] The short version:

```bash
# 1. Clone
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# 2. Install dependencies (root monorepo)
npm install        # or pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with database, queue, and auth settings

# 4. Verify baseline
npm run lint
npm test

# 5. Run dev stack
npm run dev
