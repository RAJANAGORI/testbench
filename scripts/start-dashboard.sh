#!/usr/bin/env bash
# Start SCAS dashboard stack: control plane + Next.js dashboard + Vite landing.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export SCAS_REPO_ROOT="$ROOT"
export CONTROL_PLANE_PORT="${CONTROL_PLANE_PORT:-3101}"
export NEXT_PUBLIC_CONTROL_PLANE_URL="${NEXT_PUBLIC_CONTROL_PLANE_URL:-http://127.0.0.1:3101}"
export VITE_DASHBOARD_URL="${VITE_DASHBOARD_URL:-http://127.0.0.1:3100}"
export VITE_CONTROL_PLANE_URL="${VITE_CONTROL_PLANE_URL:-http://127.0.0.1:3101}"

if [[ ! -d node_modules ]]; then
  echo "Installing workspace dependencies…"
  npm install
fi

cleanup() {
  trap - EXIT INT TERM
  for pid in $(jobs -p); do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

wait_for() {
  local url=$1
  local name=$2
  local i=0
  while [[ $i -lt 30 ]]; do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "  ✓ $name ready"
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  echo "  ✗ $name failed to start ($url)" >&2
  return 1
}

echo "Starting control plane on 127.0.0.1:${CONTROL_PLANE_PORT}…"
npm run dev:control-plane &
wait_for "http://127.0.0.1:${CONTROL_PLANE_PORT}/api/health" "Control plane"

echo "Starting dashboard on 127.0.0.1:3100…"
npm run dev:dashboard &
wait_for "http://127.0.0.1:3100" "Dashboard"

echo "Starting landing on 127.0.0.1:5173…"
npm run dev:landing &
wait_for "http://127.0.0.1:5173" "Landing"

echo ""
echo "SCAS UI ready:"
echo "  Landing:       http://127.0.0.1:5173"
echo "  Dashboard:     http://127.0.0.1:3100"
echo "  Control plane: http://127.0.0.1:${CONTROL_PLANE_PORT}"
echo ""
echo "Press Ctrl+C to stop all services."

wait
