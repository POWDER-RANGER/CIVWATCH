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
