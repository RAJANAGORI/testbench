#!/usr/bin/env bash
set -euo pipefail
cd /repo
if [[ ! -d node_modules/@scas ]] && [[ ! -d node_modules/next ]]; then
  echo "[scas-ui] Installing workspace dependencies…"
  npm install
fi
exec "$@"
