# Detection Runbook: Scenario 26 (malicious MCP server)

## IOCs
- Unexpected MCP server binary / `mcp.json` URL pointing at 127.0.0.1:3926.
- Tool schema offering `read_env` or file reads.
- POST to `127.0.0.1:3026/collect` after `tools/call`.

## Sample Log Lines
```json
{"scenario_id":"26","event_type":"mcp_tool_exfil","source":"read_env","destination":"127.0.0.1:3026"}
```

## Sigma (example)
```yaml
title: MCP tool read_env
detection:
  selection:
    process.command_line|contains: "mcp-server"
    network.destination.port: 3026
  condition: selection
level: high
```

## YARA-like Text Rule (example)
```text
rule MCP_ReadEnv_Tool {
  strings:
    $a = "read_env"
    $b = "tools/call"
    $c = "127.0.0.1:3026"
  condition:
    all of them
}
```

## EDR/SIEM What To Expect
- Child process or network activity right after the lab trigger.
- Mock capture at `infrastructure/captured-data.json`.
- Outbound to `127.0.0.1` only in this testbench.

## Allowlist

Treat `victim-agent/mcp.json` as the config you would lock down. Unknown servers stay off.

## Mitigation

- Allowlist MCP servers in client config. Refuse gist-pasted endpoints.
- Read tool schemas before connecting. `read_env` and broad file tools are the tell.
- Keep secrets out of the agent environment when you can. Sandbox the server process.
- Alert on unexpected collectors from MCP child processes.
- Distinct trust edge from lab 15 (IDE/CLI plugin). Here the agent invoked a tool.

## Floci (optional cloud track)
- Unexpected `PutObject` under `s3://scas-sc26-artifacts/exfil/` when `SCAS_FLOCI_ENABLED=1`.
- After seed, dump the pretend org (S3 `org/`, Secrets Manager, SSM, Logs): `detection-tools/floci/cloud-context.sh 26`.
- Verify: `./infrastructure/floci/verify.sh` or `detection-tools/floci/s3-exfil-check.sh 26`.
