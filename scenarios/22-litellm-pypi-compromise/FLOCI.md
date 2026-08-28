# Scenario 22 + Floci

Optional **S3 mirror** of mock-server exfil when `SCAS_FLOCI_ENABLED=1`.

```bash
# repo root: ./scripts/floci/floci-setup.sh --image && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/22-litellm-pypi-compromise
./infrastructure/floci/seed.sh
# ... run normal README lab steps ...
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 22
../../detection-tools/floci/s3-exfil-check.sh 22
```

Dual-write: mock server (primary) + `s3://scas-sc22-artifacts/exfil/import-trigger-*.json`

PyPI token is `scas/sc22/pypi-token`; dummy model key is `scas/sc22/openai-api-key`. SSM `/scas/sc22/index-url` points at localhost:3022.
