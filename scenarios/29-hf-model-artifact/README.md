# Scenario 29: Hugging Face-style model artifact

Labs 01-23 stay software supply chain (packages, CI, images). This folder is the first ML-artifact lab. I numbered it 29 on purpose so CATALOG and smoke stay dumb. It is not `scenarios/ml/`.

The bug I want you to feel: "I loaded a model and it ran code." Real Hugging Face hosting is out of scope. Nothing downloads from huggingface.co. There is no PyTorch wheel. `weights.json` is a JSON marker, not a pickle gadget. The README is honest that this is a model of `trust_remote_code` / pickle-class loads.


## Table of Contents

<div class="doc-toc">

- [Setup](#setup)
- [Run the lab](#run-the-lab)
- [Mitigation Playbook](#mitigation-playbook)
- [Success](#success)
- [Related](#related)

</div>

---
## Setup

Python 3.11 is already in `.python-version`. Stdlib only.

```bash
cd scenarios/29-hf-model-artifact
export TESTBENCH_MODE=enabled
./setup.sh
```

## Run the lab

```bash
export TESTBENCH_MODE=enabled
python3 infrastructure/mock_hub.py
python3 victim-app/load_model.py
python3 victim-app/load_model.py --trust-remote-code
curl -s http://127.0.0.1:3029/captured-data
```

The first load fetches `config.json` + `weights.json` and refuses remote Python. The second execs hub `modeling.py` and POSTs to `:3029`. Without `TESTBENCH_MODE=enabled`, that path prints `[SAFE MODE]`.

## Mitigation Playbook

- Do not enable `trust_remote_code` for untrusted hubs.
- Prefer safetensors-class formats (or anything that is not pickle) over pickle-class loads.
- Hash-pin model revisions. Do not float `main`.
- Keep 01-23 in the software catalog. This lab is the ML-artifact track, not a claim that Trivy or Axios is an ML backdoor.
- Scan hub snapshots for unexpected Python next to weights.

## Success

- [ ] Safe load does not capture. Unsafe load does, on localhost only.
- [ ] You did not install torch to finish the lab.
- [ ] You can tell a workshop that 01-23 are still package/CI labs.

## Related

03 compromised package · 15 developer tools · GitHub issue #24 (ML track)
