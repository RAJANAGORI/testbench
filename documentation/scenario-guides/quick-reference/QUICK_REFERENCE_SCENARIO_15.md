# Quick Reference: Scenario 15 - Developer tool compromise

Lab 15 is a malicious local "dev tool" package, not an IDE marketplace install. Port **3015**. Distinct from 26 (MCP `tools/call` on a server the agent already trusted).

I open both `dev-tools/*/index.js` files before the install so the room sees the diff, not a surprise POST.

## Table of Contents

<div class="doc-toc">

- [Folder setup](#folder-setup)
- [Victim installs the bad tool](#victim-installs-the-bad-tool)
- [Detector](#detector)
- [Handy extras](#handy-extras)
- [Where it lives](#where-it-lives)
- [Misses](#misses)
- [Companion docs](#companion-docs)

</div>

---
## Folder setup

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/15-developer-tool-compromise
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

Listen on 3015.

## Victim installs the bad tool

New terminal:

```bash
cd scenarios/15-developer-tool-compromise/victim-app
rm -rf node_modules package-lock.json
export TESTBENCH_MODE=enabled
npm install ../dev-tools/malicious-dev-tool
npm start
curl -s http://127.0.0.1:3015/captured-data
```

Clear between runs:

```bash
curl -X DELETE http://127.0.0.1:3015/captured-data
```

## Detector

From the scenario root:

```bash
cd scenarios/15-developer-tool-compromise
node detection-tools/dev-tool-compromise-detector.js victim-app
```

Compare trees:

```bash
diff -u dev-tools/legitimate-dev-tool/index.js dev-tools/malicious-dev-tool/index.js
```

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3015
./scripts/setup/kill-port.sh 3015
grep -n "TESTBENCH_MODE\|3015" dev-tools/malicious-dev-tool/index.js
```

Optional Floci:

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 15
```

## Where it lives

```text
scenarios/15-developer-tool-compromise/
├── dev-tools/legitimate-dev-tool/
├── dev-tools/malicious-dev-tool/     # postinstall.js is part of the story
├── victim-app/
├── detection-tools/dev-tool-compromise-detector.js
├── infrastructure/mock-server.js     # :3015
├── DETECT.md
└── FLOCI.md
```

## Misses

| Problem | What I check |
|---------|----------------|
| Empty JSON | Mock not on 3015, or gate off |
| Module missing | `npm install ../dev-tools/malicious-dev-tool` |
| Mixing this up with 26 | 15 is the plugin package you installed. 26 is an MCP server the agent called |
| Detector path errors | Run from scenario root, argument is `victim-app` |
| Port busy | `kill-port.sh 3015` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_15.md`
- Lab README: `scenarios/15-developer-tool-compromise/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
