# Auto-generated for 27-npm-provenance-bypass — build context: scenarios/
FROM node:20-slim

ENV TESTBENCH_MODE=enabled \
    NODE_ENV=development

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl python3 python3-pip \
 && pip3 install --break-system-packages --no-cache-dir awscli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /lab

COPY _shared /lab/_shared
COPY 27-npm-provenance-bypass /lab/27-npm-provenance-bypass

WORKDIR /lab/27-npm-provenance-bypass
RUN chmod +x setup.sh && ./setup.sh
CMD ["sleep", "infinity"]
