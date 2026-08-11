#!/usr/bin/env bash
# Shared helpers for docker/install.sh
# shellcheck shell=bash

SCAS_DOCKER_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCAS_DOCKER_ROOT="$(cd "${SCAS_DOCKER_LIB}/.." && pwd)"
SCAS_REPO_ROOT="$(cd "${SCAS_DOCKER_ROOT}/.." && pwd)"

if [[ -t 1 ]]; then
  C_BLUE=$'\033[34m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RED=$'\033[31m'; C_DIM=$'\033[2m'; C_RESET=$'\033[0m'
else
  C_BLUE=; C_GREEN=; C_YELLOW=; C_RED=; C_DIM=; C_RESET=
fi

log()  { printf '%s==>%s %s\n' "${C_BLUE}" "${C_RESET}" "$*"; }
ok()   { printf '%sOK%s  %s\n' "${C_GREEN}" "${C_RESET}" "$*"; }
warn() { printf '%s!!%s  %s\n' "${C_YELLOW}" "${C_RESET}" "$*"; }
err()  { printf '%sERR%s %s\n' "${C_RED}" "${C_RESET}" "$*" >&2; }

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    err "Docker is required. Install Docker Desktop / Engine, then retry."
    exit 1
  fi
  if ! docker compose version >/dev/null 2>&1; then
    err "Docker Compose v2 required (docker compose …)."
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    err "Docker daemon is not running."
    exit 1
  fi
}

port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  return 1
}
