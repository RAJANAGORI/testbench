# Quick Reference: Scenario 27 - npm provenance bypass

Attestation, not signing (09) and not postinstall (21). Checker on `widget-lib` 1.0.0 vs 1.0.1. Collect **3027**.

1.0.0 issuer is a dummy GitHub workflow URL. 1.0.1 says the laptop sentence. Dirty `file:` load still runs after the checker fails. That is the "linter, not a gate" demo.

## Table of Contents

<div class="doc-toc">

- [Mock and checker](#mock-and-checker)
- [Fixtures](#fixtures)
- [Floci](#floci)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [If the checker lies](#if-the-checker-lies)
- [Companion docs](#companion-docs)

</div>

---
## Mock and checker

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/27-npm-provenance-bypass
export TESTBENCH_MODE=enabled
./setup.sh
ls fixtures
node infrastructure/mock-server.js
```

Other terminal:

```bash
cd scenarios/27-npm-provenance-bypass
export TESTBENCH_MODE=enabled
node infrastructure/check-provenance.js widget-lib 1.0.0
echo exit:$?
node infrastructure/check-provenance.js widget-lib 1.0.1
echo exit:$?
cd victim-app && npm start
curl -s http://127.0.0.1:3027/captured-data
```

0 on 1.0.0. Fail on 1.0.1.

```bash
curl -X DELETE http://127.0.0.1:3027/captured-data
```

## Fixtures

```bash
grep -n "laptop\|github.com/example" fixtures/*
diff -u fixtures/widget-lib-1.0.0.json fixtures/widget-lib-1.0.1.json | head
```

Packages live under `packages/widget-lib-1.0.0/` and `packages/widget-lib-1.0.1/`. Victim `package.json` already points at the dirty `file:` copy after setup.

## Floci

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 27
```

SSM `/scas/sc27/trusted-issuer`. Unsigned object under `attestations/`. IAM `scas-sc27-publisher-role`.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3027
./scripts/setup/kill-port.sh 3027
```

## Layout

```text
scenarios/27-npm-provenance-bypass/
├── fixtures/widget-lib-1.0.0.json
├── fixtures/widget-lib-1.0.1.json
├── packages/widget-lib-1.0.0/
├── packages/widget-lib-1.0.1/
├── infrastructure/check-provenance.js
├── victim-app/
├── infrastructure/mock-server.js     # :3027
├── DETECT.md
└── FLOCI.md
```

## If the checker lies

| Problem | What I check |
|---------|----------------|
| Both versions pass | Mock down or wrong cwd |
| 1.0.0 fails | Rerun `./setup.sh` |
| No capture | Gate, mock on 3027, then `npm start` |
| "This is 09" | 09 is signatures. 27 is who published |
| Port busy | `kill-port.sh 3027` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_27.md`
- Lab README: `scenarios/27-npm-provenance-bypass/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
