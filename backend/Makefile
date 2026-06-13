# Backend developer commands.
#
# For the full-stack one-shot (backend + Expo), use ../dev.sh instead.
# These targets require Docker. The Go-native targets (sqlc, fmt, vet, lint,
# test) additionally require Go 1.23 installed on the host.

DC := docker compose
MIGRATIONS := internal/db/migrations

.DEFAULT_GOAL := help

.PHONY: help up up-build down logs ps migrate new-migration sqlc fmt vet lint test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

up: ## Start the dev stack (postgres + migrate + hot-reload api)
	$(DC) up -d

up-build: ## Rebuild images, then start (use after Dockerfile/dep changes)
	$(DC) up -d --build

down: ## Stop the stack (keeps the database volume)
	$(DC) down

logs: ## Tail all service logs (Ctrl-C to stop)
	$(DC) logs -f

ps: ## Show stack status
	$(DC) ps

migrate: ## Apply pending migrations
	$(DC) run --rm migrate

new-migration: ## Create a migration pair: make new-migration NAME=add_widgets
	@test -n "$(NAME)" || { echo "usage: make new-migration NAME=description"; exit 1; }
	@n=$$(ls $(MIGRATIONS) 2>/dev/null | grep -oE '^[0-9]+' | sort -n | tail -1); \
	n=$$(printf '%06d' $$(( 10#$${n:-0} + 1 ))); \
	up="$(MIGRATIONS)/$${n}_$(NAME).up.sql"; \
	down="$(MIGRATIONS)/$${n}_$(NAME).down.sql"; \
	touch "$$up" "$$down"; \
	echo "created $$up"; echo "created $$down"

sqlc: ## Regenerate sqlc code (requires the sqlc CLI)
	cd internal/db && sqlc generate

fmt: ## Format Go code in place
	gofmt -w .

vet: ## Run go vet
	go vet ./...

lint: ## gofmt check + vet (mirrors CI)
	@bad=$$(gofmt -l .); if [ -n "$$bad" ]; then echo "gofmt needed:"; echo "$$bad"; exit 1; fi
	go vet ./...

test: ## Run tests
	go test ./...
