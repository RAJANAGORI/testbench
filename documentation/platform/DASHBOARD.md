# Control Center (optional localhost UI)

CLI is still how I run labs when I am teaching. The dashboard is the browser control plane if you want buttons and a live dock.

Install first:

```bash
./install.sh
source .scas.env
chmod +x scripts/ui/start-dashboard.sh
./scripts/ui/start-dashboard.sh
```

`-y --with-ui` execs the same starter at the end of a workshop install. Labs-only (`--core-only`) still has npm workspaces, so the UI can start; Elasticsearch tiles will just show stopped.

## Ports

| Service | URL | Role |
|---------|-----|------|
| Landing (Vite) | http://0.0.0.0:5173 | Marketing page. Copy lives in `apps/landing/src/content/site.ts`. Primary CTA is Start Dashboard after install. |
| Dashboard (Next.js) | http://0.0.0.0:3100 | Overview, Learn track, labs, Guide / Prepare / Execute / Observe |
| Control plane | http://0.0.0.0:3101 | Process supervisor, WebSocket logs, capture proxy |

Landing and dashboard share `apps/design-tokens/` and the `scas-theme` localStorage key. Control plane has no chrome.

## LAN

Services bind `0.0.0.0`. Same machine: `localhost`. Another device: `http://<lan-ip>:3100`.

The dashboard proxies API and logs through 3100 (`/api/cp/*`, `/ws/logs` -> `127.0.0.1:3101`). You only need 3100 on the LAN. `start-dashboard.sh` fills Next `allowedDevOrigins` from your LAN IP.

Split terminals if you hate the wrapper:

```bash
npm install
npm run dev:control-plane   # 0.0.0.0:3101
npm run dev:dashboard       # 0.0.0.0:3100
npm run dev:landing         # 0.0.0.0:5173
```

Health: `curl http://0.0.0.0:3101/api/health` should include `"ok":true`.

## What I actually click

- Overview: Start here opens lab 01. Learn track is in the sidebar.
- `/learn`: foundation 01-03 pinned. Intermediate and Advanced follow [SCENARIO_LEARNING_PATH.md](../learning-path/SCENARIO_LEARNING_PATH.md), not numeric order.
- Labs list: Begin here on 01, plus the track name next to Beginner/Intermediate/Advanced.
- Scenario page: Guide tab (why, the three workflow tabs, what a capture looks like, next lab, path to the long walkthrough). Then Prepare, Execute, Observe. Optional "Load from repo" dumps `ZERO_TO_HERO_SCENARIO_NN.md`.
- Dock under Labs streams stdout. Reset still calls `scripts/setup/teardown.sh`.

29 labs. Fallback count on Overview is 29 until the API returns.

## Safety

UI on `0.0.0.0` is for an isolated lab, not the public internet. Spawned processes get `TESTBENCH_MODE=enabled`. Payload exfil stays `127.0.0.1`. Do not hang the control plane on an untrusted network.

```
apps/
├── design-tokens/
├── landing/
├── dashboard/
└── control-plane/
```
