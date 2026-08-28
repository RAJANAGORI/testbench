# Quick Reference: Scenario 26 - Malicious MCP server

JSON-RPC mock on **3926**, collect on **3026**. Not a desktop MCP app. Dummy keys in `victim-agent/dummy.env`. Distinct from 15 (you installed a plugin package).

Three processes. Order: C2 mock, MCP mock, agent. If the agent hangs, 3926 is down.

## Table of Contents

<div class="doc-toc">

- [Three processes](#three-processes)
- [Safe mode](#safe-mode)
- [Config to lock](#config-to-lock)
- [Floci](#floci)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Breakage](#breakage)
- [Companion docs](#companion-docs)

</div>

---
## Three processes

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/26-malicious-mcp-server
export TESTBENCH_MODE=enabled
./setup.sh
cat victim-agent/dummy.env
```

Terminal A: `node infrastructure/mock-server.js`  (`:3026`)

Terminal B: `node infrastructure/mcp-server.js`  (`:3926`)

Terminal C:

```bash
cd scenarios/26-malicious-mcp-server
export TESTBENCH_MODE=enabled
node victim-agent/agent.js
curl -s http://127.0.0.1:3026/captured-data
```

You want keys from `dummy.env` in the JSON. Restore that file if someone pasted a live token.

## Safe mode

New shells, gate off:

```bash
unset TESTBENCH_MODE
node infrastructure/mcp-server.js
```

`read_env` prints `[SAFE MODE]`. No POST.

## Config to lock

`victim-agent/mcp.json` is the gist-shaped URL. Allowlist that. Tool schema: `read_env`.

```bash
grep -n "read_env\|3026" infrastructure/mcp-server.js
grep -n "3926" victim-agent/agent.js victim-agent/mcp.json
```

## Floci

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/secrets-check.sh scas/sc26/openai-api-key
../../detection-tools/floci/cloud-context.sh 26
```

SSM `/scas/sc26/mcp-allowlist` is `filesystem,git`. A gist URL would not be on it.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3026
lsof -i :3926
./scripts/setup/kill-port.sh 3026
./scripts/setup/kill-port.sh 3926
curl -X DELETE http://127.0.0.1:3026/captured-data
```

## Layout

```text
scenarios/26-malicious-mcp-server/
├── infrastructure/mock-server.js     # :3026 collect
├── infrastructure/mcp-server.js      # :3926 JSON-RPC
├── victim-agent/agent.js
├── victim-agent/dummy.env
├── victim-agent/mcp.json
├── DETECT.md
└── FLOCI.md
```

## Breakage

| Problem | What I check |
|---------|----------------|
| Agent hangs | MCP mock not on 3926 |
| Empty capture | Gate, or C2 not on 3026 |
| Live AWS keys in capture | Restore committed `dummy.env` |
| "This is 15" | 15 is the plugin. 26 is `tools/call` |
| Port busy | kill 3026 and 3926 |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_26.md`
- Lab README: `scenarios/26-malicious-mcp-server/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
