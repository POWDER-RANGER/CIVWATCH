# CIVWATCH

**Legacy civic transparency, anomaly-detection, ingestion, and operations source for the unified CIVINTELLIGENCE platform.**

> **Status: migration/source repository.**
> **CivilianIntelligence is the system of record.**
> This repository is retained for components being consolidated into the unified platform and is not a second production integration hub.

## What belongs here

This repository contains legacy/subsystem material covering:

- backend API infrastructure
- PostgreSQL / Redis orchestration
- civic-record ingestion
- anomaly detection and ML
- analytics and alerting
- political-finance source material
- security and deployment documentation

New unified production integration should terminate in **CivilianIntelligence**, not a parallel CIVWATCH hub.

## Architecture position

~~~text
                 CIVINTELLIGENCE
                 system of record
                        |
          +-------------+-------------+
          |                           |
     Watchtower                  Cell Titan
    map/oversight               RF evidence
          |
       clients / integrations

CIVWATCH (this repo)
       |
       +--> migration/source material
            backend / ML / ingestion / ops
~~~

## Local legacy stack

The Docker-based legacy stack contains:

- PostgreSQL
- Redis
- backend API
- ML service
- scraper
- frontend
- nginx reverse proxy

The stack is retained for migration/reference work and is **not** the acceptance environment for the unified CIVINTELLIGENCE product.

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

When functionality is promoted into CIVINTELLIGENCE, move its canonical contract, tests, and production integration there. Avoid creating a new cross-repository production dependency on this legacy hub.

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
- [Watchtower](https://github.com/POWDER-RANGER/civwatch-watchtower) — geospatial pillar
- [Cell Titan](https://github.com/POWDER-RANGER/civwatch-cell-titan) — RF/evidence pillar
- [CIVWATCH App](https://github.com/POWDER-RANGER/civwatch-app) — operator client
- [Community](https://github.com/POWDER-RANGER/civwatch-powder-ranger) — community pointer

## License

MIT


---

## Public platform status — October 2026

**CIVINTELLIGENCE is live on the public web and its REST/API surface is active.**

**Public site:** https://civintelligence.onrender.com

The web platform is now the working reference implementation for the CIVWATCH ecosystem: the core application, public-data surfaces, evidence/provenance model, specialized pillars, and integration boundaries are being exercised through the deployed CIVINTELLIGENCE service.

### Applications are next

With the web application and REST contracts now active, the remaining client work is primarily **productization and platform packaging**, not rebuilding the intelligence platform from scratch. Native applications for the major target platforms are planned and will be coming soon.

The application layer can consume the same stable contracts already used by the web experience:

- **Android**
- **iOS**
- **Windows**
- **Linux**
- additional platform clients as the shared API contract matures

The existing Flutter client and service boundaries give the ecosystem a head start. Mobile/desktop applications can progressively adopt the established authentication, API, provenance, map, evidence, and desk contracts rather than duplicating backend intelligence.

### How quickly this came together

The current milestone is notable because the ecosystem moved from a multi-repository architecture and integration plan to a functioning public platform in a short development window. The difficult architectural work — ownership boundaries, public-data ingestion, REST contracts, evidence/provenance rules, Watchtower/Cell Titan integration, and the user-facing desk model — is already substantially established.

That means the next step should be treated as **client delivery on top of an operating platform**. The web application is the reference surface; native clients become additional presentation and interaction layers over the same CIVINTELLIGENCE contracts.

> **Build once at the platform layer. Deliver many clients at the edge.**

### Ecosystem rule

CIVINTELLIGENCE remains the system of record. Specialized repositories retain clear ownership of their domains, while clients consume stable public/service contracts. Legacy and predecessor repositories remain valuable migration/reference material but are not silently represented as unified production capabilities.

**Status discipline:** live means exposed and usable; available means implemented and integrated; in progress means actively being built; planned means not yet shipped. No synthetic or unavailable source is represented as live evidence.
