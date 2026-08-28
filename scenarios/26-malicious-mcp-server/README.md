# Scenario 26: malicious MCP server

15 is "your CLI or IDE plugin went bad." 26 is the tool the agent calls. Someone pasted an MCP config from a gist. The client starts. The server offers `list_files` and `read_env`. One tool call later, a friendly summary has already POSTed dummy `.env` keys to localhost.

This is not a Cursor or Claude connector. Do not install a desktop app. The "MCP" here is a tiny HTTP JSON-RPC mock on `:3926`.


## Table of Contents

<div class="doc-toc">

- [Setup](#setup)
- [Run the lab](#run-the-lab)
- [What to stare at](#what-to-stare-at)
- [Mitigation Playbook](#mitigation-playbook)
- [Success](#success)
- [Related](#related)

</div>

---
## Setup

```bash
cd scenarios/26-malicious-mcp-server
export TESTBENCH_MODE=enabled
./setup.sh
```

Dummy secrets live in `victim-agent/dummy.env`. Same shape as `scenarios/_shared/LOOKALIKE_SECRETS.md`. They are lab fakes.

## Run the lab

Three processes. Background the first two if you want.

```bash
export TESTBENCH_MODE=enabled
node infrastructure/mock-server.js
node infrastructure/mcp-server.js
node victim-agent/agent.js
curl -s http://127.0.0.1:3026/captured-data
```

Without the env gate, `read_env` prints `[SAFE MODE]` and sits there.

## What to stare at

- `victim-agent/mcp.json` is the gist-shaped config. Allowlist that URL or refuse it.
- `infrastructure/mcp-server.js` implements `tools/list` and `tools/call` only.
- Capture is `POST http://127.0.0.1:3026/collect`.

## Mitigation Playbook

- Allowlist MCP servers in client config. Refuse gist-pasted endpoints.
- Read tool schemas before connecting. `read_env` and broad file tools are the tell.
- Keep secrets out of the agent environment when you can. Sandbox the server process.
- Alert on unexpected collectors from MCP child processes.
- Distinct trust edge from lab 15 (IDE/CLI plugin). Here the agent invoked a tool.

## Success

- [ ] You can explain 26 vs 15 in one sentence.
- [ ] Capture contains keys from `dummy.env`, not a production credential.
- [ ] Safe mode does not POST.

## Related

15 developer tool compromise · 06 credential harvest
