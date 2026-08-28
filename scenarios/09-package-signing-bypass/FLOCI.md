# Scenario 09 + Floci

Optional **S3 mirror** of mock-server exfil when `SCAS_FLOCI_ENABLED=1`.

```bash
# repo root: ./scripts/floci/floci-setup.sh --image && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/09-package-signing-bypass
./infrastructure/floci/seed.sh
# ... run normal README lab steps ...
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 09
../../detection-tools/floci/s3-exfil-check.sh 09
```

Dual-write: mock server (primary) + `s3://scas-sc09-artifacts/exfil/signing-bypass-exfil-*.json`

Lookalike signing material is `scas/sc09/publisher-signing`. IAM `scas-sc09-publisher-role` is the trusted-publisher decoy.
