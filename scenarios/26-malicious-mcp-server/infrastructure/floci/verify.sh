#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
# shellcheck source=../../../../scripts/floci/floci-bridge.sh
source "${REPO_ROOT}/scripts/floci/floci-bridge.sh"

scas_floci_require
"${REPO_ROOT}/detection-tools/floci/cloud-context.sh" 26 || true
echo ""
BUCKET="$(scas_floci_bucket_for_scenario 26)"
echo "=== Floci evidence — scenario 26 ==="
scas_floci_s3_ls "$BUCKET" "exfil/" || true
