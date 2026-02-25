# Installation Guide

## Table of Contents
- [System Requirements](#system-requirements)
- [Platform-Specific Setup](#platform-specific-setup)
- [Docker Installation (Recommended)](#docker-installation-recommended)
- [Native Installation](#native-installation-no-docker)
- [Environment Configuration](#environment-configuration)
- [Verification & Testing](#verification--testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Advanced Configurations](#advanced-configurations)

---

## System Requirements

### Minimum Specifications
- **CPU**: 4 cores (8-core recommended for ML workloads)
- **RAM**: 8GB minimum, 16GB+ recommended
- **Storage**: 20GB SSD (50GB+ for ML models)
- **Network**: 5Mbps stable connection

### GPU Acceleration (Optional but Recommended for ML)
- **NVIDIA GPUs**: RTX 3060+ series, RTX 4000+ professional cards
- **CUDA**: 12.0+ (handled via Docker or manual installation)
- **cuDNN**: 8.8+ (for TensorFlow/PyTorch acceleration)
- **Test availability**: Run `nvidia-smi` on your system

### Browser Requirements (Frontend)
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Platform-Specific Setup

### Windows 11/10 (PowerShell + WSL2)

#### Prerequisites Installation
```powershell
# Install winget if not present
# Node.js
winget install OpenJS.NodeJS --version 20.11.0

# Python
winget install Python.Python.3.11

# Docker Desktop (includes WSL2 integration)
winget install Docker.DockerDesktop

# Verify installations
node --version
npm --version
python --version
docker --version
```

#### Path Configuration
```powershell
# Add to $PROFILE if not auto-added
$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion"

# WSL2 Interop
wsl --list --verbose  # Ensure Ubuntu is default
```

#### PowerShell Aliases (Optional)
```powershell
# Add to PowerShell profile ($PROFILE)
Set-Alias dc docker
Set-Alias dcl 'docker compose logs'
Set-Alias dcu 'docker compose up -d'
Set-Alias dcd 'docker compose down'
function Start-CIVWATCH { docker compose up -d; npm run dev }
```

---

### macOS (Homebrew)

#### Prerequisites Installation
```bash
# Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js
brew install node@20
brew link node@20

# Python
brew install python@3.11

# Docker Desktop
brew install --cask docker

# Verify
node --version
npm --version
python3 --version
docker --version
```

#### Shell Configuration
```bash
# Add to ~/.zshrc or ~/.bash_profile
export PATH="/usr/local/opt/node@20/bin:$PATH"
export PATH="/usr/local/opt/python@3.11/bin:$PATH"
```

---

### Linux/Kali Linux (Debian-based)

#### Prerequisites Installation
```bash
# Node.js (NodeSource Repository)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs npm

# Python 3.11
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Docker & Docker Compose
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker  # Apply group changes immediately

# Git
sudo apt install git

# Verify all
node --version && npm --version && python3.11 --version && docker --version
```

#### For Kali Linux (Security Testing)
```bash
# Update Kali
sudo apt full-upgrade -y

# Additional tools for pentesting workflows
sudo apt install burpsuite wireshark nmap

# CIVWATCH-specific: Network monitoring
pip install scapy pyshark
```

---

### Android (Termux)

#### Prerequisites Installation
```bash
# Update package manager
pkg update && pkg upgrade -y

# Node.js
pkg install nodejs npm

# Python
pkg install python

# PostgreSQL & Redis (lightweight)
pkg install postgresql redis

# Git
pkg install git

# Verify
node --version && npm --version && python --version
```

#### Storage & Permissions
```bash
# Termux file access
termux-setup-storage

# Create dev directory
mkdir -p ~/civwatch
cd ~/civwatch
```

---

## Clone Repository

```bash
cd /path/to/projects
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH
git checkout main

# Verify structure
ls -la
# Should see: backend/, frontend/, ml/, docs/, docker-compose.yml, etc.
```

---

## Environment Configuration

### Create .env File

```bash
# Copy and customize
cp .env.example .env  # If it exists, or create manually
```

### .env Template (Create if Missing)

```env
# === DATABASE ===
DATABASE_URL=postgresql://postgres:civwatch_dev_pass@db:5432/civwatch
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=civwatch_dev_pass
DATABASE_NAME=civwatch

# === REDIS CACHE ===
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379

# === JWT/AUTHENTICATION ===
JWT_SECRET=your_64_character_hex_secret_here_generate_with_openssl_rand_hex_32
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

# === ML SERVICE ===
ML_API_URL=http://ml:5000
ML_MODEL_PATH=/app/models
ML_BATCH_SIZE=32
ENABLE_GPU=true
ENABLE_CUDA=true
CUDA_VISIBLE_DEVICES=0

# === PORTS ===
BACKEND_PORT=3000
FRONTEND_PORT=4000
ML_PORT=5000
DB_PORT=5432
REDIS_PORT=6379

# === LOGGING ===
LOG_LEVEL=debug
NODE_ENV=development

# === CIVWATCH-SPECIFIC ===
ENABLE_ANOMALY_DETECTION=true
ENABLE_GEOSPATIAL_ANALYSIS=true
MAX_CONCURRENT_ANALYSES=5
```

### Generate JWT Secret

```bash
# macOS/Linux/WSL
openssl rand -hex 32

# Windows PowerShell
[System.Convert]::ToBase64String((1..32|foreach{[byte](Get-Random -Maximum 256)})) | Out-File -Path .env.secret
```

---

## Docker Installation (Recommended)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build & start all services
docker compose up -d

# 3. Check container health
docker compose ps
docker compose logs -f

# 4. Initialize database (first run)
docker compose exec db psql -U postgres -c "CREATE DATABASE civwatch;"
docker compose exec db psql -U postgres -d civwatch -f /docker-entrypoint-initdb.d/init.sql  # If available
```

### Services Started
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379
- **Backend API**: Port 3000 (http://localhost:3000/api/health)
- **Frontend**: Port 4000 (http://localhost:4000)
- **ML Service**: Port 5000 (http://localhost:5000/health)

### Docker Compose Override (Development Hot-Reload)

```bash
# Create docker-compose.override.yml for dev mode
cat > docker-compose.override.yml <<EOF
version: '3.9'
services:
  backend:
    volumes:
      - ./backend:/app/backend
      - /app/backend/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev:watch

  frontend:
    volumes:
      - ./frontend:/app/frontend
    command: npm run dev

  ml:
    volumes:
      - ./ml:/app/ml
    environment:
      - PYTHONUNBUFFERED=1
    command: python -m uvicorn main:app --host 0.0.0.0 --reload
EOF
```

### Stop Services

```bash
docker compose down  # Stops but keeps data
docker compose down --volumes  # Removes data
```

---

## Native Installation (No Docker)

### For Debugging on Kali/Termux

#### 1. Start Database Services

```bash
# PostgreSQL (manual or via Docker)
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=civwatch \
  -e POSTGRES_PASSWORD=dev_pass \
  postgres:15-alpine

# Redis
docker run -d -p 6379:6379 redis:7-alpine
```

#### 2. Install All Dependencies

```bash
cd CIVWATCH

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# ML
cd ml && pip install -r requirements.txt && cd ..
```

#### 3. Run Development Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: ML Service
cd ml && python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### ML GPU Setup (Native)

```bash
# For NVIDIA CUDA support
pip install tensorflow[and-cuda]  # Or PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Verify GPU
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```

---

## Verification & Testing

### Health Checks

```bash
# Backend API
curl http://localhost:3000/api/health
# Expected: { "status": "ok", "timestamp": "..." }

# Frontend (browser)
open http://localhost:4000

# ML Service
curl http://localhost:5000/health
# Expected: { "status": "healthy", "version": "..." }

# Database
docker compose exec db psql -U postgres -d civwatch -c "SELECT version();"

# Redis
docker compose exec redis redis-cli ping
# Expected: PONG
```

### Run Test Suites

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# ML tests
cd ml && pytest tests/ -v

# All tests
npm test --workspaces
```

### Container Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f ml

# Follow errors only
docker compose logs -f --tail=50 | grep -i error
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] `.env` configured with production secrets
- [ ] Database backups scheduled
- [ ] Redis AOF/RDB persistence enabled
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Monitoring/alerting configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### Build for Production

```bash
# Compile frontend
cd frontend && npm run build

# Compile backend
cd backend && npm run build

# ML model optimization (optional)
cd ml && python optimize_models.py
```

### Deploy via Docker (Production)

```bash
# Use production compose file
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale ML services
docker compose up -d --scale ml=3

# Check status
docker compose ps
```

### Deploy via Kubernetes

```bash
# Build images
docker build -t civwatch-backend:latest ./backend
docker build -t civwatch-frontend:latest ./frontend
docker build -t civwatch-ml:latest ./ml

# Push to registry
docker tag civwatch-backend myregistry/civwatch-backend:latest
docker push myregistry/civwatch-backend:latest

# Apply K8s manifests (see k8s/ directory)
kubectl apply -f k8s/
```

---

## Troubleshooting

### Port Conflicts

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
# Or in .env: BACKEND_PORT=3001
```

### Docker Issues

```bash
# Rebuild containers
docker compose build --no-cache

# Clean up
docker system prune -a --volumes

# Check Docker daemon
docker info
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker compose logs db

# Reset database
docker compose down --volumes
docker compose up -d db
docker compose exec db psql -U postgres -c "CREATE DATABASE civwatch;"
```

### Out of Memory (OOM)

```bash
# Check memory usage
docker stats

# Reduce ML batch size in .env
# ML_BATCH_SIZE=16  # Instead of 32

# Or use CPU-only
# ENABLE_GPU=false
```

### npm Workspace Issues

```bash
# Clear cache and reinstall
npm ci --workspaces
npm cache clean --force

# If still failing
npm install --workspaces=false
# Then retry per package
```

### Python Virtual Environment (Native Only)

```bash
# Create venv for ML
cd ml
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\\Scripts\\activate  # Windows

pip install -r requirements.txt
```

---

## Advanced Configurations

### Enable ML GPU Acceleration (Docker)

```yaml
# In docker-compose.yml, add to ml service:
ml:
  image: civwatch-ml:latest
  runtime: nvidia
  environment:
    - NVIDIA_VISIBLE_DEVICES=all
    - CUDA_VISIBLE_DEVICES=0
```

### Custom Database Backups

```bash
# Backup PostgreSQL
docker compose exec db pg_dump -U postgres civwatch > backup.sql

# Restore
docker compose exec -T db psql -U postgres civwatch < backup.sql

# Backup Redis
docker compose exec redis redis-cli --rdb /data/dump.rdb
```

### Enable Debug Logging

```env
# In .env
LOG_LEVEL=debug
NODE_ENV=development
DEBUG=civwatch:*
```

### Custom Node Workspaces

```bash
# Install in specific workspace
npm install some-package --workspace=backend
npm install -D @types/express --workspace=backend
```

### Monitoring & Performance

```bash
# Backend performance
docker compose logs backend | grep "Response time"

# ML inference time
curl -X POST http://localhost:5000/predict -d '{"text":"test"}'

# Redis memory
docker compose exec redis redis-cli INFO memory
```

---

## Support & Resources

- **Issues**: https://github.com/POWDER-RANGER/CIVWATCH/issues
- **Docs**: https://github.com/POWDER-RANGER/CIVWATCH/tree/main/docs
- **Contributing**: See CONTRIBUTING.md
- **Security**: See SECURITY.md

---

*Last updated: February 2026*
*For the latest version, visit the repository directly.*
