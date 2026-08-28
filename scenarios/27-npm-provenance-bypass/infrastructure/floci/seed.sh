#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
# shellcheck source=../../../../scripts/floci/floci-bridge.sh
source "${REPO_ROOT}/scripts/floci/floci-bridge.sh"

BUCKET="$(scas_floci_seed_scenario 27)"
scas_floci_s3_put_string "$BUCKET" "baseline/status.txt" <<< "scenario 27 baseline"

echo "Floci seeded for scenario 27"
echo "   Bucket: s3://${BUCKET}"
echo "   Hunt:   ../../detection-tools/floci/cloud-context.sh 27"
