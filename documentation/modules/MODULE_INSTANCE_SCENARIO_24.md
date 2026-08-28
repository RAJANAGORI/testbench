# Module Instance: Scenario 24 (Slopsquatting)

Based on [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md).

## 1) Module Card

- **Module ID**: `24`
- **Title**: `Slopsquatting`
- **Level**: `Intermediate`
- **Estimated Time**: `20-40 minutes`
- **Primary Attack Surface**: `LLM-invented package names vs a real catalog`
- **Prerequisites**: Scenario 01 capture loop, TESTBENCH_MODE, localhost mocks

## 2) Learning Objectives

- Tell 24 from 01. Fail a catalog 404. Capture on :3024.
- Reproduce the capture on `127.0.0.1:3024`.
- Walk the DETECT.md IOCs without inventing extra tools.

## 3) Threat Model Snapshot

- **Asset at risk**: whatever the lab's trust edge actually is (catalog, CI `uses:`, agent tools, provenance, GOPROXY, model hub)
- **Trust edge abused**: see the scenario README contrast paragraph
- **Attacker objective**: run gated payload, collect on localhost
- **Blast radius**: this VM only

## 4) Lab Setup

```bash
cd scenarios/24-slopsquatting
export TESTBENCH_MODE=enabled
./setup.sh
```

Evidence: `curl -s http://127.0.0.1:3024/captured-data`

## 5) Attack Walkthrough

Follow the scenario README "Run the lab" section. Do not skip the contrast sentence at the top.

## 6) Detection Playbook

Use [DETECT.md](../../scenarios/24-slopsquatting/DETECT.md). Capture file is `infrastructure/captured-data.json`.
