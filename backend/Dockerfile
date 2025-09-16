FROM python:3.12-slim-bookworm

COPY --from=ghcr.io/astral-sh/uv:0.7.5 /uv /uvx /bin/

WORKDIR /app

COPY . .

RUN uv venv ./.venv

RUN uv sync --locked

ENV PATH="/app/.venv/bin:$PATH"

WORKDIR /app/jarcode
