#!/usr/bin/env bash
# Auto-generated verify for 22-litellm-pypi-compromise
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
C2_URL="${C2_URL:-http://127.0.0.1:3022}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

echo "===> Clearing prior captures"
curl -sf -X DELETE "http://127.0.0.1:3022/captured-data" >/dev/null || true

echo "===> Triggering lab (bash -lc '\''source .venv/bin/activate && python run_victim.py'\'')"
docker compose -f "$COMPOSE_FILE" exec -T victim \
  bash -lc 'cd /lab/22-litellm-pypi-compromise/victim-app && bash -lc '\''source .venv/bin/activate && python run_victim.py'\''' || true

echo "===> Waiting for capture (grep: litellm_like)"
ok=0
for _ in $(seq 1 30); do
  DATA="$(curl -sf "$C2_URL/captured-data" 2>/dev/null || echo '{}')"
  if echo "$DATA" | grep -q 'litellm_like'; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  echo "Verification failed for 22-litellm-pypi-compromise" >&2
  echo "$DATA" || true
  exit 1
fi

echo "Verification successful: 22-litellm-pypi-compromise"
exit 0
