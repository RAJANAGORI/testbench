#!/usr/bin/env bash
# Auto-generated verify for 06-sha-hulud
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
C2_URL="${C2_URL:-http://127.0.0.1:3001}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

echo "===> Clearing prior captures"
curl -sf -X DELETE "http://127.0.0.1:3001/captured-credentials" >/dev/null || true

echo "===> Triggering lab (npm install)"
docker compose -f "$COMPOSE_FILE" exec -T victim \
  bash -lc 'cd /lab/06-sha-hulud/victim-app && npm install' || true

echo "===> Waiting for capture (grep: _authToken)"
ok=0
for _ in $(seq 1 30); do
  DATA="$(curl -sf "http://127.0.0.1:3001/captured-credentials" 2>/dev/null || echo '{}')"
  if echo "$DATA" | grep -q '_authToken'; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  echo "Verification failed for 06-sha-hulud" >&2
  echo "$DATA" || true
  exit 1
fi

echo "Verification successful: 06-sha-hulud"
exit 0
