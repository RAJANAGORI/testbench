#!/usr/bin/env bash
# Point Docker (images/containers/volumes) + optional SCAS repo at an external disk.
# Aimed at Raspberry Pi / low-SD-card hosts with a USB HDD/SSD.
#
# Usage:
#   ./scripts/setup/setup-external-storage.sh /run/media/$USER/<uuid-or-label>
#   ./scripts/setup/setup-external-storage.sh /run/media/$USER/<uuid> --persist-mount
#   ./scripts/setup/setup-external-storage.sh /mnt/scas-data --docker-only
#   ./scripts/setup/setup-external-storage.sh /mnt/scas-data --move-repo
#
# SCAS-FP-RN-8d4f2c9a1e7b3065

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}▶${NC} $*"; }
ok()   { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC}  $*"; }
err()  { echo -e "${RED}❌${NC} $*"; }

TARGET=""
PERSIST_MOUNT=0
DOCKER_ONLY=0
MOVE_REPO=0
CLONE_REPO=0
YES=0
STABLE_MOUNT="/mnt/scas-data"

usage() {
  sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

for arg in "$@"; do
  case "$arg" in
    -h|--help) usage ;;
    -y|--yes) YES=1 ;;
    --persist-mount) PERSIST_MOUNT=1 ;;
    --docker-only) DOCKER_ONLY=1 ;;
    --move-repo) MOVE_REPO=1 ;;
    --clone-repo) CLONE_REPO=1 ;;
    --stable-mount=*) STABLE_MOUNT="${arg#*=}" ;;
    -*)
      err "Unknown option: $arg"
      usage
      ;;
    *)
      if [ -z "$TARGET" ]; then
        TARGET="$arg"
      else
        err "Unexpected argument: $arg"
        exit 1
      fi
      ;;
  esac
done

ask_yn() {
  local prompt="$1"
  local reply
  if [ "$YES" = "1" ]; then
    echo "${prompt} (y/N): y  [auto --yes]"
    return 0
  fi
  read -r -p "${prompt} (y/N): " reply
  [[ "${reply}" =~ ^[Yy]$ ]]
}

if [ -z "$TARGET" ]; then
  err "Pass the external disk mount path"
  echo "Example:"
  echo "  $0 /run/media/\$USER/a0a6fb60-8114-4e3b-a274-aa1139667b7b --persist-mount --move-repo"
  exit 1
fi

if [ ! -d "$TARGET" ]; then
  err "Path does not exist or is not mounted: ${TARGET}"
  echo "Plug in the disk and mount it, then re-run."
  exit 1
fi

if [ ! -w "$TARGET" ]; then
  err "Path is not writable by $(whoami): ${TARGET}"
  exit 1
fi

# Prefer a stable mount point — /run/media/... often disappears after reboot/unplug UX
DATA_ROOT="$TARGET"
UUID_CANDIDATE="$(basename "$TARGET")"
if [[ "$UUID_CANDIDATE" =~ ^[0-9a-fA-F-]{36}$ ]]; then
  DISK_UUID="$UUID_CANDIDATE"
else
  DISK_UUID="$(findmnt -no UUID "$TARGET" 2>/dev/null || true)"
fi

echo ""
echo "========================================================="
echo "  SCAS external storage setup"
echo "========================================================="
echo "Disk path:     ${TARGET}"
echo "Stable mount:  ${STABLE_MOUNT}  (used if --persist-mount)"
echo "Docker root:   <base>/scas/docker"
echo "SCAS data:     <base>/scas/{repo,npm-cache,logs}"
echo ""

if [ "$PERSIST_MOUNT" = "1" ]; then
  if [ -z "${DISK_UUID:-}" ]; then
    err "Could not determine filesystem UUID for persist-mount"
    echo "   findmnt -no UUID ${TARGET}"
    exit 1
  fi
  FSTYPE="$(findmnt -no FSTYPE "$TARGET" 2>/dev/null || echo ext4)"
  log "Creating persistent mount ${STABLE_MOUNT} → UUID=${DISK_UUID} (${FSTYPE})"

  if ! ask_yn "Write systemd mount unit + mount now? (needs sudo)"; then
    err "Aborted"
    exit 1
  fi

  sudo mkdir -p "$STABLE_MOUNT"
  UNIT_NAME="$(systemd-escape -p --suffix=mount "$STABLE_MOUNT")"
  # e.g. mnt-scas\x2ddata.mount
  sudo tee "/etc/systemd/system/${UNIT_NAME}" >/dev/null <<EOF
[Unit]
Description=SCAS external data disk
After=local-fs.target
Before=docker.service

[Mount]
What=UUID=${DISK_UUID}
Where=${STABLE_MOUNT}
Type=${FSTYPE}
Options=defaults,nofail,x-systemd.device-timeout=30s

[Install]
WantedBy=multi-user.target
EOF

  # Ensure Docker waits for the disk
  sudo mkdir -p /etc/systemd/system/docker.service.d
  sudo tee /etc/systemd/system/docker.service.d/scas-wait-disk.conf >/dev/null <<EOF
[Unit]
RequiresMountsFor=${STABLE_MOUNT}
After=${UNIT_NAME}
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable --now "${UNIT_NAME}"
  if ! mountpoint -q "$STABLE_MOUNT"; then
    err "Failed to mount ${STABLE_MOUNT}"
    exit 1
  fi
  ok "Persistent mount active: ${STABLE_MOUNT}"
  DATA_ROOT="$STABLE_MOUNT"
else
  case "$TARGET" in
    /run/media/*|/media/*)
      warn "/run/media and /media mounts are often temporary."
      warn "Strongly recommended: re-run with --persist-mount so Docker survives reboot."
      if ask_yn "Enable --persist-mount now?"; then
        PERSIST_MOUNT=1
        exec "$0" "$TARGET" --persist-mount \
          $([ "$DOCKER_ONLY" = "1" ] && echo --docker-only) \
          $([ "$MOVE_REPO" = "1" ] && echo --move-repo) \
          $([ "$CLONE_REPO" = "1" ] && echo --clone-repo) \
          $([ "$YES" = "1" ] && echo -y) \
          --stable-mount="${STABLE_MOUNT}"
      fi
      ;;
  esac
fi

SCAS_BASE="${DATA_ROOT}/scas"
DOCKER_DATA="${SCAS_BASE}/docker"
NPM_CACHE="${SCAS_BASE}/npm-cache"
LOG_DIR="${SCAS_BASE}/logs"
REPO_DIR="${SCAS_BASE}/repo/supply-chain-attack-simulator"

log "Creating layout under ${SCAS_BASE}"
mkdir -p "$DOCKER_DATA" "$NPM_CACHE" "$LOG_DIR" "$(dirname "$REPO_DIR")"
ok "Layout ready"

# ── Docker data-root ─────────────────────────────────────────
command -v docker >/dev/null 2>&1 || { err "Docker is not installed. Install Docker first, then re-run."; exit 1; }

CURRENT_ROOT="$(docker info -f '{{.DockerRootDir}}' 2>/dev/null || echo /var/lib/docker)"
log "Current Docker Root Dir: ${CURRENT_ROOT}"

if [ "$CURRENT_ROOT" = "$DOCKER_DATA" ]; then
  ok "Docker already uses ${DOCKER_DATA}"
else
  echo ""
  warn "This will STOP Docker and move its data to the external disk."
  warn "Existing containers/images will be migrated (rsync)."
  if ! ask_yn "Reconfigure Docker data-root → ${DOCKER_DATA}?"; then
    err "Skipped Docker reconfiguration"
  else
    DAEMON_JSON="/etc/docker/daemon.json"
    TMP_JSON="$(mktemp)"
    if [ -f "$DAEMON_JSON" ]; then
      sudo cp "$DAEMON_JSON" "${DAEMON_JSON}.bak.$(date +%s)"
      # Merge data-root via python (preserve other keys)
      sudo python3 - "$DAEMON_JSON" "$DOCKER_DATA" "$TMP_JSON" <<'PY'
import json, sys
src, root, out = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    with open(src) as f:
        data = json.load(f)
except Exception:
    data = {}
if not isinstance(data, dict):
    data = {}
data["data-root"] = root
# overlay2 is correct on modern Pi OS / Ubuntu aarch64
data.setdefault("storage-driver", "overlay2")
with open(out, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
      sudo mv "$TMP_JSON" "$DAEMON_JSON"
    else
      sudo mkdir -p /etc/docker
      sudo tee "$DAEMON_JSON" >/dev/null <<EOF
{
  "data-root": "${DOCKER_DATA}",
  "storage-driver": "overlay2"
}
EOF
    fi
    ok "Wrote ${DAEMON_JSON}"

    log "Stopping Docker…"
    sudo systemctl stop docker.socket 2>/dev/null || true
    sudo systemctl stop docker

    if [ -d "$CURRENT_ROOT" ] && [ "$(sudo ls -A "$CURRENT_ROOT" 2>/dev/null | head -1)" ]; then
      log "Migrating ${CURRENT_ROOT} → ${DOCKER_DATA} (may take a while)…"
      sudo rsync -aHAX --info=progress2 "${CURRENT_ROOT}/" "${DOCKER_DATA}/"
      ok "Migration copy complete"
      # Keep old tree as backup rename (free SD later manually)
      if [ "$CURRENT_ROOT" = "/var/lib/docker" ]; then
        if ask_yn "Rename old /var/lib/docker → /var/lib/docker.bak.scas (frees nothing until you delete it)?"; then
          sudo mv /var/lib/docker "/var/lib/docker.bak.scas.$(date +%s)"
          sudo mkdir -p /var/lib/docker
        fi
      fi
    else
      warn "No existing Docker data to migrate (fresh install)"
    fi

    # Permissions: docker daemon runs as root; root-owned data-root is fine
    sudo chown -R root:root "$DOCKER_DATA"

    log "Starting Docker…"
    sudo systemctl daemon-reload
    sudo systemctl start docker
    sleep 2
    NEW_ROOT="$(docker info -f '{{.DockerRootDir}}' 2>/dev/null || true)"
    if [ "$NEW_ROOT" = "$DOCKER_DATA" ]; then
      ok "Docker Root Dir is now ${NEW_ROOT}"
    else
      err "Docker Root Dir is '${NEW_ROOT}' (expected ${DOCKER_DATA})"
      echo "   Check: sudo journalctl -u docker -n 50 --no-pager"
      exit 1
    fi
  fi
fi

# ── npm cache on HDD (faster SD, less wear) ──────────────────
if [ "$DOCKER_ONLY" != "1" ]; then
  log "Configuring npm cache → ${NPM_CACHE}"
  mkdir -p "$NPM_CACHE"
  npm config set cache "$NPM_CACHE" --location=user 2>/dev/null || true
  ok "npm cache: $(npm config get cache 2>/dev/null || echo "$NPM_CACHE")"
fi

# ── Repo on HDD ──────────────────────────────────────────────
if [ "$DOCKER_ONLY" != "1" ] && { [ "$MOVE_REPO" = "1" ] || [ "$CLONE_REPO" = "1" ]; }; then
  if [ "$CLONE_REPO" = "1" ] && [ ! -d "$REPO_DIR/.git" ]; then
    log "Cloning SCAS into ${REPO_DIR}"
    git clone https://github.com/RAJANAGORI/supply-chain-attack-simulator.git "$REPO_DIR"
    ok "Cloned to ${REPO_DIR}"
  elif [ "$MOVE_REPO" = "1" ]; then
    if [ -d "$REPO_DIR/.git" ]; then
      ok "Repo already at ${REPO_DIR}"
    elif [ "$(cd "$REPO_ROOT" && pwd)" != "$(cd "$REPO_DIR" 2>/dev/null && pwd || true)" ]; then
      log "Copying repo ${REPO_ROOT} → ${REPO_DIR}"
      mkdir -p "$REPO_DIR"
      rsync -a --exclude node_modules --exclude .next --exclude '**/node_modules' \
        "${REPO_ROOT}/" "${REPO_DIR}/"
      ok "Repo copied to ${REPO_DIR}"
      warn "Use the HDD copy from now on:"
      echo "   cd ${REPO_DIR}"
      if [ -d "${HOME}/supply-chain-attack-simulator" ] && [ "$(cd "${HOME}/supply-chain-attack-simulator" && pwd)" = "$(cd "$REPO_ROOT" && pwd)" ]; then
        if ask_yn "Replace ~/supply-chain-attack-simulator with a symlink to the HDD copy?"; then
          mv "${HOME}/supply-chain-attack-simulator" "${HOME}/supply-chain-attack-simulator.sd.bak.$(date +%s)"
          ln -s "$REPO_DIR" "${HOME}/supply-chain-attack-simulator"
          ok "Symlink: ~/supply-chain-attack-simulator → ${REPO_DIR}"
        fi
      fi
    fi
  fi
fi

# Marker env for install.sh / sessions
MARKER="${SCAS_BASE}/scas-storage.env"
cat > "$MARKER" <<EOF
# Generated by scripts/setup/setup-external-storage.sh
export SCAS_EXTERNAL_ROOT="${SCAS_BASE}"
export SCAS_DOCKER_DATA_ROOT="${DOCKER_DATA}"
export npm_config_cache="${NPM_CACHE}"
export NPM_CONFIG_CACHE="${NPM_CACHE}"
EOF
ok "Wrote ${MARKER}"

echo ""
echo "========================================================="
echo -e "${GREEN}  External storage ready${NC}"
echo "========================================================="
echo "Docker data-root:  ${DOCKER_DATA}"
echo "npm cache:         ${NPM_CACHE}"
echo "Marker env:        ${MARKER}"
if [ -d "$REPO_DIR/.git" ]; then
  echo "SCAS repo:         ${REPO_DIR}"
  echo ""
  echo "Next:"
  echo "  cd ${REPO_DIR}"
  echo "  source ${MARKER}"
  echo "  ./install.sh"
else
  echo ""
  echo "Next (if repo still on SD):"
  echo "  source ${MARKER}"
  echo "  cd ${REPO_ROOT} && ./install.sh"
  echo "  # or re-run with --move-repo / --clone-repo"
fi
echo ""
echo "Verify Docker:"
echo "  docker info | grep 'Docker Root Dir'"
echo ""
