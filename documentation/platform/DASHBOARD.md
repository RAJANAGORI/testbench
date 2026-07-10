# SCAS Dashboard (optional localhost UI)

The CLI remains the canonical way to run labs. The dashboard is an optional control plane for learners who prefer a browser UI.

## Stack

| Service | URL | Role |
|---------|-----|------|
| Landing (Vite) | http://0.0.0.0:5173 | SCAS hero + **Start Dashboard** CTA |
| Dashboard (Next.js) | http://0.0.0.0:3100 | Scenario catalog, service controls, live logs |
| Control plane | http://0.0.0.0:3101 | Process supervisor, WebSocket logs, capture proxy |

## LAN access

Services bind on `0.0.0.0`. Use `localhost` on the same machine, or your LAN IP from another device (e.g. `http://192.168.1.14:3100`).

`start-dashboard.sh` auto-detects your LAN IP and configures Next.js `allowedDevOrigins` so the dashboard works over the network in dev mode.

## Quick start

From the repository root (after `./scripts/setup.sh`):

```bash
chmod +x scripts/start-dashboard.sh
./scripts/start-dashboard.sh
```

Or run components separately:

```bash
npm install
npm run dev:control-plane   # terminal 1 — 0.0.0.0:3101
npm run dev:dashboard       # terminal 2 — 0.0.0.0:3100
npm run dev:landing         # terminal 3 — 0.0.0.0:5173
```

Then open:

- Landing: http://0.0.0.0:5173 (or http://localhost:5173)
- Dashboard: http://0.0.0.0:3100
- Control plane health: http://0.0.0.0:3101/api/health

**Control plane not loading?** Verify:

```bash
curl http://0.0.0.0:3101/api/health
# → {"ok":true,"port":3101,...}
```

## Safety

- UI services bind to **0.0.0.0** for local/LAN access — use only in isolated lab environments.
- All spawned lab processes receive `TESTBENCH_MODE=enabled`.
- Scenario payload exfiltration remains **127.0.0.1** only; the dashboard proxies existing mock APIs.
- Do not expose the control plane to untrusted networks.

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
