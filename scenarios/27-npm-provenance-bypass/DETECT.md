# Detection Runbook: Scenario 27 (npm provenance bypass)

## IOCs
- widget-lib@1.0.1 attestation issuer is `I typed npm publish on a laptop.`
- Missing or non-OIDC builder id vs `https://github.com/example/repo/.github/workflows/release.yml`.
- POST to `127.0.0.1:3027/collect` after the dirty tarball loads.

## Sample Log Lines
```json
{"scenario_id":"27","event_type":"provenance_miss","source":"widget-lib@1.0.1","destination":"127.0.0.1:3027"}
```

## Sigma (example)
```yaml
title: npm provenance issuer mismatch
detection:
  selection:
    package.name: "widget-lib"
    provenance.builder.id|contains: "laptop"
  condition: selection
level: high
```

## YARA-like Text Rule (example)
```text
rule Npm_Laptop_Publish_Attestation {
  strings:
    $a = "I typed npm publish on a laptop"
    $b = "widget-lib"
    $c = "127.0.0.1:3027"
  condition:
    2 of them
}
```

## EDR/SIEM What To Expect
- Child process or network activity right after the lab trigger.
- Mock capture at `infrastructure/captured-data.json`.
- Outbound to `127.0.0.1` only in this testbench.

## Who published

```bash
node infrastructure/check-provenance.js widget-lib 1.0.0
node infrastructure/check-provenance.js widget-lib 1.0.1
```

Trusted publishing (OIDC workflow) vs classic token from a laptop. Lockfile still matters.

## Mitigation

- Require trusted-publisher / provenance from a known workflow issuer.
- Reject publishes whose attestation is missing or names a laptop when policy wants OIDC.
- Keep this distinct from 09 (signing) and 21 (compromised release + postinstall).
- Pin exact versions and verify the lockfile in CI.
- Alert on version bumps that do not match a GitHub Actions provenance subject.

## Floci (optional cloud track)
- Unexpected `PutObject` under `s3://scas-sc27-artifacts/exfil/` when `SCAS_FLOCI_ENABLED=1`.
- After seed, dump the pretend org (S3 `org/`, Secrets Manager, SSM, Logs): `detection-tools/floci/cloud-context.sh 27`.
- Verify: `./infrastructure/floci/verify.sh` or `detection-tools/floci/s3-exfil-check.sh 27`.
