#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ProspectOS — Local Development Setup
# Run this once after cloning the repo.
# Usage: bash scripts/dev-setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[setup]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC} $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $*"; }
error()   { echo -e "${RED}[error]${NC} $*"; exit 1; }

echo ""
echo "  ProspectOS — Dev Setup"
echo "  ─────────────────────────"
echo ""

# ── Prerequisites ──────────────────────────────────────────────────────────
info "Checking prerequisites..."

command -v docker   >/dev/null 2>&1 || error "Docker is required. Install from https://docs.docker.com/get-docker/"
command -v docker   >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 || error "Docker Compose v2 is required."
command -v node     >/dev/null 2>&1 || error "Node.js 22+ is required. Install from https://nodejs.org/"
command -v python3  >/dev/null 2>&1 || warn "Python 3.12 is optional for running tests outside Docker."

success "Prerequisites OK"

# ── .env ──────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  info "Creating .env from .env.example..."
  cp .env.example .env

  # Generate SECRET_KEY and ENCRYPTION_KEY automatically
  if command -v python3 >/dev/null 2>&1; then
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    # Fernet key must be 32 url-safe base64 bytes
    ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" 2>/dev/null || python3 -c "import secrets,base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())")
    sed -i "s|change-me-to-a-random-64-char-hex-string|${SECRET_KEY}|g" .env
    sed -i "s|change-me-to-a-32-byte-base64-url-safe-fernet-key|${ENCRYPTION_KEY}|g" .env
    success "Generated SECRET_KEY and ENCRYPTION_KEY"
  else
    warn ".env created but SECRET_KEY and ENCRYPTION_KEY are placeholders."
    warn "Edit .env before starting the app."
  fi
else
  info ".env already exists — skipping"
fi

# ── Frontend dependencies ──────────────────────────────────────────────────
info "Installing frontend Node.js dependencies..."
cd frontend && npm install --silent && cd ..
success "Frontend deps installed"

# ── Docker build ──────────────────────────────────────────────────────────
info "Building Docker images (first build takes a few minutes)..."
docker compose build --quiet
success "Docker images built"

# ── Start services ─────────────────────────────────────────────────────────
info "Starting postgres and redis..."
docker compose up -d postgres redis
info "Waiting for postgres to be ready..."
for i in $(seq 1 30); do
  docker compose exec postgres pg_isready -U outreach >/dev/null 2>&1 && break
  sleep 1
done
docker compose exec postgres pg_isready -U outreach >/dev/null 2>&1 || error "Postgres did not start in time."
success "Postgres ready"

# Create test database
docker compose exec postgres psql -U outreach -c "CREATE DATABASE outreach_test;" 2>/dev/null || true

# ── Run migrations ──────────────────────────────────────────────────────────
info "Running database migrations..."
docker compose run --rm backend alembic upgrade head
success "Migrations applied"

# ── Done ──────────────────────────────────────────────────────────────────
docker compose down

echo ""
echo "  ─────────────────────────────────────────────────────"
echo -e "  ${GREEN}Setup complete!${NC}"
echo ""
echo "  Start the full stack:"
echo "    make dev"
echo ""
echo "  Then open:"
echo "    Frontend  →  http://localhost:3000"
echo "    API docs  →  http://localhost:8000/api/docs"
echo "    MailHog   →  http://localhost:8025"
echo ""
echo "  Useful commands:"
echo "    make migrate        — run new migrations"
echo "    make test           — run all tests"
echo "    make shell-backend  — bash into backend container"
echo "    make shell-db       — psql into postgres"
echo "  ─────────────────────────────────────────────────────"
echo ""
