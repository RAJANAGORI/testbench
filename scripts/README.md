# SCAS scripts

Canonical layout (run from repo root):

| Folder | Purpose | Entry points |
|--------|---------|--------------|
| `setup/` | Lab bootstrap / teardown / ports | `./scripts/setup/setup.sh`, `teardown.sh`, `kill-port.sh` |
| `observability/` | Elasticsearch + Kibana helpers | `./scripts/observability/elasticsearch-up.sh` |
| `floci/` | LocalStack / Floci cloud track | `./scripts/floci/floci-up.sh`, `floci-bridge.sh` |
| `diagrams/` | Diagram generators + harness | `node scripts/diagrams/check-diagram-assets.js` |
| `docs/` | Doc injectors / Pages materialize / consistency | `node scripts/docs/check-info-consistency.js` |
| `smoke/` | End-to-end smoke | `./scripts/smoke/smoke-all-scenarios.sh` |
| `ui/` | Control Center launcher | `./scripts/ui/start-dashboard.sh` |
| `provenance/` | Provenance embed / verify | `./scripts/provenance/verify-provenance.sh` |
| `lib/` | Shared Node libraries | `diagram-specs.js`, `mitigation-playbooks.js`, … |

Ports allow-list: [`setup/ports.env`](setup/ports.env).
