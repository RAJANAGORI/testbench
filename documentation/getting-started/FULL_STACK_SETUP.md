# Workshop stack: labs + Elasticsearch + Floci

> [Documentation](../index.md) › [Getting started](./index.md) › Workshop stack

I run this on an isolated VM (macOS, Linux, or WSL2): the 29 labs, optional Elasticsearch/Kibana, Floci for the cloud track. First capture is still scenario 01. `source .scas.env` every session.

Shorter: [ZERO_TO_HERO.md](./ZERO_TO_HERO.md) (01 in about ten minutes) · [SETUP.md](./SETUP.md) (labs only) · [Floci](../guides/FLOCI_INTEGRATION.md)

## The installer

From the repo root, Docker already running:

```bash
chmod +x install.sh
./install.sh -y
```

Bare `./install.sh` (no flags) asks labs / workshop / docker. `-y` is the workshop stack so old scripts do not change meaning. `--core-only` is labs + npm, no containers. Compose path: [`./docker/install.sh`](../../docker/install.sh) or pick 3 in the menu; notes in [DOCKER_LABS.md](./DOCKER_LABS.md).

USB HDD / Pi only: [`install-external.sh`](../../install-external.sh) so Docker data lands on that disk first ([Raspberry Pi storage](./RASPBERRY_PI_STORAGE.md)). Everyone else stays on `./install.sh`.

```bash
source .scas.env                 # every session
./scripts/ui/start-dashboard.sh    # optional UI
```

| Flag | Effect |
|------|--------|
| `-y` / `--yes` | Non-interactive workshop |
| `--core-only` | Labs + npm (no ES, no Floci) |
| `--skip-es` | Skip Elasticsearch/Kibana |
| `--skip-floci` | Skip Floci |
| `--no-start` | Configure / pull images but do not start containers |
| `--floci-build` | Build Floci from vendor source instead of `--image` |
| `--with-ui` | Exec `./scripts/ui/start-dashboard.sh` at the end |

Piece-by-piece remains below if you refuse the one command. `START_HERE.sh` just execs `./install.sh`.

---

## Before you start

### What you are installing

| Component | Purpose | Required? |
|-----------|---------|-----------|
| SCAS core | 29 hands-on supply-chain attack labs | Yes |
| Elasticsearch + Kibana | Index detection runbooks and lab events for blue-team practice | Optional (recommended for workshops) |
| Floci | Local AWS emulator (dummy org + story-shaped services on all 29 labs) | Optional (`cloud-context.sh NN`) |

### Safety rules (non-negotiable)

- Use only on an isolated VM or lab machine - never production.
- All malicious behavior targets localhost only.
- Set `TESTBENCH_MODE=enabled` before running attack payloads (`source .scas.env`).
- Do not expose ports 9200, 5601, or 4566 to the public internet.

---

## Part 0 - Prerequisites

### Software

| Tool | Version | Used for |
|------|---------|----------|
| Git | any recent | clone the repo |
| Node.js | 16+ (20 recommended) | scenarios, mock servers, detection tools |
| npm | 7+ | package installs in labs |
| Python 3 | 3.8+ (3.11 recommended) | scenario 22 and some tooling |
| Docker Desktop (or Docker Engine + Compose v2) | recent | Elasticsearch, Kibana, Floci |

macOS (Homebrew example)

```bash
brew install git node python@3.11
brew install --cask docker   # open Docker Desktop; wait until "running"
```

Verify

```bash
git --version
node --version    # v16+
npm --version
python3 --version
docker --version
docker compose version
```

### Hardware

| Setup | RAM | Disk |
|-------|-----|------|
| SCAS only | 4 GB+ | ~2 GB |
| SCAS + Elasticsearch + Kibana | 8 GB+ | ~5 GB |
| Full stack (SCAS + ES + Floci) | 12-16 GB recommended | ~8 GB+ |

---

## Clone, then ./install.sh (or the inner helper)

### Clone

```bash
git clone https://github.com/RAJANAGORI/supply-chain-attack-simulator.git
cd supply-chain-attack-simulator
```

### Preferred: the front door

```bash
chmod +x install.sh
./install.sh -y
source .scas.env
echo $TESTBENCH_MODE   # enabled
```

`./install.sh` calls `scripts/setup/setup.sh -y` for chmod / `.testbench.env` / dirs, then does the npm workspaces install that `setup.sh` skips, then ES/Floci unless you passed `--core-only`.

### Inner helper only (no npm, no ES)

```bash
./scripts/setup/setup.sh -y
source .scas.env
```

That writes a minimal `.scas.env` if you do not already have one. Contributors use this. Learners should not start here. `START_HERE.sh` is `exec ./install.sh`, so old bookmarks still work.

To persist across terminals, `source .scas.env` from the repo root (it sources `.testbench.env` for you). A profile line is optional:

```bash
echo '[ -f "$HOME/path/to/supply-chain-attack-simulator/.scas.env" ] && source "$HOME/path/to/supply-chain-attack-simulator/.scas.env"' >> ~/.zshrc
```

---

## Part 2 - Elasticsearch + Kibana (observability)

Do this once per machine; start/stop per lab session. Full reference: [Detection & observability](../platform/DETECTION_AND_OBSERVABILITY.md).

### Step 1: Start the stack

From repo root:

```bash
chmod +x scripts/observability/elasticsearch-up.sh scripts/observability/elasticsearch-down.sh \
  scripts/observability/setup-kibana-data-views.sh scripts/observability/smoke-observability.sh
./scripts/observability/elasticsearch-up.sh
```

This will:

1. Start Elasticsearch on http://localhost:9200
2. Start Kibana on http://localhost:5601
3. Create indices `scas-rules` and `scas-detections`
4. Load all 29 scenario `DETECT.md` runbooks into Elasticsearch
5. Set up Kibana data views (when Kibana is ready)

First run can take 2-5 minutes while Docker pulls images.

### Step 2: Open Kibana

On the same machine:

- Kibana: http://localhost:5601
- Elasticsearch health: http://localhost:9200/_cluster/health

In Kibana → Discover, you should see data views SCAS Rules and SCAS Detections.

If data views are missing:

```bash
./scripts/observability/setup-kibana-data-views.sh
```

### Step 3: Enable live capture forwarding (opt-in)

So mock servers index exfil events automatically:

```bash
export SCAS_ES_URL=http://localhost:9200
```

Persist for every session:

```bash
echo 'export SCAS_ES_URL=http://localhost:9200' >> .testbench.env
source .scas.env
```

Without `SCAS_ES_URL`, labs still work - captures stay in local JSON files only.

### Step 4: Verify observability

```bash
./scripts/observability/smoke-observability.sh
```

Expect `PASS` for rules count and detections after shipping.

---

## Part 3 - Floci (AWS emulator)

Required for the optional cloud track on all 29 labs. Seed plants a dummy org plus the services that match the attack. Per-scenario detail: [Floci integration guide](../guides/FLOCI_INTEGRATION.md).

### Step 1: One-time Floci setup

From repo root, pick one option:

Option A - Fast (recommended)

Published Docker image; no Java build.

```bash
./scripts/floci/floci-setup.sh --image
```

Option B - Build from source

Clones `floci-io/floci` into `vendor/floci-aws` (~5-15 min first time).

```bash
./scripts/floci/floci-setup.sh
```

This creates:

- `infrastructure/floci/` - Docker Compose config
- `.floci.env` - AWS endpoint variables for labs
- `vendor/floci-aws/` - Floci source (Option B only)

### Step 2: Start Floci (each lab session)

```bash
./scripts/floci/floci-up.sh
./scripts/floci/floci-status.sh
```

Floci listens on http://127.0.0.1:4566 (container name: `scas-floci`).

### Step 3: Load Floci environment

```bash
source .floci.env
echo $SCAS_FLOCI_ENABLED   # must print: 1
```

---

## Part 4 - "Everything on" session layout

Use three terminals for the full workshop stack:

| Terminal | Role | Commands |
|----------|------|----------|
| T1 - Infrastructure | Long-running services | ES (if not up), Floci, scenario mock servers |
| T2 - Lab work | Run attacks, npm, scripts | Scenario steps per README |
| T3 - Blue team (optional) | curl, detectors, Kibana | Verification |

T1 - Start everything (repo root)

```bash
source .scas.env
source .floci.env
export SCAS_ES_URL=http://localhost:9200

# If not already running:
./scripts/observability/elasticsearch-up.sh
./scripts/floci/floci-up.sh
```

---

## Part 5 - Prove it works: Scenario 01 (no Floci)

Best first lab - typosquatting. Mock server on port 3000 only.

T1 - Mock server

```bash
cd scenarios/01-typosquatting
./setup.sh
node infrastructure/mock-server.js
```

Leave this running.

T2 - Run the attack

```bash
cd supply-chain-attack-simulator   # repo root
source .scas.env
export SCAS_ES_URL=http://localhost:9200   # optional

cd scenarios/01-typosquatting/victim-app
npm install ../malicious-packages/request-lib
npm start
```

T3 - Verify

```bash
curl http://localhost:3000/captured-data

# Optional: backfill Elasticsearch
node detection-tools/es/ship-captures.js

# Optional: package scanner
node detection-tools/package-scanner.js scenarios/01-typosquatting/victim-app
```

In Kibana → Discover → SCAS Detections, filter `scenario_id: "01"`.

Walkthrough: [Zero to Hero - Scenario 01](../scenario-guides/zero-to-hero/ZERO_TO_HERO_SCENARIO_01.md)

---

## Part 6 - Prove Floci works: Scenario 05 (build compromise)

T1 - Services

```bash
cd supply-chain-attack-simulator   # repo root
source .scas.env
source .floci.env
export SCAS_ES_URL=http://localhost:9200

./scripts/floci/floci-status.sh   # must be healthy

cd scenarios/05-build-compromise
./setup.sh
node infrastructure/mock-server.js &
chmod +x infrastructure/floci/*.sh
./infrastructure/floci/seed.sh
```

T2 - Run build attack

```bash
cd scenarios/05-build-compromise/compromised-build
set -a && source .env.lab 2>/dev/null || source ../../_shared/lookalike-secrets.env; set +a
npm run build
```

T3 - Verify both tracks

```bash
# HTTP mock (port 3000)
curl http://localhost:3000/captured-data

# Floci S3 + org dump
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh 05

# Blue-team detector
../../detection-tools/floci/s3-exfil-check.sh 05
```

More: `scenarios/05-build-compromise/FLOCI.md` · [Floci integration guide](../guides/FLOCI_INTEGRATION.md)

---

## Part 7 - What runs where (ports)

| Port | Service |
|------|---------|
| 9200 | Elasticsearch |
| 5601 | Kibana |
| 4566 | Floci (AWS emulator) |
| 3000-3023 | Scenario mock servers (see [`scripts/setup/ports.env`](../../scripts/setup/ports.env)) |

Floci uses 4566 only - it does not start floci-ui on 3000/3001, so it will not conflict with SCAS mock servers.

Full matrix: [Operations runbook](../platform/OPERATIONS.md#port-matrix)

---

## Part 8 - Stop and clean up

Stop Floci

```bash
./scripts/floci/floci-down.sh
```

Stop Elasticsearch

```bash
./scripts/observability/elasticsearch-down.sh
# Remove persisted ES data:
./scripts/observability/elasticsearch-down.sh --volumes
```

Reset lab artifacts (ports, captures, node_modules)

```bash
./scripts/setup/teardown.sh
```

Free a single port

```bash
./scripts/setup/kill-port.sh 3000
```

---

## Part 9 - Session cheat sheet

```bash
# === ONE-TIME ===
git clone https://github.com/RAJANAGORI/supply-chain-attack-simulator.git
cd supply-chain-attack-simulator
./install.sh -y                 # preferred: core + ES + Floci + .scas.env
# or piece-by-piece:
# ./scripts/setup/setup.sh
# ./scripts/floci/floci-setup.sh --image
# ./scripts/observability/elasticsearch-up.sh

# === EVERY SESSION (repo root) ===
source .scas.env                # TESTBENCH_MODE + SCAS_ES_URL + .floci.env
# (equivalent: source .testbench.env && source .floci.env && export SCAS_ES_URL=http://localhost:9200)

./scripts/floci/floci-up.sh          # if you used --no-start, or after floci-down
# start scenario mock server(s) in scenario folder

# === EACH SCENARIO ===
cd scenarios/NN-<name>
./setup.sh
cat README.md

# === SHUTDOWN ===
./scripts/floci/floci-down.sh
./scripts/observability/elasticsearch-down.sh
./scripts/setup/teardown.sh
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `TESTBENCH_MODE not enabled` | `source .scas.env` from repo root |
| Port already in use | `./scripts/setup/kill-port.sh 3000` or `./scripts/setup/teardown.sh` |
| Docker not running | Start Docker Desktop; wait until ready |
| Elasticsearch won't start | Need ~8 GB RAM free; `docker logs scas-elasticsearch` |
| Floci not healthy | `./scripts/floci/floci-setup.sh --image` then `./scripts/floci/floci-up.sh`; `docker logs scas-floci` |
| Floci port 4566 conflict | `docker stop scas-floci` or stop other local AWS emulators |
| Kibana empty | `./scripts/observability/setup-kibana-data-views.sh` |
| No ES detections | Run a scenario first, then `node detection-tools/es/ship-captures.js` |
| Permission denied on scripts | `find scripts -name '*.sh' -type f -exec chmod +x {} + scenarios/*/setup.sh` |

More: [FAQ](../platform/FAQ.md) · [Operations](../platform/OPERATIONS.md)

---

## Where to go next

1. [First lab quick start](./ZERO_TO_HERO.md)
2. [Scenario catalog](../scenario-guides/CATALOG.md)
3. [Detection & observability](../platform/DETECTION_AND_OBSERVABILITY.md)
4. [Floci cloud track](../guides/FLOCI_INTEGRATION.md) - all 29 labs; `cloud-context.sh NN` dumps the dummy org

---

Related: [Getting started index](./index.md) · [Operations](../platform/OPERATIONS.md) · [Tooling](../platform/TOOLING.md) · [↑ Documentation index](../index.md)
