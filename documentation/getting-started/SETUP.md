# Labs-only setup (no Docker)

Workshop stack (Elasticsearch, Kibana, Floci) is [FULL_STACK_SETUP.md](./FULL_STACK_SETUP.md). This page is Node/Python labs, `.scas.env`, and the usual "port already bound" mess.

Front door is `./install.sh`. `--core-only` is this path. `scripts/setup/setup.sh` is a contributor helper: chmod, `.testbench.env`, dirs. It does not run `npm install`. I burned an hour on that once because the script's old banner claimed it would.

## What has to be on the box

Linux, macOS, or Windows with WSL2. Node 16+ (20 via `.nvmrc` if you want the UI), npm 7+, Python 3.8+ (3.11 via `.python-version`), Git.

4 GB RAM is enough. Canonical markdown lives in `documentation/`. `docs/` is GitHub Pages plus symlinks, so do not edit both.

macOS Node: `brew install node`. Debian: distro `nodejs`/`npm` or NodeSource (you may need a `node` symlink). WSL2: `wsl --install`, then the Ubuntu steps inside the distro.

## Clone the real repo

```bash
git clone https://github.com/RAJANAGORI/supply-chain-attack-simulator.git
cd supply-chain-attack-simulator
```

Not `cd testbench`. Not a `<repository-url>` placeholder.

## Installer, labs only

```bash
chmod +x install.sh
./install.sh -y --core-only
source .scas.env
echo $TESTBENCH_MODE   # enabled
```

That checks prereqs, runs `setup.sh -y`, then root `npm install` plus `detection-tools`. Lookalike harvest fixtures are generated locally and gitignored.

If you really only want chmod:

```bash
./scripts/setup/setup.sh -y
source .scas.env
```

You still need `npm install` before workspaces or the dashboard. Drop the gate in this shell with `unset TESTBENCH_MODE`. Do not paste `.testbench.env` into a gist.

## First proof

```bash
cd scenarios/01-typosquatting
./setup.sh
```

Other terminal: `node infrastructure/mock-server.js`. `curl http://localhost:3000/captured-data` should look empty. Then:

```bash
cd victim-app
npm install ../malicious-packages/request-lib
npm start
curl http://localhost:3000/captured-data
```

A capture means setup worked. Long form: [ZERO_TO_HERO_SCENARIO_01.md](../scenario-guides/zero-to-hero/ZERO_TO_HERO_SCENARIO_01.md).

## When it fights you

`TESTBENCH_MODE not enabled` -> `source .scas.env` from the repo root.

EADDRINUSE -> `./scripts/setup/kill-port.sh 3000` or `--all`. Full wipe: `./scripts/setup/teardown.sh`. That script uses `scripts/setup/ports.env`, nukes capture JSON, and scenario `node_modules`.

npm install fails -> `npm cache clean --force`, delete `node_modules` and the lockfile in that folder, try again.

Permission denied on scripts -> `find scripts -name '*.sh' -type f -exec chmod +x {} +` and `chmod +x scenarios/*/setup.sh`.

Cannot find module -> run that lab's `./setup.sh`, then `npm install` in `victim-app` or `corporate-app`.

Mock never gets data: is the mock process up? Is `TESTBENCH_MODE` set? Is localhost firewalled? Read victim stdout.

Optional `.npmrc` at repo root for confusion labs (`@yourcompany:registry=http://localhost:4873/` plus public `registry.npmjs.org`). Change a mock `PORT` only if you also change the payload in that same scenario.

Education only. Isolated VM. Never publish the malware. Then [ZERO_TO_HERO.md](./ZERO_TO_HERO.md), then labs 02 and 03.
