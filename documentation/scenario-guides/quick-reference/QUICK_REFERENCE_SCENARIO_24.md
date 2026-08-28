# Quick Reference: Scenario 24 - Slopsquatting

01 is a typo. 24 is a name that never existed. Catalog 404, not Levenshtein. Port **3024**.

`file:` in `victim-app/package.json` is why install still works after a 404. Say that out loud or someone will think npm ignored the catalog.

## Table of Contents

<div class="doc-toc">

- [Enable and setup](#enable-and-setup)
- [Catalog before install](#catalog-before-install)
- [Mock plus victim](#mock-plus-victim)
- [Hunt](#hunt)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Mix-ups](#mix-ups)
- [Companion docs](#companion-docs)

</div>

---
## Enable and setup

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/24-slopsquatting
export TESTBENCH_MODE=enabled
./setup.sh
./scripts/setup/kill-port.sh 3024   # from repo root if dirty
```

## Catalog before install

```bash
cd scenarios/24-slopsquatting
cat ai-suggestion.md
node infrastructure/check-catalog.js python-asyncio-utils @stripe/react-v3 lodash
```

404, 404, 200. `lodash` is in `infrastructure/catalog-fixture.json`. The hallucinated names are not.

```bash
grep -n python-asyncio-utils infrastructure/catalog-fixture.json || echo "not in fixture (good)"
```

## Mock plus victim

Terminal A:

```bash
cd scenarios/24-slopsquatting
export TESTBENCH_MODE=enabled
node infrastructure/mock-server.js
```

Terminal B:

```bash
cd scenarios/24-slopsquatting/victim-app
export TESTBENCH_MODE=enabled
npm start
curl -s http://127.0.0.1:3024/captured-data
curl -X DELETE http://127.0.0.1:3024/captured-data
```

## Hunt

From scenario root:

```bash
node ../../detection-tools/package-scanner.js victim-app
grep -n "TESTBENCH_MODE\|3024" malicious-packages/python-asyncio-utils/index.js
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 24
```

SSM allowlist analog is `/scas/sc24/allowed-packages` (`asyncio,aiohttp,httpx`). The hallucinated name is not on it.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3024
cat victim-app/package.json
```

## Layout

```text
scenarios/24-slopsquatting/
├── ai-suggestion.md                  # fake Copilot paste
├── infrastructure/catalog-fixture.json
├── infrastructure/check-catalog.js
├── malicious-packages/python-asyncio-utils/
├── victim-app/                       # file: dependency
├── infrastructure/mock-server.js     # :3024
├── DETECT.md
└── FLOCI.md
```

## Mix-ups

| Problem | What I check |
|---------|----------------|
| Empty capture | Gate, mock on 3024 (not 3000) |
| Catalog 200 on hallucinated name | Wrong cwd or edited fixture |
| Cannot find module | `./setup.sh` did not run |
| Teaching this as a lodash typo | Stop. That is 01. This is 404 |
| Port busy | `kill-port.sh 3024` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_24.md`
- Lab README: `scenarios/24-slopsquatting/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
