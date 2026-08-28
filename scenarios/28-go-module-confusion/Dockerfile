# Auto-generated for 28-go-module-confusion — build context: scenarios/
FROM golang:1.22-bookworm

ENV TESTBENCH_MODE=enabled \
    GOTOOLCHAIN=local

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl python3 python3-pip \
 && pip3 install --break-system-packages --no-cache-dir awscli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /lab

COPY _shared /lab/_shared
COPY 28-go-module-confusion /lab/28-go-module-confusion

WORKDIR /lab/28-go-module-confusion
RUN chmod +x setup.sh && ./setup.sh

CMD ["sleep", "infinity"]
