# Quick Reference: Scenario 17 - Multi-stage attack chain

Two packages, one story. Stage 1 looks like access. Stage 2 is the compromised lib. The correlator is the blue-team tool. Port **3017**.

Install only one `file:` path and the correlator looks thin. Both are required.

## Table of Contents

<div class="doc-toc">

- [Setup plus mock](#setup-plus-mock)
- [Install both stages](#install-both-stages)
- [Correlate from the scenario root](#correlate-from-the-scenario-root)
- [Floci extras](#floci-extras)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Empty chain](#empty-chain)
- [Companion docs](#companion-docs)

</div>

---
## Setup plus mock

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/17-multi-stage-attack-chain
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

Listen on 3017.

## Install both stages

```bash
cd scenarios/17-multi-stage-attack-chain/victim-app
rm -rf node_modules package-lock.json
npm install ../packages/stage1-access-lib ../packages/stage2-compromised-lib
export TESTBENCH_MODE=enabled
npm start
curl -s http://127.0.0.1:3017/captured-data
```

`victim-app/replication/spread.json` is part of the chain story. Skim it after start.

## Correlate from the scenario root

```bash
cd scenarios/17-multi-stage-attack-chain
node detection-tools/multi-stage-correlator.js .
curl -X DELETE http://127.0.0.1:3017/captured-data
```

## Floci extras

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 17
```

Chain prefixes live under `s3://scas-sc17-artifacts/chain/` after seed. Step Functions name is `scas-sc17-chain` if you dump EventBridge / SFN.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3017
./scripts/setup/kill-port.sh 3017
ls packages/stage1-access-lib packages/stage2-compromised-lib
```

## Layout

```text
scenarios/17-multi-stage-attack-chain/
├── packages/stage1-access-lib/
├── packages/stage2-compromised-lib/
├── victim-app/replication/spread.json
├── detection-tools/multi-stage-correlator.js
├── infrastructure/mock-server.js     # :3017
├── DETECT.md
└── FLOCI.md
```

## Empty chain

| Problem | What I check |
|---------|----------------|
| Correlator thin | Only one package installed |
| Empty capture | Gate, mock, both stages |
| Path errors | Correlator argument is `.` from scenario root |
| Port busy | `kill-port.sh 3017` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_17.md`
- Lab README: `scenarios/17-multi-stage-attack-chain/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
