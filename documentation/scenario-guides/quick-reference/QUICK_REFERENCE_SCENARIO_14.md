# Quick Reference: Scenario 14 - Container image supply chain

Live card for lab 14. Default path does **not** need Docker. `malicious-start.js` is the runtime. Docker build is the optional comparison after the Node path works.

Collector is **:3002**. Ingest is `POST /capture`. I have watched rooms curl `:3000` for ten minutes on this lab.

## Table of Contents

<div class="doc-toc">

- [Prep](#prep)
- [Collector](#collector)
- [Scan, then simulate runtime (this is the success path)](#scan-then-simulate-runtime-this-is-the-success-path)
- [Optional Docker comparison](#optional-docker-comparison)
- [Layout](#layout)
- [Handy extras](#handy-extras)
- [Stuck](#stuck)
- [Companion docs](#companion-docs)

</div>

---
## Prep

```bash
source .scas.env
echo $TESTBENCH_MODE
cd scenarios/14-container-image-supply-chain-attack
export TESTBENCH_MODE=enabled
./setup.sh
./scripts/setup/kill-port.sh 3002   # from repo root if the port is dirty
```

## Collector

```bash
cd scenarios/14-container-image-supply-chain-attack
export TESTBENCH_MODE=enabled
node infrastructure/mock-server.js
```

Leave it up. Listen on 3002.

## Scan, then simulate runtime (this is the success path)

```bash
cd scenarios/14-container-image-supply-chain-attack
node detection-tools/image-scanner.js images/compromised-image
TESTBENCH_MODE=enabled node images/compromised-image/malicious-start.js
curl -s http://127.0.0.1:3002/captured-data
```

Students who only `docker build` and never run `malicious-start.js` will swear the lab is broken. The README default is the Node simulation.

Clear:

```bash
curl -X DELETE http://127.0.0.1:3002/captured-data
```

## Optional Docker comparison

After the Node path captured:

```bash
docker build -t scas-legit images/legitimate-image
docker build -t scas-compromised images/compromised-image
docker run --rm -e TESTBENCH_MODE=enabled --add-host=host.docker.internal:host-gateway scas-compromised
```

Floci ECR/ECS is a third track:

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 14
```

## Layout

```text
scenarios/14-container-image-supply-chain-attack/
├── images/legitimate-image/          # clean Dockerfile + app.js
├── images/compromised-image/
│   ├── Dockerfile
│   └── malicious-start.js            # default runtime
├── detection-tools/image-scanner.js
├── infrastructure/mock-server.js     # :3002, POST /capture
├── victim-app/
├── DETECT.md
└── FLOCI.md
```

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3002
./scripts/setup/kill-port.sh 3002
```

## Stuck

| Problem | What I check |
|---------|----------------|
| Empty capture | Gate, mock on 3002, then rerun `malicious-start.js` |
| Port busy | `kill-port.sh 3002` |
| "Docker is required" | It is not, for the default path |
| Scanner quiet | You pointed at `legitimate-image` |
| Floci empty | seed.sh before cloud-context.sh |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_14.md`
- Lab README: `scenarios/14-container-image-supply-chain-attack/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
