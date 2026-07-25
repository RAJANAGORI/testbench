# Lookalike secrets (generated locally)

LAB-ONLY credential shapes for Floci harvest demos (**05 / 06 / 21 / 23**).

**Not committed.** Generated on the machine by:

```bash
python3 scenarios/_shared/generate-lookalike-secrets.py
# or automatically via:
./install.sh -y
./scenarios/_shared/plant-lookalike-secrets.sh 06
```

Outputs (gitignored):

- `lookalike-secrets.env` — source before a harvest run  
- `lookalike-secrets.json` — Floci Secrets Manager / SSM seeds  

```bash
set -a && source scenarios/_shared/lookalike-secrets.env && set +a
```

Do **not** use these as Floci emulator credentials (`test` / `test` via `.floci.env`).
