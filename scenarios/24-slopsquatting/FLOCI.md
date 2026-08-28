# Scenario 24 + Floci

Slopsquatting is a catalog miss, so the emulator pretends this org never published `python-asyncio-utils`. Seed writes that 404 into S3 and SSM before you install.

```bash
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/24-slopsquatting
./infrastructure/floci/seed.sh
# run README steps
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 24
../../detection-tools/floci/s3-exfil-check.sh 24
```

Compare `s3://scas-sc24-artifacts/catalog/404-baseline.json` and SSM `/scas/sc24/allowed-packages` (`asyncio,aiohttp,httpx`) with whatever the victim resolved. EventBridge `scas.catalog.miss` is the seed ping. Exfil still lands under `exfil/` plus `/scas/sc24/exfil` logs.
