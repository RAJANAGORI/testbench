# Scenario 27 + Floci

Provenance bypass is an attestation gap. Seed drops an unsigned in-toto placeholder and a trusted-issuer SSM param so the 1.0.1 publish has a cloud record that does not actually prove the builder.

```bash
export TESTBENCH_MODE=enabled SCAS_FLOCI_ENABLED=1
cd scenarios/27-npm-provenance-bypass
./infrastructure/floci/seed.sh
# dirty 1.0.1 load per README
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 27
../../detection-tools/floci/s3-exfil-check.sh 27
```

Open `s3://scas-sc27-artifacts/attestations/unsigned-placeholder.json` next to SSM `/scas/sc27/trusted-issuer`. IAM `scas-sc27-publisher-role` is the role a real trusted publisher would have used. Secrets Manager still has `scas/sc27/npm-publish-token` for the unsigned publish story.
