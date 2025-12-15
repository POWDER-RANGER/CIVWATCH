# CIVWATCH
![CI Pipeline](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml/badge.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/POWDER-RANGER/CIVWATCH/badge)](https://securityscorecards.dev/viewer/?uri=github.com/POWDER-RANGER/CIVWATCH) [![codecov](https://codecov.io/gh/POWDER-RANGER/CIVWATCH/branch/main/graph/badge.svg)](https://codecov.io/gh/POWDER-RANGER/CIVWATCH)
<!-- TODO: Update Codecov badge after first CI coverage run -->

> _OpenSSF Scorecard currently failing due to private repo exclusion; see Wiki for fix progress._

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
  
> _API latency benchmarks and performance statistics coming soon._

---

## 📊 Quality & Benchmarks

### Compliance & Security
• ✅ OpenSSF Best Practices compliance (in progress)
  
• ✅ MIT License  
• 🔄 Codecov integration (CI coverage pending first test run)
  
• 🔒 Production-grade auth (JWT + bcrypt)

### Performance Benchmarks
• Backend response times: TBD (load testing planned)
  
• ML inference latency: TBD (GPU optimization underway)
  
• Database query performance: TBD (benchmark suite in development)

### Architecture & Testing
• **Unit tests:** pytest (ML), Jest (backend/frontend)
  
• **E2E tests:** Playwright (UI workflows)
  
• **CI/CD:** GitHub Actions (linting, tests, coverage)
  
• **Tech Debt:** See [Issue #6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6)

### Known Issues
• OpenSSF Scorecard failing (private repo; manual audit workaround documented)
  
• CI coverage not yet enabled (first run will populate Codecov badge)
  
• ML model files not in repo (download script in `ml/models/README.md`)

### Roadmap Items
• Multi-language support (Spanish, Chinese)
  
• Mobile apps (React Native)
  
• Advanced data export (CSV, JSON, PDF)
  
• Real-time collaboration features

---

## 🤝 Contributing

**Quick Start:**

1. **Fork:** Click "Fork" at the top-right  
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
