# Scenario 29 + Floci

Model artifacts belong in an object store plus a catalog. Seed pins `models/revision.txt` to `lab-rev-0001`, creates Glue database `scas_sc29_models`, and puts a dummy hub token in Secrets Manager.

```bash
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/29-hf-model-artifact
./infrastructure/floci/seed.sh
# unsafe --trust-remote-code load per README
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 29
../../detection-tools/floci/s3-exfil-check.sh 29
```

SSM `/scas/sc29/model-revision` should still say `lab-rev-0001` after the run. If `exfil/` has weights-adjacent JSON, compare it to that pin. `scas/sc29/hf-token` is lookalike-only; do not point it at huggingface.co.
