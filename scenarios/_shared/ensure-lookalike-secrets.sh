#!/usr/bin/env bash
# Ensure generated lookalike secret fixtures exist (LAB ONLY, gitignored).
# Safe to call from install.sh, plant-lookalike-secrets.sh, floci-bridge, setup.sh.
set -euo pipefail

SHARED_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GEN="${SHARED_DIR}/generate-lookalike-secrets.py"
ENV_OUT="${SHARED_DIR}/lookalike-secrets.env"
JSON_OUT="${SHARED_DIR}/lookalike-secrets.json"

if [ ! -f "$GEN" ]; then
  echo "❌ Missing ${GEN}" >&2
  exit 1
fi

# Regenerate when missing, or when FORCE_LOOKALIKE_REGEN=1
if [ "${FORCE_LOOKALIKE_REGEN:-0}" = "1" ] || [ ! -f "$ENV_OUT" ] || [ ! -f "$JSON_OUT" ]; then
  python3 "$GEN"
fi
