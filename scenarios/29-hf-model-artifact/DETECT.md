# Detection Runbook: Scenario 29 (Hugging Face-style model artifact)

## IOCs
- `--trust-remote-code` / exec of hub `modeling.py`.
- Loading `weights.json` as if it were a pickle (this lab uses JSON on purpose).
- POST to `127.0.0.1:3029/collect` after remote code runs.

## Sample Log Lines
```json
{"scenario_id":"29","event_type":"model_remote_code","source":"acme/fast-embed","destination":"127.0.0.1:3029"}
```

## Sigma (example)
```yaml
title: Untrusted model remote code
detection:
  selection:
    process.command_line|contains: "trust-remote-code"
  condition: selection
level: high
```

## YARA-like Text Rule (example)
```text
rule HF_Trust_Remote_Code {
  strings:
    $a = "trust_remote_code"
    $b = "modeling.py"
    $c = "127.0.0.1:3029"
  condition:
    2 of them
}
```

## EDR/SIEM What To Expect
- Child process or network activity right after the lab trigger.
- Mock capture at `infrastructure/captured-data.json`.
- Outbound to `127.0.0.1` only in this testbench.

## Hash pin and skip pickle

Prefer safetensors-class formats. Do not `exec` hub Python. Pin the revision hash.

## Mitigation

- Do not enable `trust_remote_code` for untrusted hubs.
- Prefer safetensors-class formats (or anything that is not pickle) over pickle-class loads.
- Hash-pin model revisions. Do not float `main`.
- Keep 01-23 in the software catalog. This lab is the ML-artifact track, not a claim that Trivy or Axios is an ML backdoor.
- Scan hub snapshots for unexpected Python next to weights.

## Floci (optional cloud track)
- Unexpected `PutObject` under `s3://scas-sc29-artifacts/exfil/` when `SCAS_FLOCI_ENABLED=1`.
- After seed, dump the pretend org (S3 `org/`, Secrets Manager, SSM, Logs): `detection-tools/floci/cloud-context.sh 29`.
- Verify: `./infrastructure/floci/verify.sh` or `detection-tools/floci/s3-exfil-check.sh 29`.
