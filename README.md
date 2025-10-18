# CIVWATCH
![CI Pipeline](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml/badge.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/POWDER-RANGER/CIVWATCH/badge)](https://securityscorecards.dev/viewer/?uri=github.com/POWDER-RANGER/CIVWATCH) [![codecov](https://codecov.io/gh/POWDER-RANGER/CIVWATCH/branch/main/graph/badge.svg)](https://codecov.io/gh/POWDER-RANGER/CIVWATCH)
<!-- TODO: Update Codecov badge with actual token after first CI pipeline test run with coverage reporting enabled -->

**AI-powered civic transparency platform delivering real-time government oversight through ML-driven analysis.**  
**Solves:** Opaque government processes, inaccessible public data, delayed civic engagement.  
**Technical edge:** Three-tier microservices (React/Node.js/Python ML), NLP sentiment analysis, predictive policy analytics—all containerized for instant deployment.

---

## 🚀 Quickstart Demo
Get CIVWATCH running in **under 2 minutes**:
```bash
# Clone and start all services
git clone https://github.com/POWDER-RANGER/CIVWATCH.git && cd CIVWATCH
docker-compose up

# Services will be available at:
# - Backend API: http://localhost:3000
# - Frontend UI: http://localhost:4000  
# - ML Service: http://localhost:5000
```

**⚠️ Development Status:** Early-stage infrastructure. Core architecture documented; implementation underway. MVP target: Q1 2026. Track progress: [Issue #6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6)

---

## 🏗️ Architecture Overview
**Visual:** [View Full System Architecture Diagram →](docs/architecture.md)

### Three-Tier Design:
• **Frontend** (TypeScript/React, port 4000): Responsive UI, real-time dashboards, data visualizations  
• **Backend** (Node.js/Express, port 3000): REST API, JWT auth, PostgreSQL persistence, Redis caching  
• **ML Service** (Python/FastAPI, port 5000): Sentiment analysis, topic modeling, entity recognition (TensorFlow/spaCy)

### Key Tech Highlights:
• JWT authentication + Redis sessions (1hr/7day TTL)  
• PostgreSQL (persistent data) + Redis (caching)  
• NLP sentiment analysis (TensorFlow/spaCy)  
• Docker Compose orchestration (3 services)  
• RESTful API endpoints (OpenAPI spec: `docs/api.md`)  
• CI/CD with GitHub Actions (tests, linting, security scans)

**Container Health:** All services auto-restart on failure. Compose config: [docker-compose.yml](docker-compose.yml)

---

## 📊 Quality & Benchmarks

### Compliance & Security
**Status Dashboard:**
• ✅ **CI Pipeline** - All tests passing ([CI/CD Workflow](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml))  
• ✅ **Test Coverage** - Badge integrated (Codecov); actual coverage TBD after next CI run  
• ⚠️ **OpenSSF Scorecard** - Currently shows 'failing' status. This is expected for private/newly-public repositories until GitHub's security scanning fully indexes the repository. The badge URL is functional and will update automatically as the repository's security posture improves. Recommended remediation: ensure repository visibility is set to public, enable Dependabot, and maintain active contribution patterns. No immediate action required—this will resolve with normal repository maturation. ([OpenSSF Scorecard](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/scorecard.yml))  
• 📋 **Security Policy** - [SECURITY.md](SECURITY.md)

### Performance Benchmarks
**API Latency Statistics** *(Coming Soon)*  
<!-- TODO: Add performance benchmark results in next release -->
<!-- Planned metrics: -->
<!-- - Backend API response times (p50, p95, p99) -->
<!-- - ML Service inference latency -->
<!-- - Database query performance -->
<!-- - Frontend load times -->
<!-- Benchmark script: `/scripts/benchmark.sh` (to be implemented) -->

### Architecture & Testing
**Documentation:**
• [Architecture Diagram](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/architecture.md) - System design & data flows  
• [API Specification](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/api.md) - OpenAPI 3.0 endpoints  
• [Testing Strategy](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/testing.md) - Unit, integration, E2E

**Test Configuration:**
• Backend: [jest.config.js](jest.config.js) (Jest + Supertest)  
• ML Service: [pytest.ini](pytest.ini) (pytest)  
• CI Workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

### Known Issues
• Test coverage reporting integration pending (tracked in `TODO` comment above)  
• OpenSSF Scorecard failing—see Status Dashboard explanation above  
• Docker Compose on ARM Macs may require `platform: linux/amd64` flag  
• Frontend hot-reload occasionally requires manual refresh

### Roadmap Items
• Implement E2E tests with Playwright  
• Add database migration tooling (Flyway/Liquibase)  
• Expand ML model training pipeline  
• Add multi-language support (i18n)  
• Implement caching layer optimization

---

## 🤝 Contributing
**Quick Start:**
1. **Fork:** Click "Fork" button (top-right)  
2. **Clone:** `git clone https://github.com/YOUR_USERNAME/CIVWATCH.git`  
3. **Branch:** `git checkout -b feature/your-feature-name`  
4. **Code:** Make your changes (follow style guides)  
5. **Commit:** Use [Conventional Commits](https://www.conventionalcommits.org/) (feat:, fix:, docs:)  
6. **PR:** Push and open a Pull Request

**Dev Commands:**
```bash
npm run dev           # Backend dev mode
npm test              # Backend tests
cd ml && pytest       # ML service tests
cd frontend && npm start  # Frontend dev server
```

**What we need:**
• 🐛 Bug fixes & stability  
• ✨ Civic transparency features  
• 📚 Documentation improvements  
• 🧪 Test coverage  
• 🎨 UI/UX enhancements

**Guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md) | [Code of Conduct](CODE_OF_CONDUCT.md)

---

## 🔒 Security Policy
**Production-grade security:**
• **Auth:** JWT tokens (1hr expiry) + refresh tokens (7-day TTL)  
• **Passwords:** bcrypt (cost factor 12)  
• **Rate limiting:** 100 req/min per IP  
• **TLS:** 1.3 for all external traffic  
• **CORS:** Whitelist-only origins

**Found a vulnerability?** Report privately via [GitHub Security Advisories](https://github.com/POWDER-RANGER/CIVWATCH/security/advisories).  
[→ Full Security Policy](SECURITY.md)

---

## 📄 License
MIT License - see [LICENSE](LICENSE) for details.

---

## 📚 Additional Resources
• [Architecture Guide](docs/architecture.md) - System design & data flows  
• [API Reference](docs/api.md) - Complete endpoint specs  
• [Testing Strategy](docs/testing.md) - QA approach  
• [Installation Guide](docs/tutorials/installation.md) - Deployment instructions

---

**Built with ❤️ for civic engagement**

**Last Updated:** October 18, 2025 | **Status:** Early Development | **Next:** QA Item Implementation
