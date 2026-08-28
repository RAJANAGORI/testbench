# Scenario 01 + Floci

I treat this lab as the cloud-track template. Seed plants a dummy npm org on the emulator, not just an empty bucket. `SCAS_FLOCI_ENABLED=1` still dual-writes the install beacon to S3; the extra services are there so you can hunt like you would in a small AWS account.

```bash
# repo root
./scripts/floci/floci-setup.sh --image && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/01-typosquatting
./infrastructure/floci/seed.sh
# ... run normal README lab steps ...
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 01
../../detection-tools/floci/s3-exfil-check.sh 01
```

What seed leaves behind (all lab-only lookalikes):

| Service | Name | Why it is here |
|---------|------|----------------|
| S3 | `s3://scas-sc01-artifacts/org/` | Fake account, inventory, `critical-assets.json`, STS caller dump |
| S3 | `org/customer-export-lab.csv` | Dummy customer rows sitting next to `exfil/` |
| Secrets Manager | `scas/sc01/npm-publish-token` | Publisher token a typosquat harvest would steal |
| SSM | `/scas/sc01/allowed-packages` | `request,lodash,express` - names this fake org actually uses |
| SNS | `scas-sc01-registry-alerts` | Page-on-weird-install analog |
| IAM / Logs / EventBridge | `scas-sc01-workload-role`, `/scas/sc01/lab` | Every lab gets these; exfil also writes a log event |

Dual-write after `npm install`: mock server (primary) plus `s3://scas-sc01-artifacts/exfil/install-beacon-*.json`, plus CloudWatch `/scas/sc01/exfil` and an EventBridge `scas.exfil.put`.
