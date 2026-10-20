# CIVWATCH Repository Guide

> **Status:** This is a legacy-repository navigation page, not an active execution plan. The unified application and system of record is [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence).

## Start here

1. Read the [root README](./README.md) for this repository's role and the supported legacy-stack setup.
2. Use the [cross-repository integration contract](https://github.com/POWDER-RANGER/CivilianIntelligence/blob/main/docs/CROSS_REPO_INTEGRATION.md) for current service ownership and interface contracts.
3. Use the [CIVWATCH status page](https://powder-ranger.github.io/CIVWATCH/status.html) for the latest endpoint-probe results; this page is not a live health check.
4. Check the current source, pull requests, workflows, and deployment evidence before treating an old completion claim as current.

## What this repository contains

This repository retains legacy backend, ML, ingestion, container orchestration, and project-site material during migration. New canonical production contracts and integration terminate in CivilianIntelligence.

The Docker stack described in the README is for legacy development and migration work. It is not the acceptance environment for the public CIVWATCH web application.

## Historical planning records

These files remain available for audit context; their original instructions and timelines are not current deployment approval:

- [PR0 damage-control notes](./PR0_DAMAGE_CONTROL.md)
- [PR1 Docker implementation notes](./PR1_DOCKER_GREEN.md)
- [Next-phase plan](./NEXT_PHASE.md)
- [Implementation roadmap snapshot](./IMPLEMENTATION_ROADMAP.md)
- [Repository hygiene review](./RESEARCH_VALIDATION.md)
- [Historical status report](./STATUS.md)

Do not repeat a destructive cleanup, copy an old code block, or report a milestone as complete solely because a historical note says so. Re-verify the current files, test results, and production state first.

## Documentation policy

Follow the [ecosystem-wide Documentation Standard](https://github.com/POWDER-RANGER/CivilianIntelligence/blob/main/docs/DOCUMENTATION_STANDARD.md). Keep repository-specific setup and architecture here; avoid duplicating the canonical integration contract.
