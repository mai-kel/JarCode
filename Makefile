COMPOSE = docker compose
SERVICE = worker

.PHONY: help test-backend test-backend-coverage test-frontend test-frontend-coverage build-judges eslint prettier build-frontend prod-up prod-down createsuperuser createsuperuser-prod

help:
	@echo "Available commands:"
	@echo "  make test-backend            - Run all backend tests"
	@echo "  make test-backend-coverage   - Run backend tests with coverage"
	@echo "  make test-frontend           - Run frontend tests"
	@echo "  make test-frontend-coverage  - Run frontend tests with coverage"
	@echo "  make eslint                  - Run ESLint with --fix flag on frontend code"
	@echo "  make prettier                - Run Prettier with --write flag on frontend code"
	@echo "  make build-judges            - Build local Docker images for Python, Java, and C++ judges"
	@echo "  make build-frontend          - Build frontend to ready for prod static files"
	@echo "  make createsuperuser        - Create Django superuser (dev environment)"
	@echo "  make createsuperuser-prod    - Create Django superuser (prod environment)"
	@echo "  make prod-up                 - Run production docker compose using .env_prod"
	@echo "  make prod-down               - Stop production docker compose"

test-backend:
	$(COMPOSE) run --rm $(SERVICE) pytest

test-backend-coverage:
	$(COMPOSE) run --rm $(SERVICE) pytest --cov=. --cov-report=term --cov-report=html

test-frontend:
	$(COMPOSE) run --rm --no-deps frontend npm test

test-frontend-coverage:
	$(COMPOSE) run --rm --no-deps frontend npm run test:coverage

eslint:
	$(COMPOSE) run --rm --no-deps frontend npx eslint . --fix

prettier:
	$(COMPOSE) run --rm --no-deps frontend npx prettier --write .

build-judges:
	docker build -f ./backend/jarcode/judge/images/python_judge.dockerfile -t python_judge:latest .
	docker build -f ./backend/jarcode/judge/images/java_judge.dockerfile -t java_judge:latest .
	docker build -f ./backend/jarcode/judge/images/cpp_judge.dockerfile -t cpp_judge:latest .

build-frontend:
	$(COMPOSE) run --rm frontend sh -c "npm install && npm run build"

createsuperuser:
	$(COMPOSE) run --rm $(SERVICE) python manage.py createsuperuser

createsuperuser-prod:
	$(COMPOSE) -f docker-compose-prod.yml --env-file .env_prod run --rm worker python manage.py createsuperuser

prod-up:
	$(COMPOSE) -f docker-compose-prod.yml --env-file .env_prod up

prod-down:
	$(COMPOSE) -f docker-compose-prod.yml --env-file .env_prod down