COMPOSE = docker compose
SERVICE = worker

.PHONY: help test build-judges

help:
	@echo "Available commands:"
	@echo "  make test             - Run all tests"
	@echo "  make test args='...'  - Run tests with custom args (e.g. make test args='-v -x')"
	@echo "  make build-judges     - Build local Docker images for Python, Java, and C++ judges"

test:
	$(COMPOSE) run --rm $(SERVICE) pytest $(args)

build-judges:
	docker build -f ./backend/jarcode/judge/images/python_judge.dockerfile -t python_judge:latest .
	docker build -f ./backend/jarcode/judge/images/java_judge.dockerfile -t java_judge:latest .
	docker build -f ./backend/jarcode/judge/images/cpp_judge.dockerfile -t cpp_judge:latest .