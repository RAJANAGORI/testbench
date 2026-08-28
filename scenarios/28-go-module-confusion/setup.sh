#!/usr/bin/env bash
# SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori
SCENARIO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCENARIO_DIR}"
# shellcheck disable=SC1091
source "${SCENARIO_DIR}/../_shared/enable-testbench.sh"

set -euo pipefail

echo "================================================"
echo "Setting up scenario 28: Go module confusion"
echo "================================================"
echo ""

command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 required"; exit 1; }
python3 infrastructure/pack-module.py

if command -v go >/dev/null 2>&1; then
  echo "Go: $(go version)"
else
  echo "Go is not on PATH. README happy path is go run. Smoke can use infrastructure/goproxy-client.js."
fi

echo ""
echo "Next:"
echo "  node infrastructure/mock-server.js"
echo "  # preferred:"
echo "  cd victim-module && GOPROXY=http://127.0.0.1:3028,off GOSUMDB=off GONOSUMDB='*' go run -mod=mod ."
echo "  # without Go:"
echo "  node infrastructure/goproxy-client.js"
echo "  curl -s http://127.0.0.1:3028/captured-data"
echo ""
