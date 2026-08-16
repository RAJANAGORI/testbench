#!/usr/bin/env bash
# Local smoke: build, boot, verify, teardown Scenario 01 Docker lab.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCENARIO="$ROOT/scenarios/01-typosquatting"
COMPOSE_FILE="$SCENARIO/docker-compose.yml"

cd "$SCENARIO"

cleanup() {
  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "===> Building and starting Scenario 01"
docker compose -f "$COMPOSE_FILE" build
docker compose -f "$COMPOSE_FILE" up -d --wait --wait-timeout 60

chmod +x "$SCENARIO/verify.sh"
"$SCENARIO/verify.sh"

echo "===> smoke-scenario-01 OK"
