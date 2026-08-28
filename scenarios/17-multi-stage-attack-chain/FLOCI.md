# Scenario 17 + Floci

Each attack stage writes a marker to **S3** for cloud-side kill-chain correlation.

```bash
# repo root: ./scripts/floci/floci-setup.sh && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
node infrastructure/mock-server.js &
cd victim-app && npm install ../packages/stage1-access-lib ../packages/stage2-compromised-lib && npm start
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 17
```

Compare `infrastructure/captured-data.json` (mock) with `s3://scas-sc17-artifacts/chain/*/`.

Extended seed registers **Step Functions** `scas-sc17-chain` and an **EventBridge** correlation event. Verify with `eventbridge-chain-check.sh`.

Stage-1 npm token is `scas/sc17/stage1-npm`. `cloud-context.sh 17` prints Step Functions + the chain prefixes together.
