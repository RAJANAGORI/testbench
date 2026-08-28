# Quick reference

One page of pointers. Master hub: [Documentation index](../index.md). Lab matrix: [CATALOG.md](../scenario-guides/CATALOG.md).

Canonical files live under `documentation/`. `docs/` is GitHub Pages (HTML plus symlinks).

## First command

`./install.sh`, then `source .scas.env`, then scenario 01. [ZERO_TO_HERO.md](../getting-started/ZERO_TO_HERO.md) is the short version. [QUICK_START.md](../getting-started/QUICK_START.md) if you already know npm. [SETUP.md](../getting-started/SETUP.md) is labs-only detail. [FAQ.md](./FAQ.md) when something is on fire.

Also: [ARCHITECTURE](./ARCHITECTURE.md), [OPERATIONS](./OPERATIONS.md), [DETECTION_AND_OBSERVABILITY](./DETECTION_AND_OBSERVABILITY.md), [BEST_PRACTICES](./BEST_PRACTICES.md), [SCENARIOS.md](../reference/SCENARIOS.md).

## Lab walkthroughs

| Type | Index |
| --- | --- |
| Full catalog (29 scenarios) | [scenario-guides/CATALOG.md](../scenario-guides/CATALOG.md) |
| Zero-to-hero walkthroughs | [scenario-guides/zero-to-hero/README.md](../scenario-guides/zero-to-hero/README.md) |
| Quick reference cards | [scenario-guides/quick-reference/README.md](../scenario-guides/quick-reference/README.md) |

## Common commands

```bash
source .scas.env   # written by ./install.sh (and a minimal copy by setup.sh)
cd scenarios/01-typosquatting && ./setup.sh
./scripts/setup/kill-port.sh 3000
./scripts/setup/kill-port.sh --all
./scripts/setup/teardown.sh
./scripts/observability/elasticsearch-up.sh              # optional observability
./scripts/observability/setup-kibana-data-views.sh
```

## Blue-team quick start

- Runbook pattern: `scenarios/<scenario-folder>/DETECT.md`
- Example: [scenarios/01-typosquatting/DETECT.md](../../scenarios/01-typosquatting/DETECT.md)
- Observability: [DETECTION_AND_OBSERVABILITY.md](./DETECTION_AND_OBSERVABILITY.md)

## Port allow-list

Centralized in [`scripts/setup/ports.env`](../../scripts/setup/ports.env). See [OPERATIONS.md](./OPERATIONS.md).

## Learning path

| Doc | Purpose |
| --- | --- |
| [learning-path/SCENARIO_LEARNING_PATH.md](../learning-path/SCENARIO_LEARNING_PATH.md) | Beginner to advanced order |
| [learning-path/SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md](../learning-path/SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md) | Full curriculum |
| [learning-path/CAPSTONE_RUBRIC.md](../learning-path/CAPSTONE_RUBRIC.md) | Capstone scoring |

## External references

[RESOURCES.md](../reference/RESOURCES.md)
