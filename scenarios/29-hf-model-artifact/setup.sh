#!/usr/bin/env bash
# SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori
SCENARIO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCENARIO_DIR}"
# shellcheck disable=SC1091
source "${SCENARIO_DIR}/../_shared/enable-testbench.sh"

set -euo pipefail

echo "================================================"
echo "Setting up scenario 29: Hugging Face-style model artifact"
echo "================================================"
echo ""

command -v python3 >/dev/null 2>&1 || { echo "python3 required"; exit 1; }
echo "No PyTorch. Hub files are JSON + a tiny modeling.py."
echo ""
echo "Next:"
echo "  python3 infrastructure/mock_hub.py"
echo "  python3 victim-app/load_model.py"
echo "  TESTBENCH_MODE=enabled python3 victim-app/load_model.py --trust-remote-code"
echo "  curl -s http://127.0.0.1:3029/captured-data"
echo ""
