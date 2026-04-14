.PHONY: dev stop migrate migrate-down migrate-history test test-backend test-frontend worker lint format

# ─── Dev Environment ──────────────────────────────────────────────────────────
dev:
	docker compose up --build

dev-detach:
	docker compose up --build -d

stop:
	docker compose down

logs:
	docker compose logs -f

# ─── Database ─────────────────────────────────────────────────────────────────
migrate:
	docker compose exec backend alembic upgrade head

migrate-down:
	docker compose exec backend alembic downgrade -1

migrate-history:
	docker compose exec backend alembic history

migrate-new:
	@read -p "Migration name: " name; \
	docker compose exec backend alembic revision --autogenerate -m "$$name"

# ─── Testing ──────────────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	docker compose exec backend pytest tests/ -v --tb=short

test-backend-unit:
	docker compose exec backend pytest tests/unit/ -v --tb=short

test-backend-integration:
	docker compose exec backend pytest tests/integration/ -v --tb=short

test-frontend:
	docker compose exec frontend npm run test

# ─── Worker ───────────────────────────────────────────────────────────────────
worker:
	docker compose exec worker python -m arq app.workers.main.WorkerSettings

# ─── Code Quality ─────────────────────────────────────────────────────────────
lint:
	docker compose exec backend ruff check app/ tests/
	docker compose exec backend mypy app/
	docker compose exec frontend npm run lint

format:
	docker compose exec backend ruff format app/ tests/
	docker compose exec frontend npm run format

# ─── Utilities ────────────────────────────────────────────────────────────────
shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec postgres psql -U outreach outreach

redis-cli:
	docker compose exec redis redis-cli
