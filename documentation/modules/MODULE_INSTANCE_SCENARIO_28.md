# Module Instance: Scenario 28 (Go module confusion)

Based on [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md).

## 1) Module Card

- **Module ID**: `28`
- **Title**: `Go module confusion`
- **Level**: `Advanced`
- **Estimated Time**: `30-40 minutes`
- **Primary Attack Surface**: `Go GOPROXY / sumdb / replace`
- **Prerequisites**: Scenario 01 capture loop, TESTBENCH_MODE, localhost mocks

## 2) Learning Objectives

- Keep GOSUMDB on. Review replace. Do not point GOPROXY at a stranger.
- Reproduce the capture on `127.0.0.1:3028`.
- Walk the DETECT.md IOCs without inventing extra tools.

## 3) Threat Model Snapshot

- **Asset at risk**: whatever the lab's trust edge actually is (catalog, CI `uses:`, agent tools, provenance, GOPROXY, model hub)
- **Trust edge abused**: see the scenario README contrast paragraph
- **Attacker objective**: run gated payload, collect on localhost
- **Blast radius**: this VM only

## 4) Lab Setup

```bash
cd scenarios/28-go-module-confusion
export TESTBENCH_MODE=enabled
./setup.sh
```

Evidence: `curl -s http://127.0.0.1:3028/captured-data`

## 5) Attack Walkthrough

Follow the scenario README "Run the lab" section. Do not skip the contrast sentence at the top.

## 6) Detection Playbook

Use [DETECT.md](../../scenarios/28-go-module-confusion/DETECT.md). Capture file is `infrastructure/captured-data.json`.
