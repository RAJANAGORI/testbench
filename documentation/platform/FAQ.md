# FAQ

Stuff that actually comes up. Licensing at the bottom.

## Safety

Isolated VM. That is the bar. Payloads hide behind `TESTBENCH_MODE=enabled` and exfil is localhost, but the tree is still intentionally vulnerable code, so I do not run it on a laptop I care about.

npm/pip may need the network. Lab exfil does not phone a real attacker.

Do not publish these packages. Education only.

## First hour

Canonical command is `./install.sh`. Then `source .scas.env`. Then [ZERO_TO_HERO.md](../getting-started/ZERO_TO_HERO.md) and [scenario 01](../../scenarios/01-typosquatting/) with [ZERO_TO_HERO_SCENARIO_01.md](../scenario-guides/zero-to-hero/ZERO_TO_HERO_SCENARIO_01.md).

`START_HERE.sh` execs the same installer. It is not a second product next to SETUP.md.

[ZERO_TO_HERO.md](../getting-started/ZERO_TO_HERO.md) is clone-plus-first-capture. [SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md](../learning-path/SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md) is the curriculum. Different files. I keep mixing the names in Slack and then I am wrong.

Order: [SCENARIO_LEARNING_PATH.md](../learning-path/SCENARIO_LEARNING_PATH.md). 01 then 02 then 03. Finish 01-05 before 06. The dashboard Learn page uses that grouping, not 01 through 23 in numeric order.

## Labs

Victim does nothing? The gate is off.

```bash
source .scas.env
echo $TESTBENCH_MODE   # enabled
```

Port taken:

```bash
./scripts/setup/kill-port.sh 3000
./scripts/setup/kill-port.sh --all
```

[OPERATIONS.md](./OPERATIONS.md) and [CATALOG.md](../scenario-guides/CATALOG.md) have the rest of the ports.

Scenario 11 folders missing: run `./setup.sh` first. It generates the tree. I forget that every other workshop.

Scenario 08: victim Express and the mock both want :3000. Stop the mock before `npm start`. README already says it.

## Blue team

IOCs: `scenarios/<folder>/DETECT.md`. [01](../../scenarios/01-typosquatting/DETECT.md) is the template I point people at.

```bash
node detection-tools/package-scanner.js scenarios/01-typosquatting/victim-app --json
```

Elasticsearch notes: [DETECTION_AND_OBSERVABILITY.md](./DETECTION_AND_OBSERVABILITY.md).

Floci dummy org: `detection-tools/floci/cloud-context.sh 01` after `./infrastructure/floci/seed.sh`. Guide: [FLOCI_INTEGRATION.md](../guides/FLOCI_INTEGRATION.md).

`/_floci/ui` complaining about the container runtime is the optional console sidecar, not S3. `curl http://127.0.0.1:4566/_floci/health` is the check I care about. Recreate with `./scripts/floci/floci-down.sh && ./scripts/floci/floci-up.sh` after a compose change.

`scas-detections` 404 until the first document. Workshop `.scas.env` sets `SCAS_ES_URL`. Or ship after the fact: `node detection-tools/es/ship-captures.js`.

Kibana empty: `./scripts/observability/setup-kibana-data-views.sh`.

Smoke test complaining about scanner findings: 01 is subtle and can score zero. The script also runs `ship-captures.js`, so you need a capture file from a run that actually posted.

## Docs and license

Canonical tree is [`documentation/`](../README.md). [`docs/`](../../docs/) is Pages plus symlinks. Hub [index.md](../index.md). Catalog [CATALOG.md](../scenario-guides/CATALOG.md).

Raja Nagori, (c) 2024-2026. [AUTHORS.md](../../AUTHORS.md), [LEGAL.md](../../LEGAL.md). Keep the notices. [ATTRIBUTION.md](../../ATTRIBUTION.md) if someone "rebrands" the guides.

Software: [MIT](../../LICENSE). Docs: [CC BY-NC-ND 4.0](../../DOCUMENTATION-CC-BY-NC-ND.md).

[CONTRIBUTING.md](../../CONTRIBUTING.md) · [SECURITY.md](../../SECURITY.md) · [issues](https://github.com/RAJANAGORI/supply-chain-attack-simulator/issues)

Still stuck: README in the lab folder, then `ZERO_TO_HERO_SCENARIO_NN.md`, then teardown and retry. Issue text needs lab number, OS, and the error, not "it didn't work".
