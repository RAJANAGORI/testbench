# Detection Runbook: Scenario 24 (slopsquatting)

## IOCs
- Install of a name that is not a typo of a known package (`python-asyncio-utils`, `@stripe/react-v3`).
- Catalog lookup returns 404 against the fixture / mock `/catalog?name=`.
- Outbound `POST` to `127.0.0.1:3024/collect` after `npm start`.

## Sample Log Lines
```json
{"scenario_id":"24","event_type":"install_beacon","source":"python-asyncio-utils","destination":"127.0.0.1:3024"}
```

## Sigma (example)
```yaml
title: Hallucinated package name install
detection:
  selection:
    process.command_line|contains|all: ["npm", "install"]
    process.command_line|contains: "python-asyncio-utils"
  condition: selection
level: medium
```

## YARA-like Text Rule (example)
```text
rule Slopsquat_Hallucinated_Name {
  strings:
    $a = "python-asyncio-utils"
    $b = "127.0.0.1:3024"
  condition:
    all of them
}
```

## EDR/SIEM What To Expect
- Child process or network activity right after the lab trigger.
- Mock capture at `infrastructure/captured-data.json`.
- Outbound to `127.0.0.1` only in this testbench.

## Catalog 404 (not Levenshtein)

```bash
node infrastructure/check-catalog.js python-asyncio-utils @stripe/react-v3 lodash
```

`lodash` should be 200. The other two should be 404. Edit-distance scanners miss this class.

## Mitigation

- Resolve every new package name against a known catalog (allowlist or registry), not edit-distance.
- Treat LLM or chat install lines as untrusted until the name exists in that catalog.
- Commit the lockfile and use `npm ci` in CI. Do not `npm install <invented-name>` from a gist.
- Prefer scoped private registries for first-party libraries.
- Check publish age and download history before adding a name nobody has seen.

## Floci (optional cloud track)
- Unexpected `PutObject` under `s3://scas-sc24-artifacts/exfil/` when `SCAS_FLOCI_ENABLED=1`.
- After seed, dump the pretend org (S3 `org/`, Secrets Manager, SSM, Logs): `detection-tools/floci/cloud-context.sh 24`.
- Verify: `./infrastructure/floci/verify.sh` or `detection-tools/floci/s3-exfil-check.sh 24`.
