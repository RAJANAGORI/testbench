# Quick start (you already know npm)

Five minutes if Node is on PATH and you have cloned the repo. First lab is still **01**, not 07.

## Install

```bash
node --version   # v16+
npm --version    # v7+
```

From the repo root:

```bash
chmod +x install.sh
./install.sh -y --core-only
source .scas.env
```

That runs `scripts/setup/setup.sh` for chmod / `.testbench.env` / dirs, then the `npm install` that `setup.sh` itself does not run. Workshop stack (ES + Floci): drop `--core-only` and keep `-y`. Compose labs: [DOCKER_LABS.md](./DOCKER_LABS.md) or choose option 3 from a bare `./install.sh`.

`START_HERE.sh` is a wrapper. Same flags as `./install.sh`.

## Mock + capture (scenario 01)

```bash
cd scenarios/01-typosquatting
./setup.sh
node infrastructure/mock-server.js &
cd victim-app
npm install ../malicious-packages/request-lib
npm start
curl http://localhost:3000/captured-data
```

Empty array means the victim never posted. Check `echo $TESTBENCH_MODE`. Clear between runs with `curl -X DELETE http://localhost:3000/captured-data`.

Other labs ship their own mock after `./setup.sh`. Ports live in `scripts/setup/ports.env`.

## What you just did

You installed a package named like `requests` with one letter missing (`request-lib`). The victim app treated it as HTTP glue. The mock on :3000 got the exercise payload. Quiet, if you are not watching.

Scanner if you want a second signal:

```bash
node detection-tools/package-scanner.js scenarios/01-typosquatting/victim-app
```

## Then

[02 dependency confusion](../../scenarios/02-dependency-confusion/README.md), [03 compromised package](../../scenarios/03-compromised-package/README.md), then the [learning path](../learning-path/SCENARIO_LEARNING_PATH.md). Control Center: `./scripts/ui/start-dashboard.sh` and the Guide tab on lab 01.

Stuck ports: `./scripts/setup/kill-port.sh 3000` or `./scripts/setup/teardown.sh`. Fuller install notes: [SETUP.md](./SETUP.md) (core) or [FULL_STACK_SETUP.md](./FULL_STACK_SETUP.md) (workshop).
