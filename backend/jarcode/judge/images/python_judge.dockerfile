FROM python:3.12-slim-bookworm

RUN pip install pytest

RUN useradd -m -s /bin/bash user
WORKDIR /home/user
USER user