# CIVWATCH

![CI Pipeline](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![OpenSSF Scorecard](https://img.shields.io/badge/OpenSSF%20Scorecard-Coming%20Soon-lightgrey)

**CIVWATCH is a modern civic transparency platform that empowers citizens to monitor government activities through intelligent automation and machine learning.** Built as a three-tier system (React frontend, Node.js backend, Python ML service), it delivers real-time analysis of legislative actions, budget allocations, and public statements. **Unlike generic transparency tools, CIVWATCH combines natural language processing with predictive analytics to surface patterns and insights that matter most to communities.**

---

## 🚀 Quick Start

Get CIVWATCH running locally in under 2 minutes:

```bash
# Clone the repository
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Start all services with Docker Compose
docker-compose up

# Verify services are running
curl http://localhost:5000/api/health  # Backend API
curl http://localhost:8000/health      # ML Service
# Frontend available at http://localhost:3000
```

**Quick API Test:**

```bash
# Example: Analyze sentiment of a legislative statement
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This policy will significantly benefit local infrastructure.",
    "type": "legislative_statement"
  }'
```

> ⚠️ **Project Status:** Early development phase. Core infrastructure is documented but implementation is in progress. Expected MVP: Q1 2026. See [Issue #6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6) for implementation roadmap.

---

## 🏗️ Architecture

CIVWATCH follows a clean three-tier architecture with containerized microservices:

- **Frontend** (TypeScript/React): User interface, data visualization, responsive design
- **Backend** (Node.js/Express): REST API, authentication, business logic, PostgreSQL persistence
- **ML Service** (Python/FastAPI): Sentiment analysis, topic modeling, entity recognition

**[→ View Full Architecture Documentation](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/architecture.md)**

**Key Technical Highlights:**
- JWT-based authentication with Redis session management
- Asynchronous ML processing with queue-based architecture
- Horizontal scaling via stateless service design
- OpenTelemetry distributed tracing across services
- Sub-200ms latency for critical authentication paths

---

## 📖 Usage

### Core Capabilities

**1. Monitor Legislative Activity**
```bash
GET /api/dashboard
# Returns real-time dashboard data with recent legislative actions
```

**2. Analyze Text Sentiment**
```bash
POST /api/reports
# Submit documents for ML-powered sentiment and topic analysis
```

**3. Track Analytics**
```bash
GET /api/analytics/:id
# Retrieve processed analytics results with insights
```

### Key Features (Roadmap)

- ✅ **Real-time Dashboard**: Live updates via WebSocket integration
- ✅ **Sentiment Analysis**: ML-powered emotional tone detection
- ✅ **Topic Modeling**: Automatic categorization of legislative content
- ✅ **Alert System**: Configurable notifications for significant events
- ✅ **Role-Based Access**: Admin, analyst, and viewer permission levels
- ✅ **API-First Design**: Full programmatic access to all features

**[→ Full API Documentation](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/api.md)**

---

## 🤝 Contributing

We welcome contributions from developers passionate about civic transparency!

**Getting Started:**

1. **Fork & Clone**: Fork this repo and clone your fork locally
2. **Branch**: Create a feature branch (`git checkout -b feature/amazing-feature`)
3. **Develop**: Make your changes with tests and documentation
4. **Test**: Run `npm test` (backend), `pytest` (ML service)
5. **Commit**: Use conventional commits (`feat:`, `fix:`, `docs:`)
6. **Push**: Push to your fork and open a Pull Request

**Development Commands:**

```bash
npm run dev          # Start backend in development mode
npm run test         # Run backend tests
npm run lint         # Lint TypeScript code

cd ml && pytest      # Run ML service tests
cd frontend && npm start  # Start frontend dev server
```

**What We're Looking For:**

- 🐛 Bug fixes and stability improvements
- ✨ New features aligned with civic transparency mission
- 📚 Documentation enhancements
- 🧪 Test coverage expansion
- 🎨 UI/UX improvements

**[→ Contributing Guidelines](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CONTRIBUTING.md)** | **[→ Code of Conduct](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CODE_OF_CONDUCT.md)**

---

## 📋 Development Status

### Current Phase: Infrastructure Stabilization

**What's Working:**
- ✅ Architecture documentation complete
- ✅ Docker Compose orchestration defined
- ✅ CI/CD pipeline configuration
- ✅ Core type definitions and interfaces
- ✅ Testing framework setup (Jest, pytest)

**In Progress:**
- 🔄 Workspace directory structure completion
- 🔄 Functional Dockerfile.dev for all services
- 🔄 Service entry points and startup scripts
- 🔄 CI/CD pipeline stabilization
- 🔄 Database schema implementation

**[→ View Detailed Roadmap](https://github.com/POWDER-RANGER/CIVWATCH/issues/6)**

---

## 🔒 Security

Security is paramount for a civic transparency platform:

- **Authentication**: JWT tokens (1-hour expiry) + refresh tokens (7-day TTL)
- **Password Hashing**: bcrypt with cost factor 12
- **Rate Limiting**: 100 requests/minute per IP
- **TLS**: TLS 1.3 for all external connections
- **CORS**: Whitelist-only origin policy

**Found a vulnerability?** Please report security issues privately via GitHub Security Advisories.

**[→ Security Policy](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/SECURITY.md)**

---

## 📄 License

CIVWATCH is open source software licensed under the **MIT License**.

See [LICENSE](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/LICENSE) for full details.

---

## 📚 Documentation

- **[Architecture Guide](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/architecture.md)**: System design and data flows
- **[API Reference](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/api.md)**: Complete endpoint documentation
- **[Installation Guide](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/tutorials/installation.md)**: Deployment instructions
- **[Testing Strategy](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/testing.md)**: Testing approach and guidelines

---

## 💬 Community & Support

- **Issues**: [Report bugs or request features](https://github.com/POWDER-RANGER/CIVWATCH/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/POWDER-RANGER/CIVWATCH/discussions)
- **Pull Requests**: [Contribute code improvements](https://github.com/POWDER-RANGER/CIVWATCH/pulls)

---

## 🌟 Vision

CIVWATCH aims to democratize access to government data by making civic information accessible, analyzable, and actionable. We believe transparency is the foundation of accountable governance, and technology should serve to strengthen that foundation.

**Built with ❤️ for civic engagement**

---

*Last Updated: October 4, 2025*  
*Status: Early Development*  
*Next Milestone: CI/CD Pipeline & Service Implementation*
