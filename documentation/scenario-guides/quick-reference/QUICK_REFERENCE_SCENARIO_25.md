# Quick Reference: Scenario 25 - Compromised reusable GitHub Action

Local runner. No `api.github.com`. Unsafe vs safe YAML. Port **3025**. Not 05 (your build), not 23 (Trivy-shaped tags).

IOCs I want the room to chant: floating `@v1`, `pull_request_target`, `contents: write`.

## Table of Contents

<div class="doc-toc">

- [Prep](#prep)
- [Unsafe run](#unsafe-run)
- [Safe run](#safe-run)
- [Floci](#floci)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Runner does nothing](#runner-does-nothing)
- [Companion docs](#companion-docs)

</div>

---
## Prep

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/25-gha-reusable-workflow
export TESTBENCH_MODE=enabled
./setup.sh
diff -u workflows/safe.yml workflows/unsafe.yml
node detection-tools/workflow-auditor.js workflows/unsafe.yml
node detection-tools/workflow-auditor.js workflows/safe.yml
```

Unsafe noisy. Safe quiet. If both scream, you passed the same path twice.

## Unsafe run

Terminal A:

```bash
cd scenarios/25-gha-reusable-workflow
export TESTBENCH_MODE=enabled
node infrastructure/mock-server.js
```

Terminal B:

```bash
cd scenarios/25-gha-reusable-workflow
export TESTBENCH_MODE=enabled
node infrastructure/gha-runner.js workflows/unsafe.yml
curl -s http://127.0.0.1:3025/captured-data
```

## Safe run

```bash
curl -X DELETE http://127.0.0.1:3025/captured-data
node infrastructure/gha-runner.js workflows/safe.yml
curl -s http://127.0.0.1:3025/captured-data
```

SHA pin in `safe.yml`. Optional lookalike CI env:

```bash
set -a && source .env.ci-lab 2>/dev/null; set +a
```

Emulator auth stays `test` / `test` from `.floci.env`.

## Floci

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 25
```

CodePipeline `scas-sc25-pipeline`. SM `scas/sc25/github-pat` is lookalike-only.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3025
./scripts/setup/kill-port.sh 3025
grep -n "TESTBENCH_MODE\|3025" actions/changed-files-like/index.js
```

## Layout

```text
scenarios/25-gha-reusable-workflow/
├── workflows/unsafe.yml
├── workflows/safe.yml
├── actions/changed-files-like/
├── infrastructure/gha-runner.js      # not actions/runner
├── detection-tools/workflow-auditor.js
├── infrastructure/mock-server.js     # :3025
├── DETECT.md
└── FLOCI.md
```

## Runner does nothing

| Problem | What I check |
|---------|----------------|
| Empty capture on unsafe | Gate, mock on 3025, rerun runner |
| Safe also beacons | You forgot DELETE, or ran unsafe twice |
| Auditor silent | Wrong cwd |
| "Need GitHub login" | You do not. Local runner only |
| Port busy | `kill-port.sh 3025` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_25.md`
- Lab README: `scenarios/25-gha-reusable-workflow/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
