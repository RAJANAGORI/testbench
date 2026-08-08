#!/usr/bin/env bash
# SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori
#
# External-disk installer (Raspberry Pi / USB HDD/SSD).
# Normal workshops should use ./install.sh — this wrapper is optional.
#
# 1) Relocate Docker data-root (+ optional repo/npm cache) onto an external disk
# 2) Run the generic ./install.sh with any remaining flags
#
# Usage:
#   ./install-external.sh /run/media/$USER/<disk-uuid>
#   ./install-external.sh /run/media/$USER/<disk-uuid> -y
#   ./install-external.sh /mnt/scas-data -y --skip-floci
#   ./install-external.sh --skip-storage -y          # storage already done
#
# Storage-only (no SCAS stack):
#   ./scripts/setup/setup-external-storage.sh /path/to/disk --persist-mount --move-repo

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${REPO_ROOT}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

DISK=""
SKIP_STORAGE=0
YES=0
PERSIST=1
REPO_MODE=move   # move | clone | none
STABLE_MOUNT_ARG=""
INSTALL_ARGS=()

usage() {
  sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help) usage ;;
    -y|--yes) YES=1; INSTALL_ARGS+=("$1"); shift ;;
    --skip-storage) SKIP_STORAGE=1; shift ;;
    --docker-only) REPO_MODE=none; shift ;;
    --no-persist-mount) PERSIST=0; shift ;;
    --clone-repo) REPO_MODE=clone; shift ;;
    --move-repo) REPO_MODE=move; shift ;;
    --stable-mount=*) STABLE_MOUNT_ARG="$1"; shift ;;
    --core-only|--skip-es|--skip-floci|--no-start|--floci-build|--with-ui)
      INSTALL_ARGS+=("$1"); shift ;;
    -*)
      echo -e "${RED}Unknown option: $1${NC}" >&2
      usage
      ;;
    *)
      if [ -z "$DISK" ]; then
        DISK="$1"; shift
      else
        echo -e "${RED}Unexpected argument: $1${NC}" >&2
        usage
      fi
      ;;
  esac
done

echo ""
echo -e "${CYAN}=========================================================${NC}"
echo -e "${CYAN}  SCAS — External-disk installer${NC}"
echo -e "${CYAN}  Generic workshops: use ./install.sh instead${NC}"
echo -e "${CYAN}=========================================================${NC}"
echo ""

if [ "$SKIP_STORAGE" != "1" ]; then
  if [ -z "$DISK" ]; then
    echo -e "${RED}Pass the external disk mount path as the first argument.${NC}"
    echo "Example:"
    echo "  ./install-external.sh /run/media/\$USER/a0a6fb60-8114-4e3b-a274-aa1139667b7b -y"
    echo ""
    echo "If storage is already configured:"
    echo "  ./install-external.sh --skip-storage -y"
    echo "  # or just: ./install.sh -y"
    exit 1
  fi
  if [ ! -d "$DISK" ]; then
    echo -e "${RED}Disk path not found: ${DISK}${NC}"
    exit 1
  fi

  STORAGE_ARGS=()
  [ "$PERSIST" = "1" ] && STORAGE_ARGS+=(--persist-mount)
  case "$REPO_MODE" in
    move) STORAGE_ARGS+=(--move-repo) ;;
    clone) STORAGE_ARGS+=(--clone-repo) ;;
    none) STORAGE_ARGS+=(--docker-only) ;;
  esac
  [ -n "$STABLE_MOUNT_ARG" ] && STORAGE_ARGS+=("$STABLE_MOUNT_ARG")
  [ "$YES" = "1" ] && STORAGE_ARGS+=(-y)

  echo -e "${YELLOW}Step 1/2 — external storage (Docker data-root on disk)${NC}"
  chmod +x "${REPO_ROOT}/scripts/setup/setup-external-storage.sh"
  "${REPO_ROOT}/scripts/setup/setup-external-storage.sh" "$DISK" "${STORAGE_ARGS[@]}"

  if [ -d /mnt/scas-data/scas/repo/supply-chain-attack-simulator ]; then
    REPO_ROOT="/mnt/scas-data/scas/repo/supply-chain-attack-simulator"
    cd "${REPO_ROOT}"
  elif [ -L "${HOME}/supply-chain-attack-simulator" ]; then
    REPO_ROOT="$(readlink -f "${HOME}/supply-chain-attack-simulator")"
    cd "${REPO_ROOT}"
  fi
  if [ -f /mnt/scas-data/scas/scas-storage.env ]; then
    # shellcheck disable=SC1091
    source /mnt/scas-data/scas/scas-storage.env
  fi

  echo ""
  echo -e "${GREEN}✅ Storage ready${NC}"
  docker info 2>/dev/null | grep -E 'Docker Root Dir' || true
  echo ""
else
  echo -e "${YELLOW}Skipping storage setup (--skip-storage)${NC}"
  if [ -f /mnt/scas-data/scas/scas-storage.env ]; then
    # shellcheck disable=SC1091
    source /mnt/scas-data/scas/scas-storage.env
  fi
fi

echo -e "${YELLOW}Step 2/2 — generic SCAS install (./install.sh)${NC}"
echo ""
chmod +x "${REPO_ROOT}/install.sh"
if [ "${#INSTALL_ARGS[@]}" -gt 0 ]; then
  exec "${REPO_ROOT}/install.sh" "${INSTALL_ARGS[@]}"
else
  exec "${REPO_ROOT}/install.sh"
fi
