# Auto-generated for 22-litellm-pypi-compromise — build context: scenarios/
FROM python:3.12-slim

ENV TESTBENCH_MODE=enabled \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && pip install --no-cache-dir awscli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /lab

COPY _shared /lab/_shared
COPY 22-litellm-pypi-compromise /lab/22-litellm-pypi-compromise

WORKDIR /lab/22-litellm-pypi-compromise
RUN chmod +x setup.sh && ./setup.sh

CMD ["sleep", "infinity"]
