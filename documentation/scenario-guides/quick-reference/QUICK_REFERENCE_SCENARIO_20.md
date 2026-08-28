# Quick Reference: Scenario 20 - Package version confusion

Highest semver wins inside `victim-app/index.js`, not npm's resolver. `npm start` does the confusion. Port **3020**.

Do not tell the room "npm picked the wrong version." The lab's own resolver did. The README simulation-scope block is the honest line.

## Table of Contents

<div class="doc-toc">

- [Boot](#boot)
- [Resolve then start](#resolve-then-start)
- [Detector](#detector)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Teaching trap](#teaching-trap)
- [Companion docs](#companion-docs)

</div>

---
## Boot

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/20-package-version-confusion
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

Listen on 3020.

## Resolve then start

```bash
cd scenarios/20-package-version-confusion/victim-app
rm -rf node_modules package-lock.json
npm install
export TESTBENCH_MODE=enabled
npm start
curl -s http://127.0.0.1:3020/captured-data
cat installed-version.json
```

Registry fixtures:

```text
registry/version-confuser-lib/1.0.1/
registry/version-confuser-lib/999.999.999/
```

The ridiculous version is the trap. Confirm selected version before and after `npm start`.

## Detector

From scenario root:

```bash
cd scenarios/20-package-version-confusion
node detection-tools/version-confusion-detector.js victim-app
curl -X DELETE http://127.0.0.1:3020/captured-data
```

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3020
./scripts/setup/kill-port.sh 3020
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 20
```

## Layout

```text
scenarios/20-package-version-confusion/
├── registry/version-confuser-lib/1.0.1/
├── registry/version-confuser-lib/999.999.999/
├── victim-app/installed-version.json
├── detection-tools/version-confusion-detector.js
├── infrastructure/mock-server.js     # :3020
├── DETECT.md
└── FLOCI.md
```

## Teaching trap

| Problem | What I check |
|---------|----------------|
| Empty capture | Gate, mock, `npm start` not run |
| Detector disagrees with npm ls | Expected. Lab resolver, not npm |
| Port busy | `kill-port.sh 3020` |
| Students rewriting package.json | Stop them. The resolver is the demo |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_20.md`
- Lab README: `scenarios/20-package-version-confusion/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
