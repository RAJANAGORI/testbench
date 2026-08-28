# Quick Reference: Scenario 29 - HF-style model artifact

ML-artifact track. No torch. No huggingface.co. Hub **3029**. Safe load vs `--trust-remote-code`.

Labs 01-23 stay software supply chain. This folder is the first ML-artifact lab. Stdlib only. If a student starts downloading CUDA, they left the lab.

## Table of Contents

<div class="doc-toc">

- [Hub](#hub)
- [Loads](#loads)
- [Floci](#floci)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Workshop line](#workshop-line)
- [Companion docs](#companion-docs)

</div>

---
## Hub

```bash
source .scas.env
echo $TESTBENCH_MODE
python3 --version
cd scenarios/29-hf-model-artifact
export TESTBENCH_MODE=enabled
./setup.sh
python3 infrastructure/mock_hub.py
```

Listen on 3029. Not `mock-server.js`.

## Loads

Safe first (should refuse remote Python; capture empty or unchanged):

```bash
cd scenarios/29-hf-model-artifact
export TESTBENCH_MODE=enabled
python3 victim-app/load_model.py
curl -s http://127.0.0.1:3029/captured-data
```

Then unsafe:

```bash
python3 victim-app/load_model.py --trust-remote-code
curl -s http://127.0.0.1:3029/captured-data
```

Now you want JSON. Without `TESTBENCH_MODE=enabled`, the unsafe path prints `[SAFE MODE]`.

```bash
curl -X DELETE http://127.0.0.1:3029/captured-data
```

`weights.json` is a JSON marker, not a pickle gadget. Hub snapshot lives under `hub-snapshot/acme/fast-embed/`.

## Floci

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 29
```

SSM `/scas/sc29/model-revision` should still say `lab-rev-0001`. Glue `scas_sc29_models`. `scas/sc29/hf-token` is lookalike-only.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3029
./scripts/setup/kill-port.sh 3029
grep -n "trust.remote\|modeling.py\|3029" victim-app/load_model.py infrastructure/mock_hub.py
```

Victim cache under `victim-app/.cache/` is gitignored.

## Layout

```text
scenarios/29-hf-model-artifact/
├── hub-snapshot/acme/fast-embed/
├── victim-app/load_model.py
├── infrastructure/mock_hub.py        # :3029
├── DETECT.md
└── FLOCI.md
```

## Workshop line

| Problem | What I check |
|---------|----------------|
| Safe load captures | You passed `--trust-remote-code` by habit |
| Unsafe silent | Gate off, or hub not on 3029 |
| Students installing torch | Stop. Stdlib only |
| "Is this a package lab?" | No. 01-23 are. 29 is ML-artifact |
| Port busy | `kill-port.sh 3029` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_29.md`
- Lab README: `scenarios/29-hf-model-artifact/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
