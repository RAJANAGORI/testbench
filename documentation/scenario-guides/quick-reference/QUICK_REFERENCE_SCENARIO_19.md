# Quick Reference: Scenario 19 - SBOM manipulation

Generator writes `victim-app/sbom.json` and omits a dependency that is actually there. Truth vs generated is the hunt. Port **3019**.

`npm start` uses `node -r ../../_shared/testbench-env.js`. Still export `TESTBENCH_MODE=enabled` so you do not fight the gate.

## Table of Contents

<div class="doc-toc">

- [Setup](#setup)
- [Generate the lying SBOM](#generate-the-lying-sbom)
- [Validator](#validator)
- [Floci catalog analog](#floci-catalog-analog)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [When truth and sbom match](#when-truth-and-sbom-match)
- [Companion docs](#companion-docs)

</div>

---
## Setup

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/19-sbom-manipulation-attack
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

Listen on 3019.

## Generate the lying SBOM

```bash
cd scenarios/19-sbom-manipulation-attack/victim-app
rm -rf node_modules package-lock.json
npm install
npm start
curl -s http://127.0.0.1:3019/captured-data
```

Open `victim-app/sbom.json` next to `truth/dependencies.json`. The omit is the whole demo.

## Validator

From scenario root:

```bash
cd scenarios/19-sbom-manipulation-attack
node detection-tools/sbom-manipulation-validator.js victim-app
curl -X DELETE http://127.0.0.1:3019/captured-data
```

## Floci catalog analog

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 19
```

Glue catalog name is `scas_sc19_sbom`. Compare S3 `truth/` with `sbom/` after seed.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3019
./scripts/setup/kill-port.sh 3019
diff -u truth/dependencies.json victim-app/sbom.json || true
```

## Layout

```text
scenarios/19-sbom-manipulation-attack/
├── sbom/malicious-sbom-generator.js
├── truth/dependencies.json
├── victim-app/sbom.json              # written at start
├── detection-tools/sbom-manipulation-validator.js
├── infrastructure/mock-server.js     # :3019
├── DETECT.md
└── FLOCI.md
```

## When truth and sbom match

| Problem | What I check |
|---------|----------------|
| Validator quiet | `npm start` never ran the generator |
| Empty capture | Gate or mock |
| Diff empty | You compared the generator to itself |
| Port busy | `kill-port.sh 3019` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_19.md`
- Lab README: `scenarios/19-sbom-manipulation-attack/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
