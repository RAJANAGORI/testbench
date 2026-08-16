# Auto-generated for 23-trivy-supply-chain-attack — build context: scenarios/
FROM node:20-slim

ENV TESTBENCH_MODE=enabled \
    NODE_ENV=development

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl python3 python3-pip \
 && pip3 install --break-system-packages --no-cache-dir awscli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /lab

COPY _shared /lab/_shared
COPY 23-trivy-supply-chain-attack /lab/23-trivy-supply-chain-attack

WORKDIR /lab/23-trivy-supply-chain-attack
RUN chmod +x setup.sh && ./setup.sh
CMD ["sleep", "infinity"]
