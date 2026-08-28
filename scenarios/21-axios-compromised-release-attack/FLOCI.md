# Scenario 21 + Floci

**postinstall** beacons to `:3021` and mirrors payload to **S3** when Floci is enabled.

```bash
# repo root: ./scripts/floci/floci-setup.sh && ./scripts/floci/floci-up.sh && source .floci.env
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
node infrastructure/mock-server.js &
cd victim-app && npm install axios-like@file:../packages/axios-like-1.14.1.tgz
cd victim-app && npm start
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 21
../../detection-tools/floci/s3-exfil-check.sh 21
```

`cloud-context.sh 21` lists `scas/sc21/ci-aws-role` and `decoy-npm-token` without walking the AWS CLI by hand.

