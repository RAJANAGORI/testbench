# Scenario 03 + Floci

Optional **S3 mirror** of mock-server exfil when `SCAS_FLOCI_ENABLED=1`.

```bash
# repo root: ./scripts/floci/floci-setup.sh --image && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/03-compromised-package
./infrastructure/floci/seed.sh
# ... run normal README lab steps ...
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 03
../../detection-tools/floci/s3-exfil-check.sh 03
```

Dual-write: mock server (primary) + `s3://scas-sc03-artifacts/exfil/package-exfil-*.json`

Dummy billing lives in Secrets Manager `scas/sc03/stripe-live`; `org/payroll-lab-2026.enc` is a pretend payroll blob, not real payroll.
