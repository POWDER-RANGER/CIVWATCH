# Testing Strategy

This document outlines CIVWATCH’s approach to quality: what we test, how we test it, and how tests run locally and in CI.

## Scope and Layers
- Unit tests: pure functions, utilities, React components in isolation.
- Integration tests: API routes, database access, and service boundaries.
- End-to-end (E2E): user flows across frontend and backend in a realistic environment.
- Contract/API tests: OpenAPI schema validation, error shapes, and backward-compatibility.
- Security and quality gates: lint, type-check, dependency and vulnerability scanning.

## Tools
- Frontend: Jest + Testing Library, Playwright/Cypress for E2E.
- Backend: Jest (Node/Express), supertest for HTTP, testcontainers for ephemeral DBs.
- ML services: pytest + hypothesis; golden datasets for regression checks.
- Static analysis: TypeScript, ESLint, Prettier.

## Test Data Strategy
- Fixture factories for deterministic data.
- Seed scripts for local/e2e environments.
- Synthetic data only; no PII in tests.

## Running Tests Locally
- Install deps: `npm install` in each package (or at repo root if using workspaces).
- Lint/type-check: `npm run lint` and `npm run typecheck`.
- Unit/integration: `npm test` (use `--watch` for TDD).
- E2E: `npm run e2e` after starting the dev stack (`docker compose up -d` or `npm run dev`).
- ML: `pytest` within the `ml/` service directory.

## Writing Tests
- Arrange-Act-Assert and small, focused assertions.
- Prefer Testing Library queries by role/label for accessibility alignment.
- Mock external services (HTTP, queues) with MSW or nock; avoid global state.
- Use Testcontainers to spin up real dependencies when fidelity matters.

## Coverage
- Target: >= 80% statements/branches per package.
- Enforced in CI; report via `coverage/` artifacts and badges.

## CI/CD Integration
- CI jobs: lint, type-check, unit, integration, e2e (matrix by package and OS/node).
- Cache node_modules and Playwright/Cypress browsers for speed.
- Artifacts: junit.xml, coverage reports, screenshots/videos for e2e failures.
- Gates: required checks on PRs; main protected.

## Flake Management
- Quarantine tag for flaky specs; nightly job to re-run.
- Retries for e2e only; never hide systemic flakes.

## Test Environments
- Local: developer machine with `.env` and Docker.
- CI: ephemeral containers; seeded DB.
- Staging: production-like; smoke tests post-deploy.

## Reporting
- PR comments with summary (passed/failed, coverage deltas).
- Dashboards via GitHub Checks + Codecov (optional).

## Future Work
- Mutation testing (Stryker), fuzzing critical parsers, dependency pinning and SBOM.
