# Quick Reference: Scenario 28 - Go module confusion

GOPROXY **3028**, `GOSUMDB=off` for the attack demo, sneaky `replace`. Go optional; Node client for smoke.

`./install.sh` does not apt-get golang. Do not "fix" that. Docker labs use a Go image. Host smoke uses `goproxy-client.js`.

## Table of Contents

<div class="doc-toc">

- [Pack the zip](#pack-the-zip)
- [go run](#go-run)
- [No Go](#no-go)
- [replace trap](#replace-trap)
- [Floci](#floci)
- [Handy extras](#handy-extras)
- [Layout](#layout)
- [Do not](#do-not)
- [Companion docs](#companion-docs)

</div>

---
## Pack the zip

```bash
source .scas.env
echo $TESTBENCH_MODE
go version || echo "no Go; use goproxy-client.js"
cd scenarios/28-go-module-confusion
export TESTBENCH_MODE=enabled
./setup.sh
node infrastructure/mock-server.js
```

The mock is also the GOPROXY on 3028. `setup.sh` zips `attacker-module/` into the store (Python). Go is not required for that step.

## go run

```bash
cd scenarios/28-go-module-confusion/victim-module
export TESTBENCH_MODE=enabled
GOPROXY=http://127.0.0.1:3028,off GOSUMDB=off GONOSUMDB='*' go run -mod=mod .
curl -s http://127.0.0.1:3028/captured-data
```

If `go run` complains about sumdb, you left `GOSUMDB` on, which is actually the mitigation. For the attack demo we turn it off on purpose.

## No Go

From scenario root, mock already up:

```bash
export TESTBENCH_MODE=enabled
node infrastructure/goproxy-client.js
curl -s http://127.0.0.1:3028/captured-data
```

## replace trap

```bash
diff -u victim-module/go.mod victim-module/go.mod.replace-trap
grep -n "127.0.0.1\|TESTBENCH_MODE" attacker-module/widget.go
```

## Floci

```bash
export SCAS_FLOCI_ENABLED=1
./infrastructure/floci/seed.sh
../../detection-tools/floci/cloud-context.sh 28
```

SSM `/scas/sc28/goproxy` should match `http://127.0.0.1:3028,off`.

## Handy extras

```bash
echo $TESTBENCH_MODE
lsof -i :3028
./scripts/setup/kill-port.sh 3028
curl -X DELETE http://127.0.0.1:3028/captured-data
```

Zip store under `infrastructure/goproxy-store/` is gitignored. Rerun `./setup.sh` on a fresh clone.

## Layout

```text
scenarios/28-go-module-confusion/
├── attacker-module/widget.go         # init() beacon
├── victim-module/go.mod
├── victim-module/go.mod.replace-trap
├── infrastructure/goproxy-client.js
├── infrastructure/pack-module.py
├── infrastructure/mock-server.js     # :3028 GOPROXY + collect
├── DETECT.md
└── FLOCI.md
```

## Do not

| Problem | What I check |
|---------|----------------|
| `go: no Go files` | `cd victim-module` |
| Empty capture | Gate, mock, GOPROXY port |
| Temptation to apt-get golang | README forbids changing install.sh |
| Client vs go run disagreement | Client is smoke. Teach `go run` when Go exists |
| Port busy | `kill-port.sh 3028` |

## Companion docs

- Walkthrough: `../zero-to-hero/ZERO_TO_HERO_SCENARIO_28.md`
- Lab README: `scenarios/28-go-module-confusion/README.md`
- DETECT.md and FLOCI.md in that folder
- Session setup: `../../getting-started/SETUP.md`
