# Contributing to CIVWATCH

> **Standard**: Conventional Commits | **Source**: [conventionalcommits.org](https://www.conventionalcommits.org/)

Thank you for your interest in contributing to CIVWATCH! This document provides guidelines and workflows for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Review](#code-review)
- [Testing](#testing)
- [Documentation](#documentation)
- [Security](#security)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Set up** the development environment
4. **Create a branch** for your changes
5. **Make your changes** following our conventions
6. **Submit a pull request**

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 20.0.0 | Backend and frontend runtime |
| Python | >= 3.11 | ML service |
| Docker | >= 24.0.0 | Containerization |
| Docker Compose | >= 2.20.0 | Local orchestration |
| Git | >= 2.40.0 | Version control |
| npm | >= 10.0.0 | Package management |

---

## Development Setup

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/CIVWATCH.git
cd CIVWATCH

# 2. Add upstream remote
git remote add upstream https://github.com/POWDER-RANGER/CIVWATCH.git

# 3. Install dependencies
npm install
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings

# 5. Start infrastructure services
docker-compose up -d postgres redis

# 6. Run database migrations
npx prisma migrate dev

# 7. Start development servers
npm run dev          # Frontend (Vite) + Backend (Express)
npm run dev:ml       # ML service (FastAPI/Uvicorn)

# 8. Verify setup
curl http://localhost:3000/api/health
```

### Available npm Scripts

```bash
npm run dev           # Start frontend + backend in watch mode
npm run dev:ml        # Start ML service with auto-reload
npm run build         # Production build (all services)
npm run lint          # ESLint + Prettier check
npm run lint:fix      # Auto-fix linting issues
npm run test          # Run all test suites
npm run test:unit     # Unit tests only (Jest/Vitest)
npm run test:integration  # Integration tests
npm run test:e2e      # End-to-end tests (Playwright)
npm run test:ml       # Python ML tests (pytest)
npm run typecheck     # TypeScript type checking
npm run db:migrate    # Run Prisma migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed development data
```

---

## Project Structure

```
CIVWATCH/
├── .github/              # GitHub templates and workflows
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation, rate limiting
│   │   ├── models/       # Database models (Prisma)
│   │   └── utils/        # Helpers and utilities
│   └── tests/
├── frontend/             # React dashboard
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # State management
│   │   └── utils/        # Frontend utilities
│   └── tests/
├── ml/                   # Python ML service
│   ├── src/
│   │   ├── models/       # ML model definitions
│   │   ├── pipelines/    # Data processing pipelines
│   │   ├── detectors/    # Anomaly detection algorithms
│   │   └── api/          # FastAPI application
│   └── tests/
├── docs/                 # Documentation
├── scripts/              # Build and utility scripts
├── docker-compose.yml    # Local development stack
└── prisma/               # Database schema and migrations
```

---

## Branch Strategy

We use a **trunk-based development** workflow:

```
main (production-ready)
  │
  ├── feature/authentication
  ├── feature/dbscan-tuning
  ├── bugfix/memory-leak
  ├── docs/api-examples
  └── refactor/ingestion-pipeline
```

| Branch Prefix | Purpose | Example |
|--------------|---------|---------|
| `feature/` | New functionality | `feature/websocket-alerts` |
| `bugfix/` | Bug fixes | `bugfix/login-redirect` |
| `hotfix/` | Production-critical fixes | `hotfix/security-patch` |
| `docs/` | Documentation changes | `docs/deployment-guide` |
| `refactor/` | Code restructuring | `refactor/cache-layer` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `test/` | Test additions/improvements | `test/alert-dispatcher` |

### Branch Naming Rules

- Use lowercase with hyphens (`kebab-case`)
- Include issue number when applicable: `feature/123-websocket-auth`
- Keep names descriptive but concise (max 50 chars)
- Delete branches after merge

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages. This enables automated changelog generation and semantic versioning.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(api): add webhook signature verification` |
| `fix` | Bug fix | `fix(auth): resolve JWT expiry race condition` |
| `docs` | Documentation | `docs: update ML_TUNING.md with new eps heuristic` |
| `style` | Code style (formatting) | `style: fix indentation in anomaly service` |
| `refactor` | Code restructuring | `refactor(ingestion): separate fetch from parse` |
| `perf` | Performance improvement | `perf(db): add composite index on documents` |
| `test` | Test changes | `test(api): add monitor lifecycle tests` |
| `chore` | Maintenance | `chore(deps): update prisma to 5.15` |
| `ci` | CI/CD changes | `ci: add container scan to pipeline` |
| `build` | Build system | `build: optimize webpack chunk splitting` |
| `revert` | Revert previous commit | `revert: feat(api): add experimental graphql endpoint` |

### Scopes

Common scopes for CIVWATCH:

- `api` — REST API endpoints
- `auth` — Authentication and authorization
- `db` — Database schema and queries
- `ml` — Machine learning service
- `ui` — Frontend user interface
- `ingest` — Data ingestion pipeline
- `alert` — Alerting and notification system
- `report` — Report generation
- `ws` — WebSocket real-time features
- `deps` — Dependencies
- `docs` — Documentation

### Examples

```bash
# Feature with description and breaking change footer
feat(api): add GraphQL query endpoint for analytics

Adds a `/graphql` endpoint supporting analytics queries with
type-safe schema generation from Prisma models.

BREAKING CHANGE: Analytics REST endpoints deprecated in favor of GraphQL

# Bug fix with issue reference
fix(ml): correct DBSCAN eps calculation for high-dimensional data

The k-distance graph method was producing incorrect results when
feature dimensionality exceeded 50. Now uses PCA projection first.

Closes #234

# Documentation update
docs: add Electron code signing instructions to DEPLOYMENT.md

# Performance improvement with measured impact
perf(cache): implement Redis pipeline for batch operations

Reduces ingestion pipeline latency by ~40% for bulk document imports.
Benchmark: 1000 docs processed in 2.3s (was 3.8s).
```

### Commit Best Practices

1. **Atomic commits**: Each commit should represent a single logical change
2. **Present tense**: Use imperative mood ("add" not "added" or "adds")
3. **No period at end** of subject line
4. **Max 72 chars** for subject line
5. **Reference issues**: Include `Fixes #123` or `Closes #456` in footer
6. **Breaking changes**: Always mark with `BREAKING CHANGE:` footer

---

## Pull Request Process

### Before Submitting

- [ ] Branch is up to date with `main`
- [ ] All tests pass (`npm test`)
- [ ] Code linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Commits follow conventional commit format
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated (if user-facing change)

### PR Title Format

Follow the same convention as commits:

```
<type>(<scope>): <description>
```

Examples:
- `feat(api): add real-time anomaly alert streaming via WebSocket`
- `fix(ml): resolve memory leak in DBSCAN batch processing`
- `docs: update architecture diagrams for Phase 2`

### PR Description Template

Pull requests should include:

```markdown
## Description
Brief description of the changes and their purpose.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed
- [ ] E2E tests updated (if UI changes)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated

## Related Issues
Fixes #123
Related to #456
```

### PR Size Guidelines

| Size | Lines Changed | Review Time | Risk |
|------|--------------|-------------|------|
| Small | < 100 | < 15 min | Low |
| Medium | 100-500 | 30-60 min | Medium |
| Large | > 500 | 1-2 hours | High |

Prefer small, focused PRs. Split large changes into stacked PRs when possible.

---

## Code Review

### Review Assignment

- All PRs require **at least one approval** before merge
- Core architecture changes require **two approvals**
- Security-related changes require **security team approval**

### Review Checklist for Reviewers

- [ ] Code follows project conventions
- [ ] Logic is correct and handles edge cases
- [ ] Tests cover the changes adequately
- [ ] No security vulnerabilities introduced
- [ ] Performance implications considered
- [ ] Documentation is accurate and complete

### Review Timeline

| PR Type | Target Review Time |
|---------|-------------------|
| Bug fix | 24 hours |
| Feature | 48 hours |
| Documentation | 24 hours |
| Hotfix | 4 hours |

---

## Testing

### Test Pyramid

```
       /\
      /  \     E2E (Playwright)        ~5%
     /----\    ─────────────────────────────────
    /      \   Integration (Jest + Supertest)  ~15%
   /--------\  ─────────────────────────────────
  /          \ Unit (Jest/Vitest + pytest)      ~80%
 /------------\
```

### Running Tests

```bash
# All tests
npm run test

# Specific suites
npm run test:unit           # JavaScript/TypeScript unit tests
npm run test:unit:watch     # Watch mode for development
npm run test:integration    # API integration tests
npm run test:e2e            # Browser E2E tests
npm run test:ml             # Python ML tests
npm run test:coverage       # Coverage report

# Specific test file
npx jest src/services/alert.test.ts
pytest ml/tests/test_dbscan.py -v
```

### Coverage Requirements

| Service | Minimum Coverage | Target Coverage |
|---------|-----------------|-----------------|
| Backend (API) | 80% | 90% |
| Frontend (UI) | 70% | 80% |
| ML Service | 75% | 85% |
| Critical paths | 90% | 95% |

---

## Documentation

### When to Update Docs

Update documentation when changing:
- API endpoints or request/response formats
- Configuration options or environment variables
- Architecture or deployment procedures
- ML model behavior or tuning parameters
- Security controls or threat model

### Documentation Files

| File | Purpose |
|------|---------|
| `API.md` | REST API specification |
| `ARCHITECTURE.md` | System architecture (C4 Model) |
| `ML_TUNING.md` | Anomaly detection configuration |
| `THREAT_MODEL.md` | Security threat analysis |
| `DATA_LINEAGE.md` | Data provenance tracking |
| `DEPLOYMENT.md` | Infrastructure setup |
| `PERFORMANCE.md` | SRE and optimization |
| `SECURITY.md` | Vulnerability disclosure |
| `CHANGELOG.md` | Release history |
| `docs/*.md` | Detailed guides and tutorials |

---

## Security

- Never commit secrets, API keys, or credentials
- Report security vulnerabilities privately via [SECURITY.md](SECURITY.md)
- Follow the [THREAT_MODEL.md](THREAT_MODEL.md) when designing features
- All dependencies must pass `npm audit` and `snyk test`
- SAST scans (Semgrep, Bandit) run on every PR

---

## Community

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Chat**: [Discord/Slack - TBD]
- **Meetings**: Weekly community standup (Fridays 15:00 UTC)

---

## Release Process

Releases are automated using [release-please](https://github.com/googleapis/release-please):

1. Conventional commits are tracked on `main`
2. Release PR is generated automatically
3. On merge of release PR:
   - Version is bumped (SemVer)
   - CHANGELOG.md is updated
   - Git tag is created
   - Container images are built and pushed
   - GitHub Release is published

---

## License

By contributing to CIVWATCH, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).

---

## Questions?

- Check existing [documentation](docs/)
- Search [closed issues](https://github.com/POWDER-RANGER/CIVWATCH/issues?q=is%3Aissue+is%3Aclosed)
- Start a [GitHub Discussion](https://github.com/POWDER-RANGER/CIVWATCH/discussions)
- Contact maintainers: [civwatch-team@example.com](mailto:civwatch-team@example.com)
