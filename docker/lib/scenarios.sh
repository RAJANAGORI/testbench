#!/usr/bin/env bash
# Scenario lab discovery and lifecycle
# shellcheck shell=bash

scas_list_compose_labs() {
  find "${SCAS_REPO_ROOT}/scenarios" -maxdepth 2 -mindepth 2 \
    \( -name docker-compose.yml -o -name docker-compose.yaml \) \
    ! -path '*/_shared/*' 2>/dev/null \
    | while read -r f; do
        dirname "$f"
      done \
    | sort
}

scas_resolve_scenario() {
  local want="$1"
  local dir
  if [[ -z "$want" ]]; then
    return 1
  fi
  # numeric id: 01 or 1
  if [[ "$want" =~ ^[0-9]+$ ]]; then
    want="$(printf '%02d' "$((10#$want))")"
  fi
  while IFS= read -r dir; do
    local base
    base="$(basename "$dir")"
    if [[ "$base" == "$want" || "$base" == ${want}-* || "$base" == *"-$want" ]]; then
      echo "$dir"
      return 0
    fi
    if [[ "$base" =~ ^${want}- ]]; then
      echo "$dir"
      return 0
    fi
  done < <(scas_list_compose_labs)
  # prefix match: 01 matches 01-typosquatting
  while IFS= read -r dir; do
    local base
    base="$(basename "$dir")"
    if [[ "$base" == "${want}"* ]]; then
      echo "$dir"
      return 0
    fi
  done < <(scas_list_compose_labs)
  return 1
}

scas_running_lab_projects() {
  docker ps --format '{{.Names}}' 2>/dev/null | grep -E '^scas-[0-9]{2}-' || true
}

scas_scenario_up() {
  local dir="$1"
  local compose="${dir}/docker-compose.yml"
  [[ -f "$compose" ]] || compose="${dir}/docker-compose.yaml"
  if [[ ! -f "$compose" ]]; then
    err "No docker-compose.yml in $dir"
    return 1
  fi

  local running
  running="$(scas_running_lab_projects)"
  if [[ -n "$running" ]]; then
    local base
    base="$(basename "$dir")"
    if ! echo "$running" | grep -q "scas-${base}"; then
      warn "Other SCAS lab containers are running:"
      echo "$running" | sed 's/^/  /'
      warn "One scenario lab at a time is recommended (shared host ports)."
      if [[ "${SCAS_FORCE:-}" != "1" ]]; then
        err "Stop other labs first: ./docker/install.sh --down   (or SCAS_FORCE=1 to override)"
        return 1
      fi
    fi
  fi

  log "Building and starting $(basename "$dir")…"
  docker compose -f "$compose" up -d --build --wait --wait-timeout 120
  ok "Lab up: $(basename "$dir")"
  echo ""
  echo "  Shell:   docker compose -f $compose exec victim bash"
  echo "  Verify:  $dir/verify.sh"
  echo "  Stop:    docker compose -f $compose down -v"
  echo ""
}

scas_scenario_down() {
  local dir="${1:-}"
  if [[ -n "$dir" ]]; then
    local compose="${dir}/docker-compose.yml"
    [[ -f "$compose" ]] || compose="${dir}/docker-compose.yaml"
    if [[ -f "$compose" ]]; then
      log "Stopping $(basename "$dir")…"
      docker compose -f "$compose" down -v --remove-orphans
    fi
    return 0
  fi
  log "Stopping all compose-backed scenario labs…"
  while IFS= read -r dir; do
    docker compose -f "${dir}/docker-compose.yml" down -v --remove-orphans 2>/dev/null || true
  done < <(scas_list_compose_labs)
}

scas_scenario_status() {
  printf '\n%sScenario labs%s\n' "${C_DIM}" "${C_RESET}"
  local any=0
  while IFS= read -r dir; do
    local base compose
    base="$(basename "$dir")"
    compose="${dir}/docker-compose.yml"
    local ids
    ids="$(docker compose -f "$compose" ps -q 2>/dev/null || true)"
    if [[ -n "$ids" ]]; then
      any=1
      ok "$base"
      docker compose -f "$compose" ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || true
    fi
  done < <(scas_list_compose_labs)
  if [[ "$any" -eq 0 ]]; then
    warn "No scenario lab containers running"
  fi
}

scas_print_lab_menu() {
  local i=1
  local dir
  SCAS_MENU_DIRS=()
  while IFS= read -r dir; do
    SCAS_MENU_DIRS+=("$dir")
    printf '  %2d) %s\n' "$i" "$(basename "$dir")"
    i=$((i + 1))
  done < <(scas_list_compose_labs)
}
