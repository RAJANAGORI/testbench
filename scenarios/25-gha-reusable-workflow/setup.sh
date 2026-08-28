#!/usr/bin/env bash
# SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori
SCENARIO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCENARIO_DIR}"
# shellcheck disable=SC1091
source "${SCENARIO_DIR}/../_shared/enable-testbench.sh"

set -euo pipefail

echo "================================================"
echo "Setting up scenario 25: compromised reusable GitHub Action"
echo "================================================"
echo ""

command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }

echo "Pinned SHA in workflows/safe.yml does not move. @v1 in unsafe.yml is the whole point."
echo ""
echo "Next:"
echo "  node infrastructure/mock-server.js"
echo "  node infrastructure/gha-runner.js workflows/unsafe.yml"
echo "  curl -s http://127.0.0.1:3025/captured-data"
echo "  diff -u workflows/safe.yml workflows/unsafe.yml"
echo ""
