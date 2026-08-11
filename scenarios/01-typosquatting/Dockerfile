# Auto-generated for 01-typosquatting — build context: scenarios/
FROM node:20-slim

ENV TESTBENCH_MODE=enabled \
    NODE_ENV=development

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl python3 python3-pip \
 && pip3 install --break-system-packages --no-cache-dir awscli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /lab

COPY _shared /lab/_shared
COPY 01-typosquatting /lab/01-typosquatting

WORKDIR /lab/01-typosquatting
WORKDIR /lab/01-typosquatting/victim-app
RUN npm install --omit=dev
WORKDIR /lab/01-typosquatting
CMD ["sleep", "infinity"]
