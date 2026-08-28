# Detection Runbook: Scenario 28 (Go module confusion)

## IOCs
- `GOPROXY=http://127.0.0.1:3028` fetching `example.com/corp/widget`.
- `GOSUMDB=off` (learner shot themselves).
- `replace example.com/corp/widget => ../attacker-module` that looks like a pin.
- POST to `127.0.0.1:3028/collect` from `init()`.

## Sample Log Lines
```json
{"scenario_id":"28","event_type":"go_init_beacon","source":"example.com/corp/widget","destination":"127.0.0.1:3028"}
```

## Sigma (example)
```yaml
title: Unexpected GOPROXY or GOSUMDB=off
detection:
  selection:
    process.env|contains: "GOSUMDB=off"
  condition: selection
level: medium
```

## YARA-like Text Rule (example)
```text
rule Go_Goproxy_Confusion {
  strings:
    $a = "GOSUMDB=off"
    $b = "example.com/corp/widget"
    $c = "127.0.0.1:3028"
  condition:
    2 of them
}
```

## EDR/SIEM What To Expect
- Child process or network activity right after the lab trigger.
- Mock capture at `infrastructure/captured-data.json`.
- Outbound to `127.0.0.1` only in this testbench.

## Review replace and sumdb

Leave sumdb on. Treat `replace` lines as code review, not a lock.

## Mitigation

- Point `GOPROXY` at a proxy you actually run. Do not paste an unknown host.
- Keep `GOSUMDB` on. Treat `GOSUMDB=off` as an incident, not a convenience flag.
- Review every `replace` in `go.mod` like a new dependency.
- Vendor or pin through a verified mirror in CI.
- Diff `go.sum` after every bump and fail the build on surprise hashes.

## Floci (optional cloud track)
- Unexpected `PutObject` under `s3://scas-sc28-artifacts/exfil/` when `SCAS_FLOCI_ENABLED=1`.
- After seed, dump the pretend org (S3 `org/`, Secrets Manager, SSM, Logs): `detection-tools/floci/cloud-context.sh 28`.
- Verify: `./infrastructure/floci/verify.sh` or `detection-tools/floci/s3-exfil-check.sh 28`.
