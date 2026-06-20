# Subtext convenience targets.
# Override registry/owner/tag: `make images REGISTRY=ghcr.io OWNER=zsigisti TAG=v1`

REGISTRY ?= ghcr.io
OWNER    ?= OWNER
TAG      ?= latest
SERVER_IMG = $(REGISTRY)/$(OWNER)/subtext-server:$(TAG)
WEB_IMG    = $(REGISTRY)/$(OWNER)/subtext-web:$(TAG)

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# ---- Local development (no Docker) ----
.PHONY: setup
setup: ## Install deps, create env files, set up + seed the dev DB (SQLite)
	pnpm install
	[ -f apps/server/.env ] || cp .env.example apps/server/.env
	[ -f apps/web/.env ] || printf 'VITE_API_URL="http://localhost:3000"\n' > apps/web/.env
	pnpm db:push
	pnpm seed

.PHONY: dev
dev: ## Run server + web together (http://localhost:5173)
	pnpm dev

.PHONY: seed
seed: ## (Re)seed the demo account and scenarios
	pnpm seed

.PHONY: typecheck
typecheck: ## tsc --noEmit across every package
	pnpm typecheck

.PHONY: build
build: ## Production build of all packages
	pnpm build

# ---- Prod-like local stack (Docker Compose: Postgres + API + web) ----
.PHONY: compose-up
compose-up: ## Build + run the full stack at http://localhost:8080
	[ -f .env ] || cp .env.docker.example .env
	docker compose up -d --build

.PHONY: compose-down
compose-down: ## Stop the stack
	docker compose down

.PHONY: compose-logs
compose-logs: ## Tail stack logs
	docker compose logs -f

# ---- Images for k3s ----
.PHONY: images
images: ## Build both production images (REGISTRY/OWNER/TAG)
	docker build -f apps/server/Dockerfile -t $(SERVER_IMG) .
	docker build -f apps/web/Dockerfile -t $(WEB_IMG) .

.PHONY: push
push: ## Push both images to the registry
	docker push $(SERVER_IMG)
	docker push $(WEB_IMG)
