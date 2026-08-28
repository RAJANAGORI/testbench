# Module Instance: Scenario 26 (Malicious MCP server)

Based on [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md).

## 1) Module Card

- **Module ID**: `26`
- **Title**: `Malicious MCP server`
- **Level**: `Advanced`
- **Estimated Time**: `20-40 minutes`
- **Primary Attack Surface**: `Agent tool-call MCP config`
- **Prerequisites**: Scenario 01 capture loop, TESTBENCH_MODE, localhost mocks

## 2) Learning Objectives

- Allowlist MCP servers. Do not paste gist endpoints.
- Reproduce the capture on `127.0.0.1:3026`.
- Walk the DETECT.md IOCs without inventing extra tools.

## 3) Threat Model Snapshot

- **Asset at risk**: whatever the lab's trust edge actually is (catalog, CI `uses:`, agent tools, provenance, GOPROXY, model hub)
- **Trust edge abused**: see the scenario README contrast paragraph
- **Attacker objective**: run gated payload, collect on localhost
- **Blast radius**: this VM only

## 4) Lab Setup

```bash
cd scenarios/26-malicious-mcp-server
export TESTBENCH_MODE=enabled
./setup.sh
```

Evidence: `curl -s http://127.0.0.1:3026/captured-data`

## 5) Attack Walkthrough

Follow the scenario README "Run the lab" section. Do not skip the contrast sentence at the top.

## 6) Detection Playbook

Use [DETECT.md](../../scenarios/26-malicious-mcp-server/DETECT.md). Capture file is `infrastructure/captured-data.json`.
