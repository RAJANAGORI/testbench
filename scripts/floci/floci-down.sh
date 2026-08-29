#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
FLOCI_DIR="${REPO_ROOT}/infrastructure/floci"
# shellcheck source=floci-bridge.sh
source "${SCRIPT_DIR}/floci-bridge.sh"

COMPOSE_FILE="${FLOCI_DIR}/docker-compose.yml"
if [ -f "${FLOCI_DIR}/.env" ]; then
  # shellcheck disable=SC1091
  source "${FLOCI_DIR}/.env"
  [ "${FLOCI_USE_IMAGE:-0}" = "1" ] && COMPOSE_FILE="${FLOCI_DIR}/docker-compose.image.yml"
fi

scas_floci_export_docker_sock
scas_floci_compose "${FLOCI_DIR}" "${COMPOSE_FILE}" down 2>/dev/null \
  || docker stop scas-floci 2>/dev/null \
  || true

echo "✅ SCAS Floci stopped"
