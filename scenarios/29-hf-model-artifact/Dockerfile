# Auto-generated for 29-hf-model-artifact — build context: scenarios/
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
COPY 29-hf-model-artifact /lab/29-hf-model-artifact

WORKDIR /lab/29-hf-model-artifact
RUN chmod +x setup.sh && ./setup.sh

CMD ["sleep", "infinity"]
