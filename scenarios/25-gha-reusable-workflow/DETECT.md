# Detection Runbook: Scenario 25 (compromised reusable GitHub Action)

## IOCs
- `uses: changed-files-like/action@v1` (floating tag, not a 40-char SHA).
- `on: pull_request_target` with `permissions.contents: write`.
- Local runner load of `actions/changed-files-like/index.js` posting to `127.0.0.1:3025`.

## Sample Log Lines
```json
{"scenario_id":"25","event_type":"action_beacon","source":"changed-files-like","destination":"127.0.0.1:3025"}
```

## Sigma (example)
```yaml
title: Floating GitHub Action tag
detection:
  selection:
    file.path|contains: ".github/workflows"
    file.contents|contains: "action@v1"
  condition: selection
level: high
```

## YARA-like Text Rule (example)
```text
rule GHA_Floating_Tag_Or_PwnRequest {
  strings:
    $a = "pull_request_target"
    $b = "action@v1"
    $c = "127.0.0.1:3025"
  condition:
    2 of them
}
```

## EDR/SIEM What To Expect
- Child process or network activity right after the lab trigger.
- Mock capture at `infrastructure/captured-data.json`.
- Outbound to `127.0.0.1` only in this testbench.

## Diff the two YAML files

```bash
diff -u workflows/safe.yml workflows/unsafe.yml
node detection-tools/workflow-auditor.js workflows/unsafe.yml
node detection-tools/workflow-auditor.js workflows/safe.yml
```

## Mitigation

- Pin third-party actions to a full commit SHA, not `@v1`.
- Do not use `pull_request_target` unless you have a written reason and a locked-down token.
- Default `GITHUB_TOKEN` to least privilege (`contents: read`).
- Treat marketplace "copy this `@v1` snippet" as marketing, not policy.
- Watch action tags for force-pushes. Lab 23 is the scanner-as-payload case; this one is the generic `uses:` line.

## Floci (optional cloud track)
- Unexpected `PutObject` under `s3://scas-sc25-artifacts/exfil/` when `SCAS_FLOCI_ENABLED=1`.
- After seed, dump the pretend org (S3 `org/`, Secrets Manager, SSM, Logs): `detection-tools/floci/cloud-context.sh 25`.
- Verify: `./infrastructure/floci/verify.sh` or `detection-tools/floci/s3-exfil-check.sh 25`.
