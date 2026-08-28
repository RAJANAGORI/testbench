# Quick Reference: Scenario 23 - Trivy CI compromise

CVE-shaped Trivy action lab. Mock C2 is `mock-c2-server.js` on **3023**, not generic `mock-server.js`. Distinct from 05 (your build) and 25 (generic `uses:@v1`).

Stolen-PAT / force-pushed scanner tags is the plot. I still say "Trivy" out loud so people do not think we backdoored Aqua's product. The trees are `trivy-action-like` and `malicious-trivy/`.

## Table of Contents

<div class="doc-toc">

- [C2](#c2)
- [Pipeline](#pipeline)
- [Blue team](#blue-team)
- [Floci capstone](#floci-capstone)
- [Clear and extras](#clear-and-extras)
- [Layout](#layout)
- [Pipeline silent](#pipeline-silent)
- [Companion docs](#companion-docs)

</div>

---
## C2

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/23-trivy-supply-chain-attack
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-c2-server.js
```

Listen on 3023.

## Pipeline

```bash
cd scenarios/23-trivy-supply-chain-attack
export TESTBENCH_MODE=enabled
node legitimate/trivy-scanner/index.js
cd victim-ci
node run-pipeline.js
curl -s http://127.0.0.1:3023/captured-data
```

Lookalike harvest (optional, shapes from `LOOKALIKE_SECRETS.md`):

```bash
set -a && source .env.ci-lab && set +a
cd victim-ci && node run-pipeline.js
```

Do not export those as Floci emulator keys. Emulator auth stays `test` / `test`.

## Blue team

```bash
cd scenarios/23-trivy-supply-chain-attack
node detection-tools/trivy-version-scanner.js victim-ci
node detection-tools/ci-workflow-auditor.js victim-ci
cd victim-ci && npm run scan && npm run audit
```

## Floci capstone

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloudtrail-hunt.sh 23
../../detection-tools/floci/cloud-context.sh 23
```

## Clear and extras

```bash
curl -X DELETE http://127.0.0.1:3023/captured-data
echo $TESTBENCH_MODE
lsof -i :3023
./scripts/setup/kill-port.sh 3023
ls malicious-trivy/
```

## Layout

```text
scenarios/23-trivy-supply-chain-attack/
├── legitimate/trivy-scanner/
├── malicious-trivy/v0.69.4/          # installer + action-like
├── malicious-trivy/v0.69.5/
├── malicious-trivy/v0.69.6/
├── victim-ci/run-pipeline.js
├── detection-tools/trivy-version-scanner.js
├── detection-tools/ci-workflow-auditor.js
├── infrastructure/mock-c2-server.js  # :3023
├── DETECT.md
└── FLOCI.md
```

## Pipeline silent

| Problem | What I check |
|---------|----------------|
| Empty capture | Gate, C2 mock (not mock-server.js), then rerun pipeline |
| Mixing 23 with 05 | 05 is *your* build script. 23 is the scanner action |
| Mixing 23 with 25 | 25 is generic `@v1`. 23 is the Trivy-shaped tags |
| Port busy | `kill-port.sh 3023` |
| Lookalikes in Floci | restore `.floci.env` test/test |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_23.md`
- Lab README: `scenarios/23-trivy-supply-chain-attack/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
