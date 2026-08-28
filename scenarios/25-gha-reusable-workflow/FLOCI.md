# Scenario 25 + Floci

Reusable-action labs need a CI-shaped account: GitHub PAT, AWS keys, a pipeline, runner logs. Seed builds that on Floci so the unsafe workflow has somewhere cloud-like to leak into.

```bash
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/25-gha-reusable-workflow
./infrastructure/floci/seed.sh
# source planted lookalikes, then run the unsafe workflow per README
set -a && source .env.ci-lab && set +a
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 25
../../detection-tools/floci/s3-exfil-check.sh 25
../../detection-tools/floci/pipeline-artifact-check.sh 25
```

Secrets Manager `scas/sc25/github-pat` and `scas/sc25/ci-aws` match `.env.ci-lab`. CodePipeline `scas-sc25-pipeline` uses this bucket as the artifact store. IAM role `scas-sc25-gha-role` is the assume-role decoy. `cloudtrail-hunt.sh 25` still works if you want STS + S3 in one pass.
