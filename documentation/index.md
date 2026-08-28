# Supply Chain Attack Simulator docs

Guides for learners, blue-team practice, and instructors.

Canonical markdown is `documentation/`. The [`docs/`](../docs/) folder is GitHub Pages (`index.html`, [`guide.html`](../docs/guide.html)) plus symlinks back here. Edit this tree.

Web hub: [guide.html](../docs/guide.html)

First command: `./install.sh`, then `source .scas.env`, then scenario 01.

## Start by role

| You are... | Start here | Then |
|----------|------------|------|
| New to SCAS | `./install.sh` then [first capture](./getting-started/ZERO_TO_HERO.md) | [Scenario 01 walkthrough](./scenario-guides/zero-to-hero/ZERO_TO_HERO_SCENARIO_01.md) |
| Experienced developer | [Quick start](./getting-started/QUICK_START.md) · [Docker labs](./getting-started/DOCKER_LABS.md) | [Scenario catalog](./scenario-guides/CATALOG.md) |
| Blue-team / detection | [Detection & observability](./platform/DETECTION_AND_OBSERVABILITY.md) | `scenarios/*/DETECT.md` |
| Instructor / workshop lead | [Teaching delivery pack](./learning-path/TEACHING_DELIVERY_PACK.md) | [Teaching modules](./modules/index.md) |
| Running the observability stack | [Operations](./platform/OPERATIONS.md) | [Observability stack](../observability/README.md) |
| Maintainer / contributor | [Tooling & doc maintenance](./platform/TOOLING.md) | [CONTRIBUTING](../CONTRIBUTING.md) |

## Browse by task

- Set up the lab -> [first capture](./getting-started/ZERO_TO_HERO.md) · [Workshop stack](./getting-started/FULL_STACK_SETUP.md) · [Docker labs](./getting-started/DOCKER_LABS.md) · [SETUP](./getting-started/SETUP.md) · [Operations](./platform/OPERATIONS.md) · [FAQ](./platform/FAQ.md)
- Run one scenario -> [Catalog](./scenario-guides/CATALOG.md) -> README -> [quick-reference card](./scenario-guides/quick-reference/index.md)
- Learn an attack class -> [Zero-to-hero walkthroughs](./scenario-guides/zero-to-hero/index.md)
- Detect and hunt -> [Detection & observability](./platform/DETECTION_AND_OBSERVABILITY.md) · [Best practices](./platform/BEST_PRACTICES.md)
- Teach a course -> [Learning path](./learning-path/index.md) · [Modules](./modules/index.md) · [Capstone rubric](./learning-path/CAPSTONE_RUBRIC.md)
- Optional cloud track -> [Floci](./guides/FLOCI_INTEGRATION.md)
- One-page commands -> [Quick reference](./platform/QUICK_REFERENCE.md)

## Documentation map

| Section | Index | What's inside |
|---------|-------|---------------|
| Getting started | [getting-started/](./getting-started/index.md) | Installer, first lab, quick start, labs-only, Docker |
| Scenario guides | [scenario-guides/](./scenario-guides/index.md) | 29-lab [catalog](./scenario-guides/CATALOG.md), walkthroughs, cheat sheets |
| Platform & operations | [platform/](./platform/index.md) | Architecture, operations, detection, tooling, FAQ |
| Learning path | [learning-path/](./learning-path/index.md) | Curriculum, tracks, teaching delivery, capstone |
| Teaching modules | [modules/](./modules/index.md) | Instructor cards for all 29 + template |
| Integration guides | [guides/](./guides/index.md) | Floci local-AWS |
| Reference | [reference/](./reference/index.md) | Scenario summaries and external resources |
| Governance | [LEGAL](../LEGAL.md) · [ATTRIBUTION](../ATTRIBUTION.md) · [AUTHORS](../AUTHORS.md) | Copyright, licensing, attribution |

## Folder map

```text
documentation/
├── index.md                  <- you are here
├── README.md                 thin pointer for GitHub folder view
├── getting-started/          installer, first lab, quick start
├── scenario-guides/
│   ├── CATALOG.md            all 29 scenarios
│   ├── zero-to-hero/         29 learner walkthroughs
│   └── quick-reference/      29 command cards
├── platform/                 architecture, operations, detection, FAQ
├── learning-path/            curriculum, tracks, teaching, capstone
├── modules/                  teaching cards
├── guides/                   Floci
└── reference/                summaries and external resources
```

## Safety

Intentionally vulnerable code. Isolated VM. `source .scas.env` (or `TESTBENCH_MODE=enabled`) before labs. Exfil is localhost. Never publish the samples.

[FAQ](./platform/FAQ.md) · [SECURITY](../SECURITY.md)

When scenario behavior changes, use the shared tooling. Catalog: [Tooling](./platform/TOOLING.md). Questions: [FAQ](./platform/FAQ.md) or [open an issue](https://github.com/RAJANAGORI/supply-chain-attack-simulator/issues).

Documentation (c) 2024-2026 Raja Nagori, [CC BY-NC-ND 4.0](../DOCUMENTATION-CC-BY-NC-ND.md). Software is [MIT](../LICENSE). [LEGAL](../LEGAL.md) · [ATTRIBUTION](../ATTRIBUTION.md).
