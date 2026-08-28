# Scenario 10 + Floci

Optional **S3 mirror** of mock-server exfil when `SCAS_FLOCI_ENABLED=1`.

```bash
# repo root: ./scripts/floci/floci-setup.sh --image && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/10-git-submodule-attack
./infrastructure/floci/seed.sh
# ... run normal README lab steps ...
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 10
../../detection-tools/floci/s3-exfil-check.sh 10
```

Dual-write: mock server (primary) + `s3://scas-sc10-artifacts/exfil/git-submodule-*.json`

SSM `/scas/sc10/submodule-canonical-url` is the last good remote. Secrets Manager `scas/sc10/github-pat` is the dummy PAT.
