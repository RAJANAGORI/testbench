# Quick Reference: Scenario 18 - Package manager plugin

Victim loads a plugin hook (`installHook`) on `npm start`. You do not need a real npm plugin API. Port **3018**.

If `node_modules` still has a previous plugin from a half-finished demo, delete it. I have been burned by that twice.

## Table of Contents

<div class="doc-toc">

- [Start the mock](#start-the-mock)
- [Trigger the hook](#trigger-the-hook)
- [Detector](#detector)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Gotchas](#gotchas)
- [Companion docs](#companion-docs)

</div>

---
## Start the mock

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/18-package-manager-plugin-attack
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

Listen on 3018.

## Trigger the hook

```bash
cd scenarios/18-package-manager-plugin-attack/victim-app
rm -rf node_modules
export TESTBENCH_MODE=enabled
npm start
curl -s http://127.0.0.1:3018/captured-data
```

`victim-app/plugin-active.js` and `scripts/run-plugin-install.js` are the glue. Open them if `npm start` does nothing interesting.

Contrast:

```bash
diff -u plugins/legitimate-plugin/index.js plugins/malicious-plugin/index.js
```

## Detector

From scenario root:

```bash
cd scenarios/18-package-manager-plugin-attack
node detection-tools/plugin-attack-detector.js victim-app
curl -X DELETE http://127.0.0.1:3018/captured-data
```

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3018
./scripts/setup/kill-port.sh 3018
grep -n installHook plugins/malicious-plugin/index.js
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 18
```

## Layout

```text
scenarios/18-package-manager-plugin-attack/
├── plugins/legitimate-plugin/
├── plugins/malicious-plugin/
├── packages/target-lib/
├── victim-app/plugin-active.js
├── detection-tools/plugin-attack-detector.js
├── infrastructure/mock-server.js     # :3018
├── DETECT.md
└── FLOCI.md
```

## Gotchas

| Problem | What I check |
|---------|----------------|
| No POST | Gate off, or stale `node_modules` |
| Detector path | Scenario root, argument `victim-app` |
| Port busy | `kill-port.sh 3018` |
| "Need a real npm plugin" | You do not. This is a hook stand-in |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_18.md`
- Lab README: `scenarios/18-package-manager-plugin-attack/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
