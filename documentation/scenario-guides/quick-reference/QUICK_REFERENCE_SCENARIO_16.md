# Quick Reference: Scenario 16 - Package cache poisoning

The second `npm install` is the point. First install seeds a poisoned cache copy. Second install "hits cache." Port **3016**.

If someone runs `npm install` once and then `npm start`, they skipped the demo. Make them do it twice.

## Table of Contents

<div class="doc-toc">

- [Bring the lab up](#bring-the-lab-up)
- [Install twice, then start](#install-twice-then-start)
- [Detector](#detector)
- [Handy extras](#handy-extras)
- [Files](#files)
- [If only one install ran](#if-only-one-install-ran)
- [Companion docs](#companion-docs)

</div>

---
## Bring the lab up

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/16-package-cache-poisoning
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

Listen on 3016.

## Install twice, then start

```bash
cd scenarios/16-package-cache-poisoning/victim-app
rm -rf node_modules package-lock.json
npm install
rm -rf node_modules package-lock.json
npm install
export TESTBENCH_MODE=enabled
npm start
curl -s http://127.0.0.1:3016/captured-data
```

The cache simulation lives in this folder (`cache/cache-lib` vs `cache/legit-cache-lib` plus `victim-app/scripts/install-from-cache.js`). It is not your host npm cache in `~/.npm`.

## Detector

From scenario root:

```bash
cd scenarios/16-package-cache-poisoning
node detection-tools/cache-poisoning-detector.js victim-app
```

```bash
curl -X DELETE http://127.0.0.1:3016/captured-data
diff -u cache/legit-cache-lib/index.js cache/cache-lib/index.js
```

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3016
./scripts/setup/kill-port.sh 3016
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 16
```

## Files

```text
scenarios/16-package-cache-poisoning/
├── cache/cache-lib/                  # poisoned copy
├── cache/legit-cache-lib/
├── victim-app/scripts/install-from-cache.js
├── detection-tools/cache-poisoning-detector.js
├── infrastructure/mock-server.js     # :3016
├── DETECT.md
└── FLOCI.md
```

## If only one install ran

| Problem | What I check |
|---------|----------------|
| No capture | Second `npm install` skipped, or gate, or mock down |
| Detector quiet | You are in `victim-app/` instead of scenario root |
| Port busy | `kill-port.sh 3016` |
| "This is my real npm cache" | It is not. Show `cache/` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_16.md`
- Lab README: `scenarios/16-package-cache-poisoning/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
