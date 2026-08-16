#!/usr/bin/env bash
# Platform stack: Elasticsearch, Kibana, Floci
# shellcheck shell=bash

scas_platform_up() {
  require_docker
  log "Starting Elasticsearch + Kibana…"
  "${SCAS_REPO_ROOT}/scripts/observability/elasticsearch-up.sh"

  log "Configuring Floci (image/auto)…"
  if [[ ! -f "${SCAS_REPO_ROOT}/infrastructure/floci/.env" ]] && [[ ! -f "${SCAS_REPO_ROOT}/.floci.env" ]]; then
    "${SCAS_REPO_ROOT}/scripts/floci/floci-setup.sh" --auto || \
      "${SCAS_REPO_ROOT}/scripts/floci/floci-setup.sh" --image || true
  fi

  log "Starting Floci…"
  if ! "${SCAS_REPO_ROOT}/scripts/floci/floci-up.sh"; then
    warn "Floci failed to start. Labs still work; cloud-track features need Floci later."
    warn "Retry: ./scripts/floci/floci-up.sh"
  fi
}

scas_platform_down() {
  require_docker
  log "Stopping Floci…"
  "${SCAS_REPO_ROOT}/scripts/floci/floci-down.sh" 2>/dev/null || true
  log "Stopping Elasticsearch + Kibana…"
  "${SCAS_REPO_ROOT}/scripts/observability/elasticsearch-down.sh" 2>/dev/null || true
}

scas_platform_status() {
  local es_port kibana_port
  es_port=9200
  kibana_port=5601
  if [[ -f "${SCAS_REPO_ROOT}/observability/.env" ]]; then
    # shellcheck disable=SC1091
    source "${SCAS_REPO_ROOT}/observability/.env" 2>/dev/null || true
    es_port="${ES_PORT:-9200}"
    kibana_port="${KIBANA_PORT:-5601}"
  fi

  printf '\n%sPlatform%s\n' "${C_DIM}" "${C_RESET}"
  if curl -fsS "http://127.0.0.1:${es_port}/_cluster/health" >/dev/null 2>&1; then
    ok "Elasticsearch  http://localhost:${es_port}"
  else
    warn "Elasticsearch  (down) http://localhost:${es_port}"
  fi
  if curl -fsS -o /dev/null "http://127.0.0.1:${kibana_port}" 2>/dev/null; then
    ok "Kibana         http://localhost:${kibana_port}"
  else
    warn "Kibana         (down) http://localhost:${kibana_port}"
  fi
  if curl -fsS -o /dev/null "http://127.0.0.1:4566/_floci/health" 2>/dev/null || \
     curl -fsS -o /dev/null "http://127.0.0.1:4566" 2>/dev/null; then
    ok "Floci          http://localhost:4566"
  else
    warn "Floci          (down) http://localhost:4566"
  fi
}
