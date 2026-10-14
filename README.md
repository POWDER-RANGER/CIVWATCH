<p>
  <img src="assets/brand/civwatch-lockup-ink.svg#gh-light-mode-only" width="220" alt="CIVWATCH">
  <img src="assets/brand/civwatch-lockup-reversed.svg#gh-dark-mode-only" width="220" alt="CIVWATCH">
</p>

**Public evidence about surveillance infrastructure: who is watching a place, who paid for it, and how to challenge it.**

This repository hosts the **CIVWATCH project site** ([powder-ranger.github.io/CIVWATCH](https://powder-ranger.github.io/CIVWATCH/)) and legacy backend, ML, ingest and operations material. The live web app is **https://civintelligence.onrender.com**, built from [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence), which is the system of record.

> CIVWATCH documents publicly visible infrastructure and public records about government surveillance technology. Every record shows its source and verification status. We do not access camera feeds, intercept communications, or track individuals.

## Public site

**https://powder-ranger.github.io/CIVWATCH/** is the front door for the whole ecosystem: what CIVINTELLIGENCE does, which parts are running, and the standards for every claim. The [status page](https://powder-ranger.github.io/CIVWATCH/status.html) shows what each public URL actually returned, checked every six hours.

The site source is [`site/`](./site). The list of checked URLs is [`site/data/endpoints.json`](./site/data/endpoints.json); the checker is [`scripts/site/probe.mjs`](./scripts/site/probe.mjs). Run it locally with `node scripts/site/probe.mjs`, then serve `site/` with any static server.

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

`index.html` is the GitHub Pages site, published by `.github/workflows/static.yml` on every push to `main`. It follows **CIVWATCH Design Standard v2** (IBM Plex Sans, Source Serif 4, IBM Plex Mono; editorial light and ops dark themes; no glow, no neon). Brand files are in [`assets/brand/`](./assets/brand).

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

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
- [THREAT_MODEL.md](./THREAT_MODEL.md)
- [DATA_LINEAGE.md](./DATA_LINEAGE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY.md](./SECURITY.md)
- [STATUS.md](./STATUS.md)

For the unified contract, see [CROSS_REPO_INTEGRATION.md](https://github.com/POWDER-RANGER/CivilianIntelligence/blob/main/docs/CROSS_REPO_INTEGRATION.md).

## Related repositories

- [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence) — system of record
- [civwatch-watchtower](https://github.com/POWDER-RANGER/civwatch-watchtower) — CIVWATCH Platform services
- [civwatch-cell-titan](https://github.com/POWDER-RANGER/civwatch-cell-titan) — CIVWATCH Cell Monitor
- [CIVWATCH App](https://github.com/POWDER-RANGER/civwatch-app) — Flutter client
- [Community](https://github.com/POWDER-RANGER/civwatch-powder-ranger) — community pointer

## License

MIT


---

## Public platform status — October 2026

**The CIVWATCH web app is live and its REST/API surface is active.**

**Public site:** https://civintelligence.onrender.com

The web platform is now the working reference implementation for the CIVWATCH ecosystem: the core application, public-data surfaces, evidence/provenance model, specialized pillars, and integration boundaries are being exercised through the deployed web app.

### Applications are next

With the web application and REST contracts now active, the remaining client work is primarily **productization and platform packaging**, not rebuilding the platform from scratch. Native applications for the major target platforms are planned and will be coming soon.

The application layer can consume the same stable contracts already used by the web experience:

- **Android**
- **iOS**
- **Windows**
- **Linux**
- additional platform clients as the shared API contract matures

The existing Flutter client and service boundaries give the ecosystem a head start. Mobile/desktop applications can progressively adopt the established authentication, API, provenance, map, evidence, and desk contracts rather than duplicating backend logic.

### How quickly this came together

The current milestone is notable because the ecosystem moved from a multi-repository architecture and integration plan to a functioning public platform in a short development window. The difficult architectural work — ownership boundaries, public-data ingestion, REST contracts, evidence/provenance rules, Platform and Cell Monitor integration, and the user-facing desk model — is already substantially established.

That means the next step should be treated as **client delivery on top of an operating platform**. The web application is the reference surface; native clients become additional presentation and interaction layers over the same contracts.

> **Build once at the platform layer. Deliver many clients at the edge.**

### Ecosystem rule

CivilianIntelligence remains the system of record. Specialized repositories retain clear ownership of their domains, while clients consume stable public/service contracts. Legacy and predecessor repositories remain valuable migration/reference material but are not silently represented as unified production capabilities.

**Status discipline:** live means exposed and usable; available means implemented and integrated; in progress means actively being built; planned means not yet shipped. No synthetic or unavailable source is represented as live evidence.
