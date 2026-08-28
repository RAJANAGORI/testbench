#!/usr/bin/env bash
# SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori
SCENARIO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCENARIO_DIR}"
# shellcheck disable=SC1091
source "${SCENARIO_DIR}/../_shared/enable-testbench.sh"

set -euo pipefail

echo "================================================"
echo "Setting up scenario 27: npm provenance bypass"
echo "================================================"
echo ""

command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm required"; exit 1; }

cd victim-app
npm install
cd ..

echo ""
echo "Next:"
echo "  node infrastructure/mock-server.js"
echo "  node infrastructure/check-provenance.js widget-lib 1.0.0   # should pass"
echo "  node infrastructure/check-provenance.js widget-lib 1.0.1   # should fail"
echo "  cd victim-app && npm start"
echo "  curl -s http://127.0.0.1:3027/captured-data"
echo ""
