#!/usr/bin/env bash
# SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori — Supply Chain Attack Simulator
#
# One-shot installer / orchestrator for the full SCAS workshop stack:
#   - prerequisites (Node, npm, Python, Git, Docker, curl)
#   - TESTBENCH_MODE + repo permissions
#   - npm workspaces (landing / dashboard / control-plane) + detection-tools
#   - Elasticsearch + Kibana (observability)
#   - Floci local-AWS emulator (cloud track)
#   - Lookalike lab secrets (victim fixtures + Floci SM/SSM when Floci is up)
#
# Usage:
#   ./install.sh                 # interactive full stack
#   ./install.sh -y              # non-interactive full stack
#   ./install.sh -y --core-only  # SCAS core + npm only (no Docker services)
#   ./install.sh -y --skip-es    # skip Elasticsearch/Kibana
#   ./install.sh -y --skip-floci # skip Floci
#   ./install.sh -y --no-start   # install/configure but do not start containers
#   ./install.sh -y --floci-build  # build Floci from vendor source (slow)
#   ./install.sh -y --with-ui    # exec ./scripts/start-dashboard.sh at the end
#
# After install, every session:
#   source .scas.env
#   ./scripts/start-dashboard.sh   # optional UI

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${REPO_ROOT}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

YES=0
CORE_ONLY=0
SKIP_ES=0
SKIP_FLOCI=0
NO_START=0
FLOCI_IMAGE=1
START_UI=0

usage() {
  awk 'NR==1{next} /^#/{sub(/^# ?/,""); print; next} {exit}' "$0"
  exit 0
}

for arg in "$@"; do
  case "$arg" in
    -y|--yes) YES=1 ;;
    --core-only) CORE_ONLY=1 ;;
    --skip-es) SKIP_ES=1 ;;
    --skip-floci) SKIP_FLOCI=1 ;;
    --no-start) NO_START=1 ;;
    --floci-build) FLOCI_IMAGE=0 ;;
    --with-ui) START_UI=1 ;;
    -h|--help) usage ;;
    *)
      echo -e "${RED}Unknown option: ${arg}${NC}"
      awk 'NR==1{next} /^#/{sub(/^# ?/,""); print; next} {exit}' "$0"
      exit 1
      ;;
  esac
done

if [ "$CORE_ONLY" = "1" ]; then
  SKIP_ES=1
  SKIP_FLOCI=1
fi

log()  { echo -e "${BLUE}▶${NC} $*"; }
ok()   { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC}  $*"; }
err()  { echo -e "${RED}❌${NC} $*"; }

need_cmd() {
  local name="$1"
  local hint="${2:-}"
  if ! command -v "$name" >/dev/null 2>&1; then
    err "Missing required command: ${name}"
    [ -n "$hint" ] && echo "   ${hint}"
    return 1
  fi
  return 0
}

version_ge() {
  # version_ge 20.0.0 16.0.0 → true if $1 >= $2 (simple dotted compare)
  local IFS=.
  # shellcheck disable=SC2206
  local a=($1) b=($2)
  local i
  for i in 0 1 2; do
    local x="${a[$i]:-0}" y="${b[$i]:-0}"
    if ((10#$x > 10#$y)); then return 0; fi
    if ((10#$x < 10#$y)); then return 1; fi
  done
  return 0
}

echo ""
echo -e "${CYAN}=========================================================${NC}"
echo -e "${CYAN}  SCAS — Full stack installer${NC}"
echo -e "${CYAN}  Supply Chain Attack Simulator${NC}"
echo -e "${CYAN}=========================================================${NC}"
echo ""
echo "Repo: ${REPO_ROOT}"
echo ""

# ── Safety notice ────────────────────────────────────────────
echo -e "${YELLOW}Educational use only. Isolated environments. Localhost exfil only.${NC}"
echo -e "${YELLOW}Payloads require TESTBENCH_MODE=enabled.${NC}"
echo ""

if [ "$YES" != "1" ]; then
  read -r -p "Continue with full SCAS install? (y/N): " reply
  echo ""
  if [[ ! "${reply}" =~ ^[Yy]$ ]]; then
    echo "Install cancelled."
    exit 0
  fi
fi

# ── 1. Prerequisites ─────────────────────────────────────────
log "Checking prerequisites…"
echo ""

MISSING=0

if need_cmd node "Install Node.js 20+ (https://nodejs.org) — repo pins .nvmrc 20.19.0"; then
  NODE_RAW="$(node --version | sed 's/^v//')"
  ok "Node.js v${NODE_RAW}"
  if ! version_ge "${NODE_RAW}" "16.0.0"; then
    err "Node.js 16+ required (found ${NODE_RAW})"
    MISSING=1
  elif ! version_ge "${NODE_RAW}" "20.0.0"; then
    warn "Node ${NODE_RAW} works for labs; UI stack is validated on Node 20 (.nvmrc)"
  fi
else
  MISSING=1
fi

if need_cmd npm "Comes with Node.js"; then
  ok "npm $(npm --version)"
else
  MISSING=1
fi

if need_cmd python3 "Install Python 3.8+ (3.11 recommended — see .python-version)"; then
  ok "Python $(python3 --version | awk '{print $2}')"
else
  MISSING=1
fi

if need_cmd git "Install Git"; then
  ok "Git $(git --version | awk '{print $3}')"
else
  MISSING=1
fi

if need_cmd curl "Install curl"; then
  ok "curl available"
else
  MISSING=1
fi

NEED_DOCKER=0
if [ "$SKIP_ES" != "1" ] || [ "$SKIP_FLOCI" != "1" ]; then
  NEED_DOCKER=1
fi

if [ "$NEED_DOCKER" = "1" ]; then
  if need_cmd docker "Install Docker Desktop / Docker Engine — required for ES, Kibana, Floci"; then
    ok "Docker $(docker --version | head -1)"
  else
    MISSING=1
  fi
  if ! docker compose version >/dev/null 2>&1; then
    err "Docker Compose v2 required (docker compose …)"
    MISSING=1
  else
    ok "Docker Compose $(docker compose version --short 2>/dev/null || echo v2)"
  fi
  if ! docker info >/dev/null 2>&1; then
    err "Docker daemon is not running — start Docker Desktop and retry"
    MISSING=1
  else
    ok "Docker daemon is running"
  fi
fi

echo ""
if [ "$MISSING" = "1" ]; then
  err "Fix missing prerequisites and re-run ./install.sh"
  echo ""
  echo "Quick tips:"
  echo "  macOS:  brew install node python git curl && brew install --cask docker"
  echo "  Ubuntu: sudo apt install nodejs npm python3 git curl docker.io docker-compose-v2"
  echo "  nvm:    nvm install && nvm use   # uses .nvmrc"
  exit 1
fi

# ── 2. Permissions + TESTBENCH_MODE ──────────────────────────
log "Configuring TESTBENCH_MODE and script permissions…"

chmod +x \
  install.sh \
  START_HERE.sh \
  scripts/*.sh \
  scenarios/_shared/plant-lookalike-secrets.sh \
  scenarios/_shared/ensure-lookalike-secrets.sh \
  scenarios/_shared/generate-lookalike-secrets.py \
  2>/dev/null || true
find scenarios -name 'setup.sh' -type f -exec chmod +x {} \; 2>/dev/null || true
find scenarios -name 'clean.sh' -type f -exec chmod +x {} \; 2>/dev/null || true

TESTBENCH_ENV_FILE="${REPO_ROOT}/.testbench.env"
export TESTBENCH_MODE=enabled
if [ ! -f "${TESTBENCH_ENV_FILE}" ] || ! grep -q '^export TESTBENCH_MODE=enabled$' "${TESTBENCH_ENV_FILE}"; then
  cat > "${TESTBENCH_ENV_FILE}" << 'EOF'
# Generated by install.sh / scripts/setup.sh
export TESTBENCH_MODE=enabled
EOF
fi
ok "TESTBENCH_MODE → ${TESTBENCH_ENV_FILE}"

mkdir -p logs detection-tools
ok "logs/ and detection-tools/ ready"

# ── 3. npm workspaces + detection-tools ──────────────────────
log "Installing npm workspaces (landing, dashboard, control-plane)…"
npm install --no-fund --no-audit
ok "Root workspaces installed"

log "Installing detection-tools dependencies…"
npm install --prefix detection-tools --no-fund --no-audit
ok "detection-tools ready"

# ── 4. Observability (Elasticsearch + Kibana) ────────────────
if [ "$SKIP_ES" = "1" ]; then
  warn "Skipping Elasticsearch / Kibana (--skip-es / --core-only)"
else
  if [ "$NO_START" = "1" ]; then
    log "Preparing observability env (not starting containers)…"
    if [ ! -f observability/.env ] && [ -f observability/.env.example ]; then
      cp observability/.env.example observability/.env
      ok "Created observability/.env"
    fi
  else
    log "Starting Elasticsearch + Kibana (first pull may take a few minutes)…"
    ./scripts/elasticsearch-up.sh
    ok "Elasticsearch :9200 · Kibana :5601"
  fi
fi

# ── 5. Floci (local AWS) ─────────────────────────────────────
if [ "$SKIP_FLOCI" = "1" ]; then
  warn "Skipping Floci (--skip-floci / --core-only)"
else
  if [ "$FLOCI_IMAGE" = "1" ]; then
    log "Setting up Floci (published image — recommended)…"
    ./scripts/floci-setup.sh --image
  else
    log "Setting up Floci (source build — may take 5–15 minutes)…"
    ./scripts/floci-setup.sh
  fi
  ok "Floci configured (.floci.env)"

  if [ "$NO_START" != "1" ]; then
    log "Starting Floci emulator on :4566…"
    ./scripts/floci-up.sh
    ok "Floci healthy"
  else
    warn "Floci installed but not started (--no-start). Later: ./scripts/floci-up.sh"
  fi
fi

# ── 6. Lookalike harvest secrets (LAB ONLY, generated locally) ─
log "Generating lookalike secrets (gitignored — avoids secret-scan push blocks)…"
# shellcheck disable=SC1091
source "${REPO_ROOT}/scenarios/_shared/ensure-lookalike-secrets.sh"
ok "Generated scenarios/_shared/lookalike-secrets.{env,json}"

log "Planting lookalike secrets for Floci harvest labs (05, 06, 21, 23)…"
PLANT="${REPO_ROOT}/scenarios/_shared/plant-lookalike-secrets.sh"
if [ -f "${PLANT}" ]; then
  for sid in 05 06 21 23; do
    bash "${PLANT}" "${sid}" || warn "plant-lookalike-secrets ${sid} skipped"
  done
  ok "Victim fixtures planted (.env.lab / .npmrc / .env.ci-lab)"
else
  warn "Missing ${PLANT}"
fi

if [ "$SKIP_FLOCI" != "1" ] && [ "$NO_START" != "1" ]; then
  log "Seeding lookalike secrets into Floci Secrets Manager / SSM…"
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/scripts/floci-bridge.sh"
  if scas_floci_require 2>/dev/null; then
    for sid in 05 06 21 23; do
      scas_floci_seed_lookalike_secrets "${sid}" || warn "Floci lookalike seed ${sid} skipped"
    done
    ok "Floci SM/SSM lookalikes seeded (re-run scenario seed.sh for full S3/ECR baseline)"
  else
    warn "Floci not healthy — SM/SSM lookalikes not seeded. Later: ./scripts/floci-up.sh then re-run seed"
  fi
elif [ "$SKIP_FLOCI" != "1" ] && [ "$NO_START" = "1" ]; then
  warn "Floci SM/SSM lookalikes deferred (--no-start). After floci-up, seed via scenario infrastructure/floci/seed.sh"
fi

# ── 7. Unified session env ───────────────────────────────────
log "Writing .scas.env (source this every session)…"

SCAS_ENV_FILE="${REPO_ROOT}/.scas.env"
{
  cat << 'EOF'
# SCAS session environment — generated by ./install.sh
# Usage:  source .scas.env
# SCAS-FP-RN-8d4f2c9a1e7b3065

_SCAS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

# Safety gate (required for malicious lab paths)
if [ -f "${_SCAS_ROOT}/.testbench.env" ]; then
  # shellcheck disable=SC1091
  source "${_SCAS_ROOT}/.testbench.env"
fi
export TESTBENCH_MODE="${TESTBENCH_MODE:-enabled}"

EOF

  if [ "$SKIP_ES" != "1" ]; then
    cat << 'EOF'
# Live capture → Elasticsearch (mock servers forward when set)
export SCAS_ES_URL="${SCAS_ES_URL:-http://localhost:9200}"
export KIBANA_URL="${KIBANA_URL:-http://localhost:5601}"

EOF
  fi

  if [ "$SKIP_FLOCI" != "1" ]; then
    cat << 'EOF'
# Floci local-AWS track
if [ -f "${_SCAS_ROOT}/.floci.env" ]; then
  # shellcheck disable=SC1091
  source "${_SCAS_ROOT}/.floci.env"
fi

EOF
  fi

  cat << 'EOF'
# Lookalike harvest secrets — OPT-IN only (would overwrite Floci emulator AWS_* if sourced here).
# Before a credential-harvest lab (05/06/21/23):
#   set -a && source "${_SCAS_ROOT}/scenarios/_shared/lookalike-secrets.env" && set +a
# Then restore emulator auth if you need Floci CLI again: source .floci.env

unset _SCAS_ROOT
EOF
} > "${SCAS_ENV_FILE}"

ok "Wrote ${SCAS_ENV_FILE}"

# ── 8. Optional UI ───────────────────────────────────────────
if [ "$START_UI" = "1" ]; then
  if [ "$NO_START" = "1" ]; then
    warn "--with-ui ignored because --no-start was set"
  else
    log "Starting Control Center UI (./scripts/start-dashboard.sh)…"
    echo "   (run in a separate terminal if you prefer — this script will exec the UI starter)"
    exec ./scripts/start-dashboard.sh
  fi
fi

# ── Summary ──────────────────────────────────────────────────
echo ""
echo -e "${CYAN}=========================================================${NC}"
echo -e "${GREEN}  SCAS install complete${NC}"
echo -e "${CYAN}=========================================================${NC}"
echo ""
echo "Every session (repo root):"
echo -e "  ${GREEN}source .scas.env${NC}"
echo ""

if [ "$SKIP_ES" != "1" ] && [ "$NO_START" != "1" ]; then
  echo "Observability:"
  echo "  Elasticsearch  http://localhost:9200"
  echo "  Kibana         http://localhost:5601"
  echo ""
fi

if [ "$SKIP_FLOCI" != "1" ] && [ "$NO_START" != "1" ]; then
  echo "Floci:"
  echo "  Emulator       http://127.0.0.1:4566"
  echo "  Status         ./scripts/floci-status.sh"
  echo ""
fi

echo "Lookalike secrets (LAB ONLY, generated locally — not in git):"
echo "  Regenerate: python3 scenarios/_shared/generate-lookalike-secrets.py"
echo "  Harvest:    set -a && source scenarios/_shared/lookalike-secrets.env && set +a"
echo "  Docs:       scenarios/_shared/LOOKALIKE_SECRETS.md"
echo ""
echo "Next steps:"
echo "  1. source .scas.env"
echo "  2. Optional UI:     ./scripts/start-dashboard.sh"
echo "     Landing          http://localhost:5173"
echo "     Dashboard        http://localhost:3100"
echo "  3. First lab:       cd scenarios/01-typosquatting && ./setup.sh"
echo "  4. Docs:            documentation/getting-started/FULL_STACK_SETUP.md"
echo ""
echo "Shutdown:"
echo "  ./scripts/floci-down.sh"
echo "  ./scripts/elasticsearch-down.sh"
echo "  ./scripts/teardown.sh"
echo ""
echo -e "${YELLOW}Remember: education only · isolated environments · never publish lab malware${NC}"
echo ""
