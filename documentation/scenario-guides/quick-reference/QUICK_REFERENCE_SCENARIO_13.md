# Quick Reference: Scenario 13 - Package metadata manipulation

Use this at the podium for lab 13. The story is not a new package name. It is a package whose `package.json` / repo / author fields no longer match what you reviewed last week.

Port **3001**. Mock ingest is `POST /capture` (most labs use `/collect`). Scenario 06 also binds 3001. Kill 06 first if the mock collides.

I still curl `:3000` out of habit on this one. Do not.

## Table of Contents

<div class="doc-toc">

- [One-time for this folder](#one-time-for-this-folder)
- [Mock on 3001](#mock-on-3001)
- [Install the compromised clean-utils](#install-the-compromised-clean-utils)
- [Validator from the scenario root](#validator-from-the-scenario-root)
- [Extra commands I keep on a second slide](#extra-commands-i-keep-on-a-second-slide)
- [Where the files live](#where-the-files-live)
- [If the validator is quiet](#if-the-validator-is-quiet)
- [Companion docs](#companion-docs)

</div>

---
## One-time for this folder

```bash
# from repo root
source .scas.env
echo $TESTBENCH_MODE   # must print enabled
cd scenarios/13-package-metadata-manipulation
export TESTBENCH_MODE=enabled
./setup.sh
```

`setup.sh` builds both `legitimate-packages/clean-utils` and `compromised-packages/clean-utils`. Diff those trees when a student asks what changed. Author, repository URL, and integrity-ish fields are the tell.

## Mock on 3001

Separate terminal, leave it running:

```bash
cd scenarios/13-package-metadata-manipulation
export TESTBENCH_MODE=enabled
node infrastructure/mock-server.js
```

Listen line should say `:3001`. If you see `:3000`, you started the typosquat mock.

## Install the compromised clean-utils

```bash
cd scenarios/13-package-metadata-manipulation/victim-app
export TESTBENCH_MODE=enabled
rm -rf node_modules package-lock.json
npm install ../compromised-packages/clean-utils
node index.js
```

Then:

```bash
curl -s http://127.0.0.1:3001/captured-data
curl -X DELETE http://127.0.0.1:3001/captured-data   # between demos
```

## Validator from the scenario root

Do not run this from `victim-app/` or the relative detector path breaks.

```bash
cd scenarios/13-package-metadata-manipulation
node detection-tools/metadata-validator.js victim-app/node_modules/clean-utils
```

Expect repository / author mismatches. Empty validator output usually means you pointed at `legitimate-packages/` by accident.

## Extra commands I keep on a second slide

```bash
echo $TESTBENCH_MODE
lsof -i :3001
./scripts/setup/kill-port.sh 3001    # from repo root
diff -u legitimate-packages/clean-utils/package.json compromised-packages/clean-utils/package.json
```

Floci dummy org (optional):

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 13
```

## Where the files live

```text
scenarios/13-package-metadata-manipulation/
├── legitimate-packages/clean-utils/     # the copy you "reviewed"
├── compromised-packages/clean-utils/    # same name, lying metadata
├── victim-app/
├── infrastructure/mock-server.js        # :3001, POST /capture
├── detection-tools/metadata-validator.js
├── DETECT.md
└── FLOCI.md
```

## If the validator is quiet

| Problem | What I check |
|---------|----------------|
| Empty capture | Gate, mock, port 3001 vs 3000, `/capture` vs `/collect` |
| Module missing | `npm install ../compromised-packages/clean-utils` |
| 06 still bound 3001 | `./scripts/setup/kill-port.sh 3001` from repo root |
| Validator on the legit tree | Path must be `victim-app/node_modules/clean-utils` |
| `EADDRINUSE` | leftover mock; kill-port then restart |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_13.md`
- Lab README: `scenarios/13-package-metadata-manipulation/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
