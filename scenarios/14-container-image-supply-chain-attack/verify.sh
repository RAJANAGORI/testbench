#!/usr/bin/env bash
# Auto-generated verify for 14-container-image-supply-chain-attack
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
C2_URL="${C2_URL:-http://127.0.0.1:3002}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

echo "===> Clearing prior captures"
curl -sf -X DELETE "http://127.0.0.1:3002/captured-data" >/dev/null || true

echo "===> Triggering lab (node malicious-start.js)"
docker compose -f "$COMPOSE_FILE" exec -T victim \
  bash -lc 'cd /lab/14-container-image-supply-chain-attack/images/compromised-image && node malicious-start.js' || true

echo "===> Waiting for capture (grep: 14-container-image)"
ok=0
for _ in $(seq 1 30); do
  DATA="$(curl -sf "$C2_URL/captured-data" 2>/dev/null || echo '{}')"
  if echo "$DATA" | grep -q '14-container-image'; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  echo "Verification failed for 14-container-image-supply-chain-attack" >&2
  echo "$DATA" || true
  exit 1
fi

echo "Verification successful: 14-container-image-supply-chain-attack"
exit 0
