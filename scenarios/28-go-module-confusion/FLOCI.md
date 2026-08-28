# Scenario 28 + Floci

GOPROXY confusion needs a module store analog. Seed writes `modules/` on the bucket and SSM `/scas/sc28/goproxy` to `http://127.0.0.1:3028,off` so the emulator matches the local proxy you already started.

```bash
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/28-go-module-confusion
./infrastructure/floci/seed.sh
# go run -mod=mod .  or infrastructure/goproxy-client.js
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 28
../../detection-tools/floci/s3-exfil-check.sh 28
```

EventBridge `scas.module.fetch` fires at seed. After `init()` posts, check `exfil/` and Logs `/scas/sc28/exfil`. The zip on disk under `infrastructure/goproxy-store/` is still the source of truth; S3 `modules/` is the cloud-shaped copy for hunters who live in buckets.
