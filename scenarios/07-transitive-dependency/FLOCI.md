# Scenario 07 + Floci

Optional **S3 mirror** of mock-server exfil when `SCAS_FLOCI_ENABLED=1`.

```bash
# repo root: ./scripts/floci/floci-setup.sh --image && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/07-transitive-dependency
./infrastructure/floci/seed.sh
# ... run normal README lab steps ...
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 07
../../detection-tools/floci/s3-exfil-check.sh 07
```

Dual-write: mock server (primary) + `s3://scas-sc07-artifacts/exfil/transitive-exfil-*.json`

SSM `/scas/sc07/expected-tree-hash` is the last reviewed `npm ls` pin. Secrets Manager still has the parent-app npm token.
