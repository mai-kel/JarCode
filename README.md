# JarCode

JarCode is a learning + coding platform built around **courses** and **programming problems**.

Users submit solutions in the browser; JarCode evaluates them in sandboxed “judge” containers (**Python/Java/C++**) and streams submission status updates back to the UI via **websockets**. Backend also generates an **AI code review** using Google Gemini.

## Table of contents

- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [How it works](#how-it-works-high-level)
- [Prerequisites](#prerequisites)
- [Quick start (dev, Docker Compose)](#quick-start-dev-docker-compose)
- [Common commands](#common-commands)
- [Judges (Python/Java/C++)](#judges-pythonjavac)
- [Production](#production)
- [API documentation](#api-documentation)

## Tech stack

- **Frontend**: Vue 3 + Vite + Pinia + PrimeVue
- **Backend**: Django + Django REST Framework + Django Channels (websockets) + Dramatiq (background jobs)
- **Infra**: nginx (reverse proxy), Postgres, Redis, RabbitMQ
- **Judging**: language-specific Docker images + Docker Engine (via mounted `/var/run/docker.sock`) + **gVisor runtime** (`runsc`)
- **API docs**: DRF Spectacular (OpenAPI + Swagger UI)

## Repository structure

- `frontend/`: Vue app (Vite dev server, tests via Vitest)
- `backend/`: backend Docker image definition (Python + `uv`)
  - `backend/jarcode/`: Django project root (apps: `users`, `courses`, `problems`, `submissions`, `judge`, `ai_evaluator`)
- `nginx/`: nginx config templates for dev and prod
- `docker-compose.yml`: development stack
- `docker-compose-prod.yml`: production stack (WSGI + ASGI split)
- `Makefile`: common commands (tests, prod up/down, building judge images, etc.)

## How it works

### HTTP + auth

- The browser talks to the backend through nginx:
  - **API** is served under `/api/...`
  - **Websockets** are served under `/ws/...`
- Auth is **cookie/session** based (the frontend uses Axios `withCredentials: true`) and uses **CSRF** protection.
- In production, nginx routes `/api/*` and `/admin/*` to **Gunicorn** and `/ws/*` to **Daphne**.

### Submission evaluation flow

- The frontend opens a websocket to `ws(s)://<host>/ws/submission/`.
- Creating a submission enqueues a Dramatiq task (`evaluate_submission`).
- The worker evaluates the submission:
  - runs tests inside a language-specific judge container (`python_judge:latest`, `java_judge:latest`, `cpp_judge:latest`)
  - asks Gemini for feedback
- The backend pushes updates to the websocket group `user_<id>`; the UI listens and updates submission state in real time.

## Prerequisites

### Required for Docker-based development

- Docker Engine + Docker Compose v2 (`docker compose`)
- Docker Engine access from the worker container via mounted `/var/run/docker.sock`
- **gVisor** configured as a Docker runtime **named `runsc`**
  - the judge containers are started with `runtime="runsc"` in code

## Quick start (dev, Docker Compose)

### 1) Create `.env`

`docker compose` automatically reads a `.env` file in the repo root.

Copy the example and adjust values:

```bash
cp env.example .env
```

### 2) Start the stack

```bash
docker compose up --build
```

### 3) Open the app

- **App (via nginx)**: `http://localhost/`
- **Backend (direct, Django dev server)**: `http://localhost:8000/`
  - **Admin (dev)**: `http://localhost:8000/admin/`
- **API docs (Swagger UI, via nginx)**: `http://localhost/api/docs/`
- **RabbitMQ management UI (dev)**: `http://localhost:15673/`
  - in dev compose, host ports are fixed to `15673` (UI) and `5673` (AMQP)

### Services (dev compose)

- **`reverse-proxy` (nginx)**: `http://localhost/` (routes `/api/*`, `/ws/*`, serves frontend via proxy)
- **`frontend` (Vite)**: `http://localhost:5173/` (dev server; normally accessed through nginx)
- **`backend` (Django)**: `http://localhost:8000/` (dev server; Channels enabled via `runserver`)
- **`worker` (Dramatiq)**: background jobs (evaluation) + Docker socket access for judges
- **`db` (Postgres)**: `localhost:5432`
- **`redis`**: `localhost:6379`
- **`rabbitmq`**:
  - AMQP: `localhost:5673`
  - UI: `http://localhost:15673/`

## Common commands

See everything available:

```bash
make help
```

Create a Django superuser (dev):

```bash
make createsuperuser
```

Run tests / lint (dev):

```bash
make test-backend
make test-backend-coverage
make test-frontend
make test-frontend-coverage
make eslint
make prettier
```

## Judges (Python/Java/C++)

JarCode runs user code inside **dedicated judge images**:

- Python: `backend/jarcode/judge/images/python_judge.dockerfile` → `python_judge:latest` (pytest)
- Java: `backend/jarcode/judge/images/java_judge.dockerfile` → `java_judge:latest` (JUnit console launcher)
- C++: `backend/jarcode/judge/images/cpp_judge.dockerfile` → `cpp_judge:latest` (Catch2)

Build them locally:

```bash
make build-judges
```

Notes:

- The worker must be able to talk to Docker (it mounts `/var/run/docker.sock`).
- Containers are started with `network_disabled=true`, `read_only=true`, limited CPU/RAM, and `runtime="runsc"`.

## Production

Production uses a separate compose file (`docker-compose-prod.yml`) and expects a **built frontend**.

### 1) Build frontend static files

nginx in prod serves `./frontend/dist` from the host:

```bash
make build-frontend
```

### 2) Prepare `.env_prod`

This is a local file (ignored by git). Copy the example and set real values:

```bash
cp env_prod.example .env_prod
```

Key variables:

- `DJANGO_SETTINGS_MODULE=jarcode.settings.settings_prod`
- `DJANGO_SECRET_KEY` (required)
- `ALLOWED_HOSTS` (comma-separated, required)
- `DRAMATIQ_PROCESSES`, `DRAMATIQ_THREADS` (optional tuning)

### 3) Start / stop production

```bash
make prod-up
make prod-down
```

Create a Django superuser (prod):

```bash
make createsuperuser-prod
```

### Production URLs

- **App**: `http://<host>/`
- **Admin**: `http://<host>/admin/`
- **API docs**: `http://<host>/api/docs/`

## API documentation

- OpenAPI schema: `/api/schema/`
- Swagger UI: `/api/docs/`