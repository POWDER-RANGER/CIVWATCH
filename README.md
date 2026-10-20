<p>
  <img src="site/assets/brand/civwatch-lockup-ink.svg#gh-light-mode-only" width="220" alt="CIVWATCH">
  <img src="site/assets/brand/civwatch-lockup-reversed.svg#gh-dark-mode-only" width="220" alt="CIVWATCH">
</p>

**Public evidence about surveillance infrastructure: who is watching a place, who paid for it, and how to challenge it.**

This repository hosts the **CIVWATCH project site** ([powder-ranger.github.io/CIVWATCH](https://powder-ranger.github.io/CIVWATCH/)) and legacy backend, ML, ingest and operations material. The live web app is **https://civintelligence.onrender.com**, built from [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence), which is the system of record.

> CIVWATCH documents publicly visible infrastructure and public records about government surveillance technology. Every record shows its source and verification status. We do not access camera feeds, intercept communications, or track individuals.

## Products

| Product | What it does | Code |
|---|---|---|
| **CIVWATCH Map** | Documented ALPRs, acoustic sensors and view cones, with sources | [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence) |
| **CIVWATCH Record** | Contracts, legislation and records with provenance | [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence) |
| **CIVWATCH Cell Monitor** | Your own device's cell environment, with a signed evidence log | [civwatch-cell-titan](https://github.com/POWDER-RANGER/civwatch-cell-titan) |
| **CIVWATCH Globe** | National and global view of documented deployments | [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence) |
| **CIVWATCH Platform** | Shared backend services | [civwatch-watchtower](https://github.com/POWDER-RANGER/civwatch-watchtower) |

Retired names: CIVINT / CIVINTELLIGENCE, Watchtower (repository codename only), CELL TITAN, God's Eye, VEIL.

## Project site

The GitHub Pages site lives in [`site/`](./site) and follows **CIVWATCH Design Standard v2** (IBM Plex Sans, Source Serif 4, IBM Plex Mono; editorial light and ops dark themes; no glow, no neon). Brand files are in [`site/assets/brand/`](./site/assets/brand).

| Page | What it shows |
|---|---|
| [Home](https://powder-ranger.github.io/CIVWATCH/) | Products, how we work, where things stand |
| [Status](https://powder-ranger.github.io/CIVWATCH/status.html) | What every public URL returned on its last check |
| [Standards](https://powder-ranger.github.io/CIVWATCH/standards.html) | Status words, verification states, sources, corrections |

`.github/workflows/static.yml` publishes only `site/`, on pushes that touch it and every six hours. Each run first runs [`scripts/site/probe.mjs`](./scripts/site/probe.mjs), which requests every URL in [`site/data/endpoints.json`](./site/data/endpoints.json) and writes `site/data/status.json`. To preview locally: `node scripts/site/probe.mjs`, then serve `site/` with any static server.

GitHub Pages must be set to **Source: GitHub Actions**. The root `index.html` is a redirect kept only for the legacy branch build.

## What else lives here

Legacy material retained while it is consolidated into CivilianIntelligence:

- backend API infrastructure
- PostgreSQL / Redis orchestration
- civic-record ingestion
- statistical review rules and ML
- analytics and alerting
- political-finance source material
- security and deployment documentation

New production integration terminates in CivilianIntelligence, not here.

## Local legacy stack

The Docker-based legacy stack contains:

- PostgreSQL
- Redis
- backend API
- ML service
- scraper
- frontend
- nginx reverse proxy

The stack is retained for migration/reference work and is **not** the acceptance environment for the CIVWATCH web app.

## Quick start

Create an explicit local secrets file:

~~~bash
cp .env.example .env
~~~

Set strong values for:

- CIVWATCH_DB_PASSWORD
- JWT_SECRET
- REFRESH_TOKEN_SECRET

Then:

~~~bash
docker compose up --build
~~~

The integration branch binds legacy service ports to localhost and does not directly expose internal ML/scraper ports.

## Security posture

The integration branch:

- removes the tracked root .env
- requires explicit database/JWT/refresh secrets in Compose
- reduces host port exposure to localhost
- keeps internal ML/scraper services off the host surface
- retains security scanners as release gates

**Important:** deleting a secret from the working tree does not erase Git history. Any real credentials ever committed to repository history should be rotated.

## Migration rule

When functionality is promoted into CivilianIntelligence, move its canonical contract, tests, and production integration there. Avoid creating a new cross-repository production dependency on this legacy hub.

## Documentation

- [Repository documentation standard](https://github.com/POWDER-RANGER/CivilianIntelligence/blob/main/docs/DOCUMENTATION_STANDARD.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
- [THREAT_MODEL.md](./THREAT_MODEL.md)
- [DATA_LINEAGE.md](./DATA_LINEAGE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY.md](./SECURITY.md)
- [STATUS.md](./STATUS.md) — historical snapshot; verify current state using live probes.

### Historical planning records

[START_HERE.md](./START_HERE.md), [NEXT_PHASE.md](./NEXT_PHASE.md), [PR0_DAMAGE_CONTROL.md](./PR0_DAMAGE_CONTROL.md), [PR1_DOCKER_GREEN.md](./PR1_DOCKER_GREEN.md), [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md), and [RESEARCH_VALIDATION.md](./RESEARCH_VALIDATION.md) are retained for context. Their original dates, checklists, and milestone claims are not current deployment approval; verify before reusing them.

## Related repositories

- [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence) — system of record
- [civwatch-watchtower](https://github.com/POWDER-RANGER/civwatch-watchtower) — CIVWATCH Platform services
- [civwatch-cell-titan](https://github.com/POWDER-RANGER/civwatch-cell-titan) — CIVWATCH Cell Monitor
- [CIVWATCH App](https://github.com/POWDER-RANGER/civwatch-app) — Flutter client
- [Community](https://github.com/POWDER-RANGER/civwatch-powder-ranger) — community pointer

## License

MIT


---
