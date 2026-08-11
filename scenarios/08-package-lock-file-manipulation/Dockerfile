# Auto-generated for 08-package-lock-file-manipulation — build context: scenarios/
FROM node:20-slim

ENV TESTBENCH_MODE=enabled \
    NODE_ENV=development

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl python3 python3-pip \
 && pip3 install --break-system-packages --no-cache-dir awscli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /lab

COPY _shared /lab/_shared
COPY 08-package-lock-file-manipulation /lab/08-package-lock-file-manipulation

WORKDIR /lab/08-package-lock-file-manipulation
RUN chmod +x setup.sh && ./setup.sh
CMD ["sleep", "infinity"]
