#!/usr/bin/env bash
# Auto-generated verify for 15-developer-tool-compromise
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
C2_URL="${C2_URL:-http://127.0.0.1:3015}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

echo "===> Clearing prior captures"
curl -sf -X DELETE "http://127.0.0.1:3015/captured-data" >/dev/null || true

echo "===> Triggering lab (npm install ../dev-tools/malicious-dev-tool && npm start)"
docker compose -f "$COMPOSE_FILE" exec -T victim \
  bash -lc 'cd /lab/15-developer-tool-compromise/victim-app && npm install ../dev-tools/malicious-dev-tool && npm start' || true

echo "===> Waiting for capture (grep: dev-tool)"
ok=0
for _ in $(seq 1 30); do
  DATA="$(curl -sf "$C2_URL/captured-data" 2>/dev/null || echo '{}')"
  if echo "$DATA" | grep -q 'dev-tool'; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  echo "Verification failed for 15-developer-tool-compromise" >&2
  echo "$DATA" || true
  exit 1
fi

echo "Verification successful: 15-developer-tool-compromise"
exit 0
