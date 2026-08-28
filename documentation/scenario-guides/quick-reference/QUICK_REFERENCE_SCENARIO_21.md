# Quick Reference: Scenario 21 - Axios-style compromised release

Fictional `axios-like@1.14.1` tarball with bundled `plain-crypto-js-like` so `postinstall` actually runs. Port **3021**. Ingest is `POST /beacon` (not `/collect`). Not real axios. Distinct from 27 (attestation) and 09 (signing).

I curl `/captured-data` on 3021. The POST path is `/beacon`. Mixing those two has wasted a demo.

## Table of Contents

<div class="doc-toc">

- [Mock](#mock)
- [Install the packed 1.14.1](#install-the-packed-1141)
- [Detector](#detector)
- [Lookalikes and Floci](#lookalikes-and-floci)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [When postinstall is silent](#when-postinstall-is-silent)
- [Companion docs](#companion-docs)

</div>

---
## Mock

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/21-axios-compromised-release-attack
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

Listen on 3021. Log line should mention `/beacon`.

## Install the packed 1.14.1

```bash
cd scenarios/21-axios-compromised-release-attack
export TESTBENCH_MODE=enabled
cd victim-app
npm install axios-like@file:../packages/axios-like-1.14.1.tgz
npm start
curl -s http://127.0.0.1:3021/captured-data
cat .testbench-axios-ioc.json
```

Offline skip (postinstall exits early):

```bash
TESTBENCH_OFFLINE=1 npm install axios-like@file:../packages/axios-like-1.14.1.tgz
```

Clean between runs:

```bash
curl -X DELETE http://127.0.0.1:3021/captured-data
```

1.14.0 under `packages/axios-like-1.14.0/` is the clean contrast if someone asks "what did we ship last week."

## Detector

From scenario root:

```bash
cd scenarios/21-axios-compromised-release-attack
node detection-tools/axios-compromise-detector.js victim-app
```

## Lookalikes and Floci

Seed plants SM `scas/sc21/ci-aws-role` and `decoy-npm-token`. Victim `.env` is planted for 21. Do not treat those as live cloud keys.

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 21
```

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3021
./scripts/setup/kill-port.sh 3021
ls -la packages/*.tgz
```

## Layout

```text
scenarios/21-axios-compromised-release-attack/
├── packages/axios-like-1.14.0/
├── packages/axios-like-1.14.1.tgz
├── packages/plain-crypto-js-like/     # bundled so postinstall runs
├── victim-app/
├── detection-tools/axios-compromise-detector.js
├── infrastructure/mock-server.js      # :3021, POST /beacon
├── DETECT.md
└── FLOCI.md
```

## When postinstall is silent

| Problem | What I check |
|---------|----------------|
| Empty capture | Gate, mock, `/beacon` vs `/collect` |
| Offline skip left on | unset `TESTBENCH_OFFLINE` |
| "This is real axios" | Stop. Name is `axios-like` |
| Mixing 21 with 27 | 21 is postinstall. 27 is attestation issuer |
| Port busy | `kill-port.sh 3021` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_21.md`
- Lab README: `scenarios/21-axios-compromised-release-attack/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
