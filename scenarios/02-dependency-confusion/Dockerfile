# Auto-generated for 02-dependency-confusion — build context: scenarios/
FROM node:20-slim

ENV TESTBENCH_MODE=enabled \
    NODE_ENV=development

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl python3 python3-pip \
 && pip3 install --break-system-packages --no-cache-dir awscli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /lab

COPY _shared /lab/_shared
COPY 02-dependency-confusion /lab/02-dependency-confusion

WORKDIR /lab/02-dependency-confusion
RUN chmod +x setup.sh && ./setup.sh
CMD ["sleep", "infinity"]
