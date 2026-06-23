#!/usr/bin/env bash
# CIVWATCH Development Startup Script
# Usage: ./scripts/dev-start.sh [--seed]
#
# Starts the full Docker Compose stack and optionally seeds demo data.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  CIVWATCH Development Environment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose v2 is not installed${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Check if .env exists
if [[ ! -f .env ]]; then
    echo -e "${YELLOW}Creating .env from template...${NC}"
    if [[ -f .env.example ]]; then
        cp .env.example .env
    else
        cat > .env << 'EOF'
# CIVWATCH Development Environment
NODE_ENV=development
DATABASE_URL=postgresql://civwatch:civwatch_dev@localhost:5432/civwatch
REDIS_URL=redis://localhost:6379
ML_SERVICE_URL=http://localhost:5000
JWT_SECRET=dev-secret-change-in-production
PORT=4000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    fi
fi

# Start services
echo -e "${GREEN}Starting Docker Compose stack...${NC}"
docker compose up --build -d

echo ""
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"

# Health check with timeout
TIMEOUT=120
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    # Check PostgreSQL
    if docker exec civwatch-db pg_isready -U civwatch &>/dev/null; then
        DB_STATUS="${GREEN}OK${NC}"
    else
        DB_STATUS="${YELLOW}...${NC}"
    fi

    # Check Backend
    if curl -s http://localhost:4000/health &>/dev/null; then
        API_STATUS="${GREEN}OK${NC}"
    else
        API_STATUS="${YELLOW}...${NC}"
    fi

    # Check ML Service
    if curl -s http://localhost:5000/health &>/dev/null; then
        ML_STATUS="${GREEN}OK${NC}"
    else
        ML_STATUS="${YELLOW}...${NC}"
    fi

    # Clear line and print status
    echo -ne "\r   PostgreSQL: ${DB_STATUS}   API: ${API_STATUS}   ML: ${ML_STATUS}"

    # Check if all are ready
    if docker exec civwatch-db pg_isready -U civwatch &>/dev/null && \
       curl -s http://localhost:4000/health &>/dev/null && \
       curl -s http://localhost:5000/health &>/dev/null; then
        echo ""
        echo ""
        echo -e "${GREEN}All services are healthy!${NC}"
        break
    fi

    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo ""
    echo -e "${RED}Timeout waiting for services. Check logs with: docker compose logs${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  CIVWATCH is running!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:4000"
echo "  ML Service: http://localhost:5000"
echo "  PostgreSQL: localhost:5432"
echo "  Redis:      localhost:6379"
echo ""

# Seed data if requested
if [[ "${1:-}" == "--seed" ]]; then
    echo -e "${YELLOW}Seeding demo data...${NC}"
    cd "$PROJECT_DIR/backend"
    npx ts-node scripts/seed-demo-data.ts 2>/dev/null || echo -e "${YELLOW}Seeding requires 'npm install' in backend directory${NC}"
    echo ""
fi

echo "Commands:"
echo "  docker compose logs -f    # View logs"
echo "  docker compose down       # Stop all services"
if [[ "${1:-}" != "--seed" ]]; then
    echo "  ./scripts/dev-start.sh --seed  # Start with demo data"
fi
echo ""
