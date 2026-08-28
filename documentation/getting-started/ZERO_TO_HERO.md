# First capture in about ten minutes

This page is the short hands-on start: clone, `./install.sh`, run **scenario 01**. It is not the curriculum and it is not a 800-line walkthrough.

- Curriculum (trust-edge model, staged learning) -> [SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md](../learning-path/SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md)
- Per-lab walkthroughs -> [zero-to-hero/index.md](../scenario-guides/zero-to-hero/index.md)

Do not start on scenario 07. Typosquatting is the first capture on purpose.

## What you need

Node 16+ (20 if you will run the UI), npm, Git, Python 3.8+ for a few helpers. Docker only if you pick the workshop stack or Docker labs.

## Clone, then one installer

```bash
git clone https://github.com/RAJANAGORI/supply-chain-attack-simulator.git
cd supply-chain-attack-simulator
chmod +x install.sh
./install.sh
```

No flags: a three-way menu. Labs only is the fast path (Node/Python, no Docker). Workshop stack is npm workspaces plus Elasticsearch/Kibana plus Floci (`-y` still means that, so old snippets keep their meaning). Docker labs execs `./docker/install.sh`.

Every session after that:

```bash
source .scas.env
```

That file always gets written, even on labs-only. It pulls in `.testbench.env` so `TESTBENCH_MODE=enabled`.

## Safety, said once

Malicious paths stay off unless that env is on. Mock exfil is `127.0.0.1` / `localhost`. Isolated VM. Do not publish the packages.

## Scenario 01 (typosquatting)

```bash
cd scenarios/01-typosquatting
./setup.sh
```

Second terminal: `node infrastructure/mock-server.js`. Then in `victim-app`:

```bash
npm install ../malicious-packages/request-lib
npm start
curl http://localhost:3000/captured-data
```

You should see a captures array, not `[]`. Shape is in `scenarios/01-typosquatting/README.md`. The long form is [ZERO_TO_HERO_SCENARIO_01.md](../scenario-guides/zero-to-hero/ZERO_TO_HERO_SCENARIO_01.md).

Prefer the browser? After install, `./scripts/ui/start-dashboard.sh`, open lab 01, read the Guide tab, then Prepare / Execute / Observe.

## After 01

02, then 03. That is the foundation track. Then [SCENARIO_LEARNING_PATH.md](../learning-path/SCENARIO_LEARNING_PATH.md) (intermediate is not 04-16 in numeric order).

If `npm install` skips postinstall, you forgot `source .scas.env`. If the mock will not bind, `./scripts/setup/kill-port.sh 3000`.
