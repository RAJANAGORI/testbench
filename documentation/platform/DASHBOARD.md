# SCAS Dashboard (optional localhost UI)

The CLI remains the canonical way to run labs. The dashboard is an optional control plane for learners who prefer a browser UI.

## Stack

| Service | URL | Role |
|---------|-----|------|
| Landing (Vite) | http://127.0.0.1:5173 | Xero-style hero + **Start Dashboard** CTA |
| Dashboard (Next.js) | http://127.0.0.1:3100 | Scenario catalog, service controls, live logs |
| Control plane | http://127.0.0.1:3101 | Process supervisor, WebSocket logs, capture proxy |

## Quick start

From the repository root (after `./scripts/setup.sh`):

```bash
chmod +x scripts/start-dashboard.sh
./scripts/start-dashboard.sh
```

Or run components separately:

```bash
npm install
npm run dev:control-plane   # terminal 1
npm run dev:dashboard       # terminal 2
npm run dev:landing         # terminal 3
```

Open http://127.0.0.1:5173 and click **Start Dashboard**.

**Control plane not loading?** It must be running separately. Verify:

```bash
curl http://127.0.0.1:3101/api/health
# → {"ok":true,"port":3101,...}
```

If you only ran `npm run dev:landing`, the dashboard will show errors — start all three services or use `./scripts/start-dashboard.sh`.

## Safety

- Control plane binds to **127.0.0.1** only.
- All spawned lab processes receive `TESTBENCH_MODE=enabled`.
- Capture endpoints remain localhost-only; the dashboard proxies existing mock APIs.
- Do not expose the control plane to a network.

## What the dashboard can do

- List and run all **23** scenarios (setup, start mocks/registries, attack steps, full lab)
- Stream stdout/stderr over WebSocket
- Display capture JSON from mock servers
- Start/stop Elasticsearch, Kibana (via existing scripts), Floci
- Run per-scenario Floci seed/verify where configured
- Global teardown via `scripts/teardown.sh`

## Project layout

```
apps/
├── landing/          # Vite + React (plain CSS hero)
├── dashboard/        # Next.js + Tailwind
└── control-plane/    # Express + WS + scenario registry
```
