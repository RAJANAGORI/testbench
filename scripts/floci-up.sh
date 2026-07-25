#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FLOCI_DIR="${REPO_ROOT}/infrastructure/floci"
# shellcheck source=floci-bridge.sh
source "${SCRIPT_DIR}/floci-bridge.sh"

[ -f "${FLOCI_DIR}/.env" ] || { echo "Run ./scripts/floci-setup.sh first"; exit 1; }

# shellcheck disable=SC1091
source "${FLOCI_DIR}/.env" 2>/dev/null || true
if [ -f "${REPO_ROOT}/.floci.env" ]; then
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/.floci.env"
fi

COMPOSE_FILE="${FLOCI_DIR}/docker-compose.yml"
if [ "${FLOCI_USE_IMAGE:-0}" = "1" ]; then
  COMPOSE_FILE="${FLOCI_DIR}/docker-compose.image.yml"
fi

if [ "${FLOCI_USE_IMAGE:-0}" != "1" ] && [ ! -d "${REPO_ROOT}/vendor/floci-aws/docker" ]; then
  echo "❌ vendor/floci-aws missing. Run: ./scripts/floci-setup.sh"
  exit 1
fi

# First boot after image pull can take several minutes (esp. with ES/Kibana already running).
FLOCI_HEALTH_TRIES="${FLOCI_HEALTH_TRIES:-120}"   # × sleep = wall clock
FLOCI_HEALTH_SLEEP="${FLOCI_HEALTH_SLEEP:-3}"     # default ~6 minutes
FLOCI_INIT_TRIES="${FLOCI_INIT_TRIES:-120}"

floci_diag() {
  echo ""
  echo "── Floci diagnostics ──────────────────────────────────"
  echo "Endpoint: ${SCAS_FLOCI_ENDPOINT}"
  echo "Compose:  ${COMPOSE_FILE}"
  docker ps -a --filter name=scas-floci --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || true
  echo ""
  echo "Last 40 log lines:"
  docker logs scas-floci --tail 40 2>&1 || true
  echo ""
  echo "Host probe:"
  curl -sS -o /dev/null -w "  curl %{http_code}  %{url_effective}\n" \
    "${SCAS_FLOCI_ENDPOINT}/_floci/health" 2>&1 || echo "  curl failed"
  if ss -lnt 2>/dev/null | grep -q ':4566' || netstat -lnt 2>/dev/null | grep -q ':4566'; then
    echo "  Port 4566 is listening on the host"
  else
    echo "  Port 4566 is NOT listening on the host yet"
  fi
  echo "───────────────────────────────────────────────────────"
}

wait_floci_health() {
  local tries="$1"
  local n=0
  while [ "$tries" -gt 0 ]; do
    if scas_floci_health; then
      return 0
    fi
    n=$((n + 1))
    if [ $((n % 10)) -eq 0 ]; then
      local status
      status="$(docker inspect -f '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}no-health{{end}}' scas-floci 2>/dev/null || echo missing)"
      echo "   … still waiting (${n} probes, container=${status})"
    fi
    # Container exited — no point spinning the full timeout
    if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'scas-floci'; then
      echo "❌ Container scas-floci is not running"
      return 1
    fi
    tries=$((tries - 1))
    sleep "${FLOCI_HEALTH_SLEEP}"
  done
  return 1
}

echo "🚀 Starting SCAS Floci emulator..."
docker compose -f "${COMPOSE_FILE}" --env-file "${FLOCI_DIR}/.env" up -d

# Give the JVM/process a moment before the first probe
sleep 5

echo "⏳ Waiting for health (${SCAS_FLOCI_ENDPOINT}/_floci/health)..."
echo "   (up to ~$((FLOCI_HEALTH_TRIES * FLOCI_HEALTH_SLEEP))s — first start can be slow)"

if ! wait_floci_health "${FLOCI_HEALTH_TRIES}"; then
  echo "❌ Floci did not become healthy in time."
  floci_diag

  # One automatic recover attempt: recreate container
  echo ""
  echo "🔁 Retrying once (compose up -d --force-recreate)…"
  docker compose -f "${COMPOSE_FILE}" --env-file "${FLOCI_DIR}/.env" up -d --force-recreate
  sleep 8
  if wait_floci_health 40; then
    echo "✅ Floci healthy after recreate"
  else
    floci_diag
    echo ""
    echo "Hints:"
    echo "  • Free RAM (Elasticsearch + Kibana + Floci often need 12–16 GB total)"
    echo "  • Check port:  ./scripts/kill-port.sh 4566   then re-run this script"
    echo "  • Logs:        docker logs -f scas-floci"
    echo "  • Status:      ./scripts/floci-status.sh"
    exit 1
  fi
fi

echo "⏳ Waiting for Floci init (S3 and services ready)…"
if scas_floci_wait_init "${FLOCI_INIT_TRIES}"; then
  echo "✅ Floci is ready on port ${FLOCI_PORT:-4566}"
  echo "   Container: scas-floci"
  echo "   Enable labs: source ${REPO_ROOT}/.floci.env"
  exit 0
fi

floci_diag
exit 1
