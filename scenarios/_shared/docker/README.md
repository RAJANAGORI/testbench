# Shared Docker primitives (local labs)

Shared Compose pieces for SCAS scenarios. You run these on your own machine - there is no Killercoda or browser-lab path here.

## Layout

| File | Purpose |
|------|---------|
| `compose.lab.template.yml` | Skeleton: `mock-c2` + `victim` (shared netns) + optional `mock-registry` |
| `Dockerfile.victim-node` | Node 20 slim base used by Node labs |

## Safety

- Always set `TESTBENCH_MODE=enabled` on the victim.
- Keep payload exfiltration on **`localhost` / `127.0.0.1`** only.
- Scenario 01 (and labs that hardcode `localhost`) run the victim with `network_mode: "service:mock-c2"` so `localhost:3000` reaches the C2 sink without weakening the allowlist.

## When to add a registry sidecar

| Scenario family | Registry service |
|-----------------|------------------|
| File / path installs (01, 21, ...) | None |
| Custom npm registry sim (02, 11) | Wrap existing `infrastructure/registry-server.js` - do **not** default to Verdaccio |
| PyPI path install (22) | Python image + venv; no pypiserver required for the current lab |
| Container image lab (14) | May need Docker-in-Docker or prebuilt images |

## Local usage (per scenario)

```bash
cd scenarios/01-typosquatting
docker compose up -d --build
docker compose exec victim bash
# ...run the lab...
curl http://localhost:3000/captured-data
docker compose down -v
```

Run **one lab at a time** if ports collide (many early scenarios publish host port 3000).
