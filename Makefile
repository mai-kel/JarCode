COMPOSE = docker compose
SERVICE = worker

.PHONY: help test test-frontend test-frontend-coverage build-judges

help:
	@echo "Available commands:"
	@echo "  make test-backend            - Run all backend tests"
	@echo "  make test-frontend           - Run frontend tests"
	@echo "  make test-frontend-coverage  - Run frontend tests with coverage"
	@echo "  make build-judges            - Build local Docker images for Python, Java, and C++ judges"

test:
	$(COMPOSE) run --rm $(SERVICE) pytest

test-frontend:
	$(COMPOSE) run --rm frontend npm test

test-frontend-coverage:
	$(COMPOSE) run --rm frontend npm run test:coverage

build-judges:
	docker build -f ./backend/jarcode/judge/images/python_judge.dockerfile -t python_judge:latest .
	docker build -f ./backend/jarcode/judge/images/java_judge.dockerfile -t java_judge:latest .
	docker build -f ./backend/jarcode/judge/images/cpp_judge.dockerfile -t cpp_judge:latest .