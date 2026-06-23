#!/bin/bash
set -e

echo "============================================"
echo "  CIVWATCH - One-Command Setup"
echo "  Civic Data Monitoring Platform"
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
echo ""
echo "Checking dependencies..."

command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v "docker compose" >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required but not installed.${NC}"; exit 1; }

echo -e "${GREEN}✓ Docker found${NC}"

# Generate .env if not exists
if [ ! -f .env ]; then
    echo ""
    echo "Generating .env file..."
    
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | xxd -p | tr -d '\n')
    API_KEY=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | xxd -p | tr -d '\n')
    
    cat > .env <<EOF
# CIVWATCH Environment Configuration
NODE_ENV=development
PORT=3000
FRONTEND_PORT=5173
ML_PORT=5000
SCRAPER_PORT=5001

# Database
DATABASE_URL=postgresql://civwatch:civwatch_dev@postgres:5432/civwatch
POSTGRES_USER=civwatch
POSTGRES_PASSWORD=civwatch_dev
POSTGRES_DB=civwatch

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=${JWT_SECRET}_refresh
REFRESH_TOKEN_EXPIRES_IN=7d

# API Keys (optional - scraper fallbacks work without)
CIVWATCH_API_KEY=${API_KEY}
OPENFEC_API_KEY=
CONGRESS_API_KEY=
OPENSTATES_API_KEY=

# Scraper Backend Forwarding
CIVWATCH_BACKEND_URL=http://backend:3000/api

# ML Service
ML_MODEL_PATH=/app/models
ANOMALY_THRESHOLD=0.7

# Email alerts (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ALERT_FROM_EMAIL=

# Webhook alerts (optional)
WEBHOOK_URL=
EOF
    
    echo -e "${GREEN}✓ .env generated${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists, skipping generation${NC}"
fi

# Create Docker network if needed
if ! docker network ls | grep -q "civwatch-network"; then
    echo ""
    echo "Creating Docker network..."
    docker network create civwatch-network 2>/dev/null || true
fi

# Start infrastructure first
echo ""
echo "============================================"
echo "  Starting infrastructure (Postgres + Redis)"
echo "============================================"
docker-compose up -d postgres redis

# Wait for Postgres
echo ""
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U civwatch -d civwatch >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Run migrations
echo ""
echo "============================================"
echo "  Running database migrations"
echo "============================================"

if [ -f backend/migrations/001_init.sql ]; then
    docker-compose exec -T postgres psql -U civwatch -d civwatch < backend/migrations/001_init.sql 2>/dev/null || echo -e "${YELLOW}⚠ 001_init.sql may have already been applied${NC}"
fi

if [ -f backend/migrations/002_documents_url_unique.sql ]; then
    docker-compose exec -T postgres psql -U civwatch -d civwatch < backend/migrations/002_documents_url_unique.sql 2>/dev/null || true
fi

if [ -f backend/migrations/003_anomaly_notify_trigger.sql ]; then
    docker-compose exec -T postgres psql -U civwatch -d civwatch < backend/migrations/003_anomaly_notify_trigger.sql 2>/dev/null || true
fi

echo -e "${GREEN}✓ Migrations applied${NC}"

# Start all services
echo ""
echo "============================================"
echo "  Starting all CIVWATCH services"
echo "============================================"
docker-compose up -d

echo ""
echo "============================================"
echo -e "${GREEN}  CIVWATCH is running!${NC}"
echo "============================================"
echo ""
echo "Service URLs:"
echo "  Frontend:    http://localhost:5173"
echo "  Backend API: http://localhost:3000/api"
echo "  ML Service:  http://localhost:5000"
echo "  Scraper:     http://localhost:5001"
echo "  Nginx:       http://localhost:80"
echo ""
echo "Database:"
echo "  PostgreSQL:  localhost:5432 (user: civwatch, pass: civwatch_dev)"
echo "  Redis:       localhost:6379"
echo ""
echo "Commands:"
echo "  View logs:   docker-compose logs -f"
echo "  Stop:        docker-compose down"
echo "  Full reset:  docker-compose down -v"
echo ""
