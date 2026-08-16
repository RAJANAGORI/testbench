#!/usr/bin/env bash
# Sequentially smoke every compose-backed scenario (up → verify → down).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FAILED=()

while IFS= read -r compose; do
  dir="$(dirname "$compose")"
  slug="$(basename "$dir")"
  echo ""
  echo "======== SMOKE $slug ========"
  if ! (
    docker compose -f "$compose" down -v --remove-orphans >/dev/null 2>&1 || true
    docker compose -f "$compose" up -d --build --wait --wait-timeout 180
    chmod +x "$dir/verify.sh"
    "$dir/verify.sh"
  ); then
    FAILED+=("$slug")
    docker compose -f "$compose" logs --tail=80 || true
  fi
  docker compose -f "$compose" down -v --remove-orphans >/dev/null 2>&1 || true
done < <(find "$ROOT/scenarios" -maxdepth 2 -name docker-compose.yml ! -path '*/_shared/*' | sort)

echo ""
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "FAILED: ${FAILED[*]}"
  exit 1
fi
echo "All compose labs passed smoke."
