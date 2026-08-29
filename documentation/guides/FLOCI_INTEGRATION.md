# Floci integration guide (SCAS)

> [Documentation](../index.md) › [Integration guides](./index.md) › Floci

Optional **local AWS emulator** for all 29 labs. [Floci](https://github.com/floci-io/floci) core on port **4566** (not floci-ui, which would fight the mocks on 3000-3029).

I used to ship this as "S3 mirror plus seven fancy labs." That hid most of the CLI. Seed now plants a dummy org on every scenario: S3 `org/`, IAM, STS, SSM, CloudWatch Logs, EventBridge, plus the services that actually match the attack. Lookalikes only. Nothing here is a real cloud account.

First-time install: [Full-stack setup](../getting-started/FULL_STACK_SETUP.md). Script catalog: [Tooling](../platform/TOOLING.md#floci-cloud-track-optional).

## Initial setup (required once)

```bash
cd supply-chain-attack-simulator
./scripts/floci/floci-setup.sh --image   # fast start
# or: ./scripts/floci/floci-setup.sh     # full source build
```

Creates `infrastructure/floci/`, `.floci.env` (`SCAS_FLOCI_ENABLED=1`), and Docker orchestration for `scas-floci` on `:4566`.

## Quick start (every lab session)

```bash
./scripts/floci/floci-up.sh && ./scripts/floci/floci-status.sh
source .testbench.env && source .floci.env
cd scenarios/NN-slug
./infrastructure/floci/seed.sh
# ... run normal README steps ...
./infrastructure/floci/verify.sh
../../detection-tools/floci/cloud-context.sh NN
../../detection-tools/floci/s3-exfil-check.sh NN
```

`cloud-context.sh` is the one command I want in the workshop notes. It walks STS, S3 prefixes, IAM, Secrets Manager, SSM, Logs, SQS, SNS, EventBridge, ECR, ECS, CodePipeline, Step Functions, and Glue for that lab id.

## Architecture

| Layer | Role |
|-------|------|
| Mock server (`:3000`-`:3029`) | Primary exfil - always runs |
| `floci-exfil.js` / `floci_exfil.py` | Opt-in dual-write when `SCAS_FLOCI_ENABLED=1` |
| `scripts/floci/floci-bridge.sh` | S3, ECR, Secrets, SQS, SNS, EventBridge, STS, ECS, IAM, CodePipeline, Step Functions, Glue, SSM, CloudWatch Logs |
| `scripts/floci/cloud-context-assets.py` | Pretend org JSON (`org/account.json`, `org/critical-assets.json`) |
| `scripts/floci/seed-story-extras.sh` | Per-lab queues, topics, pipelines, catalogs |
| `detection-tools/floci/cloud-context.sh` | Blue-team dump of the dummy org |

**Safety:** Cloud exfil targets `127.0.0.1:4566` only; gated by `TESTBENCH_MODE=enabled`.

Every `uploadJson()` also writes CloudWatch `/scas/scNN/exfil` and EventBridge `scas.exfil.put`.

## Shared components

| Path | Purpose |
|------|---------|
| `scripts/floci/floci-bridge.sh` | AWS emulator helpers + `scas_floci_seed_cloud_context` |
| `scenarios/_shared/generate-lookalike-secrets.py` | LAB-ONLY lookalike tokens (gitignored outputs) |
| `scenarios/_shared/ensure-lookalike-secrets.sh` | Create `lookalike-secrets.{env,json}` if missing |
| `scenarios/_shared/plant-lookalike-secrets.sh` | Victim `.npmrc` / `.env` fixtures (05, 06, 21, 23, 25) |
| `scenarios/_shared/LOOKALIKE_SECRETS.md` | How generated lookalikes work |
| `scripts/floci/floci-upload-json.sh` | JSON → S3 `exfil/` + Logs + EventBridge |
| `detection-tools/floci/s3-exfil-check.sh` | S3 exfil detector (all scenarios) |
| `detection-tools/floci/cloud-context.sh` | Full org dump (all scenarios) |
| `detection-tools/floci/ecr-check.sh` | ECR images (11, 14, 23) |
| `detection-tools/floci/stage-chain-check.sh` | S3 kill-chain markers (17) |
| `detection-tools/floci/eventbridge-chain-check.sh` | EventBridge + chain (17) |
| `detection-tools/floci/secrets-check.sh` | Named Secrets Manager check |
| `detection-tools/floci/cloudtrail-hunt.sh` | STS / S3 / ECR hunt (05, 23, 25) |
| `detection-tools/floci/pipeline-artifact-check.sh` | CodePipeline (23, 25) |

**Buckets:** `scas-sc01-artifacts` ... `scas-sc29-artifacts`

## What every lab gets

`seed.sh` calls `scas_floci_seed_scenario`, which now plants:

- S3 `org/account.json`, `org/inventory.json`, `org/critical-assets.json`, `org/sts-caller.json`
- IAM role `scas-scNN-workload-role`
- SSM `/scas/scNN/lab-mode=testbench`
- CloudWatch `/scas/scNN/lab`
- EventBridge `scas.lab.seeded`
- Story-shaped Secrets Manager / SSM lookalikes (npm, GitHub, docker, Stripe, Slack, PyPI, OpenAI, HF, as the lab needs)

Then extras that match the attack (SQS, SNS, ECR, ECS, CodePipeline, Step Functions, Glue). Scenario `FLOCI.md` names the decoys.

## Scenario matrix

| # | Story | Floci services beyond the common org |
|---|-------|--------------------------------------|
| 01 | Typosquatting | SNS registry-alerts, dummy customer CSV, npm token |
| 02 | Dependency confusion | SQS dep-resolve, SSM `@corp` scope |
| 03 | Compromised package | Stripe decoy, dummy payroll object |
| 04 | Malicious update | SNS update-alerts, EventBridge package.update |
| 05 | Build compromise | IAM CodeBuild role, SSM database URL, Logs `/scas/sc05/build` |
| 06 | Shai-Hulud | SM harvest trio, SQS/SNS/EventBridge worm fan-out |
| 07 | Transitive dep | SSM expected-tree-hash |
| 08 | Lockfile | SSM lock integrity, expected lock object |
| 09 | Signing bypass | Publisher IAM + signing secret |
| 10 | Git submodule | GitHub PAT, canonical submodule URL |
| 11 | Registry mirror | ECR + docker pull secret |
| 12 | Monorepo | SQS workspace-build |
| 13 | Metadata | SSM packument snapshot |
| 14 | Container image | ECR, ECS cluster/task, docker pull secret |
| 15 | Dev tool | Slack + GitHub decoys |
| 16 | Cache poison | S3 `cache/`, SSM cache-root |
| 17 | Multi-stage | Step Functions, EventBridge, stage1 npm token |
| 18 | Plugin | EventBridge plugin.loaded |
| 19 | SBOM | Glue `scas_sc19_sbom`, truth vs sbom prefixes |
| 20 | Version confusion | SSM canonical-version, EventBridge |
| 21 | Axios postinstall | SM ci-aws + npm (victim `.env` planted) |
| 22 | LiteLLM / PyPI | PyPI token, OpenAI decoy, extra-index SSM |
| 23 | Trivy capstone | ECR, CodePipeline, IAM/STS, GitHub PAT, docker PAT |
| 24 | Slopsquatting | Catalog 404 object, SSM allowlist, EventBridge catalog.miss |
| 25 | Reusable GHA | CodePipeline, GHA IAM, GitHub PAT (`.env.ci-lab`) |
| 26 | Malicious MCP | OpenAI/GitHub/AWS SM matching `dummy.env`, MCP allowlist SSM |
| 27 | Provenance bypass | Unsigned attestation object, trusted-issuer SSM, publisher IAM |
| 28 | Go module / GOPROXY | SSM GOPROXY, S3 `modules/`, EventBridge module.fetch |
| 29 | HF-style model | Glue `scas_sc29_models`, `models/revision.txt`, HF token |

Template lab: `scenarios/01-typosquatting/FLOCI.md`. Per-lab decoy names live in that folder's `FLOCI.md`.

## Port conflicts

SCAS runs `scas-floci` on 4566 only. Mock servers use 3000-3029. Do not bind floci-ui to those mock ports.

`/_floci/ui` starts a sidecar via docker.sock. Seed, verify, and `cloud-context.sh` do not. If the UI page says `BindException: Permission denied`, curl health first:

```bash
curl -sS http://127.0.0.1:4566/_floci/health
```

Compose mounts the socket with `:z` and adds the socket GID so uid 1001 can talk to Docker. Recreate the container after pulling this change (`floci-down` then `floci-up`). Still stuck on Podman/SELinux: `FLOCI_SELINUX_DISABLE=1` in `infrastructure/floci/.env`.

## Scripts reference

| Script | Purpose |
|--------|---------|
| `scripts/floci/floci-setup.sh` | Install Floci (`--image` for fast start) |
| `scripts/floci/floci-up.sh` / `floci-down.sh` / `floci-status.sh` | Lifecycle |
| `scripts/floci/floci-bridge.sh` | Shared AWS helpers |
| `scenarios/NN-*/infrastructure/floci/seed.sh` | Per-scenario baseline + org |
| `scenarios/NN-*/infrastructure/floci/verify.sh` | Blue-team evidence (starts with `cloud-context.sh`) |
| `detection-tools/floci/cloud-context.sh` | Dump every Floci service for that id |

## Related

- [Integration guides index](./index.md)
- [Operations](../platform/OPERATIONS.md) · [Scenario catalog](../scenario-guides/CATALOG.md)
- [↑ Documentation index](../index.md)
