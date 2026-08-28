#!/usr/bin/env bash
# SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori
SCENARIO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCENARIO_DIR}"
# shellcheck disable=SC1091
source "${SCENARIO_DIR}/../_shared/enable-testbench.sh"

set -euo pipefail

echo "================================================"
echo "Setting up scenario 26: malicious MCP server"
echo "================================================"
echo ""

command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
echo "Dummy env is victim-agent/dummy.env (committed lab fakes)."
echo ""
echo "Next (three terminals, or background the first two):"
echo "  node infrastructure/mock-server.js"
echo "  node infrastructure/mcp-server.js"
echo "  node victim-agent/agent.js"
echo "  curl -s http://127.0.0.1:3026/captured-data"
echo ""
