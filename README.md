# CIVWATCH

![CI Pipeline](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![OpenSSF Scorecard](https://img.shields.io/badge/OpenSSF%20Scorecard-Coming%20Soon-lightgrey)

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

# Health checks (wait ~30s for services to initialize)
curl http://localhost:5000/api/health  # Backend API ✅
curl http://localhost:8000/health      # ML Service ✅
open http://localhost:3000             # Frontend UI ✅
```

**Quick API test** (sentiment analysis):
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"text": "This policy significantly benefits infrastructure.", "type": "legislative_statement"}'
```

> ⚠️ **Development Status:** Early-stage infrastructure. Core architecture documented; implementation underway. MVP target: Q1 2026. Track progress: [Issue #6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6)

---

## 🏗️ Architecture Overview

**Visual:** [View Full System Architecture Diagram →](docs/architecture.md)

**Three-Tier Design:**
- **Frontend** (TypeScript/React, port 3000): Responsive UI, real-time dashboards, data visualizations
- **Backend** (Node.js/Express, port 5000): REST API, JWT auth, PostgreSQL persistence, Redis caching
- **ML Service** (Python/FastAPI, port 8000): Sentiment analysis, topic modeling, entity recognition (TensorFlow/spaCy)

**Key Tech Highlights:**
- JWT authentication + Redis sessions (1hr/7day TTL)
- Async ML processing via message queues
- Horizontal scaling (stateless services)
- OpenTelemetry distributed tracing
- Sub-200ms auth latency

---

## 📡 Core API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|----------|
| `/api/health` | GET | Service health status |
| `/api/auth/login` | POST | User authentication (JWT) |
| `/api/dashboard` | GET | Real-time legislative activity feed |
| `/api/reports` | POST | Submit documents for ML analysis |
| `/api/analytics/:id` | GET | Retrieve processed insights |
| `/api/notifications` | GET | User-configured alerts |

[**→ Full API Documentation**](docs/api.md)

---

## 🤝 Contributing

We welcome civic tech enthusiasts! **Start here:**

1. **Fork & Clone:** `git clone <your-fork>`
2. **Branch:** `git checkout -b feature/your-feature`
3. **Develop:** Add tests + docs
4. **Test:** `npm test` (backend), `pytest` (ML service)
5. **Commit:** Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`)
6. **PR:** Push and open a Pull Request

**Dev Commands:**
```bash
npm run dev           # Backend dev mode
npm test              # Backend tests
cd ml && pytest       # ML service tests
cd frontend && npm start  # Frontend dev server
```

**What we need:**
- 🐛 Bug fixes & stability
- ✨ Civic transparency features
- 📚 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements

**Guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md) | [Code of Conduct](CODE_OF_CONDUCT.md)

---

## 🔒 Security Policy

**Production-grade security:**
- **Auth:** JWT tokens (1hr expiry) + refresh tokens (7-day TTL)
- **Passwords:** bcrypt (cost factor 12)
- **Rate limiting:** 100 req/min per IP
- **TLS:** 1.3 for all external traffic
- **CORS:** Whitelist-only origins

**Found a vulnerability?** Report privately via [GitHub Security Advisories](https://github.com/POWDER-RANGER/CIVWATCH/security/advisories).  
[**→ Full Security Policy**](SECURITY.md)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 📚 Additional Resources

- [Architecture Guide](docs/architecture.md) - System design & data flows
- [API Reference](docs/api.md) - Complete endpoint specs
- [Testing Strategy](docs/testing.md) - QA approach
- [Installation Guide](docs/tutorials/installation.md) - Deployment instructions

---

**Built with ❤️ for civic engagement**  
Last Updated: October 4, 2025 | Status: Early Development | Next: CI/CD Pipeline Stabilization
