COMPOSE = docker compose
SERVICE = backend

.PHONY: test test-users shell down build help

help:
	@echo "Available commands:"
	@echo "  make test             - Run all tests"
	@echo "  make test args='...'  - Run tests with custom args (e.g. make test args='-v -x')"

test:
	$(COMPOSE) run --rm $(SERVICE) pytest $(args)
