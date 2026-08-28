# Quick Reference: Scenario 22 - LiteLLM-style PyPI

Python. Two versions: import trigger `1.82.7` and `.pth` `1.82.8`. Mock is `mock_server.py` on **3022** (not `mock-server.js`). Needs the victim venv from `setup.sh`.

Activate the venv before the scanner or you will debug the wrong interpreter for twenty minutes. I did that once.

## Table of Contents

<div class="doc-toc">

- [Collector](#collector)
- [A) import 1.82.7](#a-import-1827)
- [B) .pth 1.82.8](#b-pth-1828)
- [Evidence](#evidence)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Empty capture](#empty-capture)
- [Companion docs](#companion-docs)

</div>

---
## Collector

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/22-litellm-pypi-compromise
export TESTBENCH_MODE=enabled
./setup.sh
python3 infrastructure/mock_server.py
```

Listen on 3022.

## A) import 1.82.7

```bash
cd scenarios/22-litellm-pypi-compromise/victim-app
source .venv/bin/activate
pip install -U ../python-packages/v1_82_7
export TESTBENCH_MODE=enabled
python run_victim.py
curl -s http://127.0.0.1:3022/captured-data
```

## B) .pth 1.82.8

```bash
cd scenarios/22-litellm-pypi-compromise/victim-app
source .venv/bin/activate
pip uninstall -y litellm_like
export TESTBENCH_MODE=enabled
pip install ../python-packages/v1_82_8
python -c "print('hello')"
curl -s http://127.0.0.1:3022/captured-data
```

The `.pth` hook fires on interpreter start. `print('hello')` is enough.

## Evidence

```bash
ls -la victim-app/.testbench-litellm-*.json
cd scenarios/22-litellm-pypi-compromise
source victim-app/.venv/bin/activate
python detection-tools/litellm_pth_scanner.py
curl -X DELETE http://127.0.0.1:3022/captured-data
```

`v1_82_6` is the clean contrast tree if you need it.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3022
./scripts/setup/kill-port.sh 3022
which python   # should be the venv
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 22
```

## Layout

```text
scenarios/22-litellm-pypi-compromise/
├── python-packages/v1_82_6/          # clean contrast
├── python-packages/v1_82_7/          # import trigger
├── python-packages/v1_82_8/          # .pth hook
├── victim-app/run_victim.py
├── victim-app/.venv/                 # created by setup.sh
├── detection-tools/litellm_pth_scanner.py
├── infrastructure/mock_server.py     # :3022
├── DETECT.md
└── FLOCI.md
```

## Empty capture

| Problem | What I check |
|---------|----------------|
| Mock down | `python3 infrastructure/mock_server.py`, not Node |
| venv not sourced | `which python` inside victim-app |
| Scanner using system Python | activate, then run scanner |
| Port busy | `kill-port.sh 3022` |
| Uninstall skipped before 1.82.8 | leftover 1.82.7 import path |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_22.md`
- Lab README: `scenarios/22-litellm-pypi-compromise/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
