# CIVWATCH - Complete Setup Guide

## Overview
CIVWATCH is a three-tier microservices web application for civic transparency and government oversight.

**Architecture:**
- **Backend** (Node.js/Express): REST API on port 3000
- **Frontend** (React/TypeScript): UI on port 4000  
- **ML Service** (Python/FastAPI): ML/NLP on port 5000

---

## Prerequisites

### Required Software
1. **Docker & Docker Compose**
   - Docker Engine 20.10+
   - Docker Compose 2.0+
   - [Installation Guide](https://docs.docker.com/get-docker/)

2. **Node.js** (for local development)
   - Version: 18.x or 20.x LTS
   - npm 9.x+
   - [Download](https://nodejs.org/)

3. **Python** (for ML service)
   - Version: 3.9+
   - pip 21.x+

4. **Git**
   - Version 2.30+

---

## Quick Start (Docker)

The fastest way to run CIVWATCH:

```bash
# Clone the repository
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Start all services with Docker Compose
docker-compose up
```

**Services will be available at:**
- Backend API: http://localhost:3000
- Backend Health: http://localhost:3000/api/health
- Frontend UI: http://localhost:4000
- ML Service: http://localhost:5000
- ML Health: http://localhost:5000/health

**To stop services:**
```bash
docker-compose down
```

---

## Local Development Setup

For active development without Docker:

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

**Backend runs on:** http://localhost:3000

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

**Frontend runs on:** http://localhost:4000

### 3. ML Service Setup

```bash
cd ml

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Run development server
python main.py

# Run tests
pytest
```

**ML Service runs on:** http://localhost:5000

---

## Repository Structure

```
CIVWATCH/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── services/     # Business logic
│   │   ├── server.ts     # Express server
│   │   └── types.ts      # TypeScript types
│   ├── index.js          # Entry point
│   ├── package.json      # Dependencies
│   └── Dockerfile.dev    # Docker config
│
├── frontend/             # React/TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   └── main.tsx      # Entry point
│   ├── package.json      # Dependencies
│   └── Dockerfile.dev    # Docker config
│
├── ml/                   # Python ML service
│   ├── src/
│   │   └── models/       # ML models
│   ├── main.py           # FastAPI server
│   ├── package.json      # Metadata
│   └── Dockerfile.dev    # Docker config
│
├── docs/                 # Documentation
│   ├── architecture.md   # System design
│   ├── api.md           # API specs
│   └── testing.md       # QA strategy
│
├── docker-compose.yml    # Multi-service orchestration
├── requirements.txt      # Python dependencies
├── package.json         # Root workspace config
├── tsconfig.json        # TypeScript config
└── README.md            # Project overview
```

---

## Environment Configuration

### Backend Environment Variables
Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/civwatch
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

### Frontend Environment Variables
Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_ML_URL=http://localhost:5000
```

### ML Service Environment Variables
Create `ml/.env`:

```env
PORT=5000
MODEL_PATH=./models
```

---

## Common Tasks

### Build All Services
```bash
docker-compose build
```

### View Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml
```

### Restart a Single Service
```bash
docker-compose restart backend
```

### Run Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# ML tests
cd ml && pytest
```

### Code Linting
```bash
# Backend/Frontend
npm run lint

# Python
flake8 ml/
```

---

## Troubleshooting

### Port Already in Use
If ports 3000, 4000, or 5000 are occupied:

```bash
# Check port usage
lsof -i :3000
lsof -i :4000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Docker Issues
```bash
# Clean Docker cache
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Clear pip cache
pip cache purge

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Health Check Failures
Wait 40 seconds after starting services for health checks to stabilize.

```bash
# Test health endpoints manually
curl http://localhost:3000/api/health
curl http://localhost:5000/health
```

---

## Production Deployment

### Build Production Images
```bash
docker-compose -f docker-compose.prod.yml build
```

### Environment Setup
1. Set secure `JWT_SECRET` values
2. Configure production databases (PostgreSQL)
3. Set up Redis for caching
4. Enable HTTPS/TLS
5. Configure CORS origins

### Security Checklist
- [ ] Change all default credentials
- [ ] Enable rate limiting (100 req/min)
- [ ] Configure TLS 1.3
- [ ] Whitelist CORS origins
- [ ] Set bcrypt cost factor (12)
- [ ] Enable security headers
- [ ] Configure firewall rules

---

## Additional Resources

- [Architecture Documentation](docs/architecture.md)
- [API Reference](docs/api.md)
- [Testing Strategy](docs/testing.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

---

## Support

**Issues:** [GitHub Issues](https://github.com/POWDER-RANGER/CIVWATCH/issues)

**Development Status:** Early-stage MVP (Q1 2026 target)

**License:** MIT
