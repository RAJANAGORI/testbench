# SCAS Floci orchestration

Local AWS emulator on `:4566` for the optional cloud track. All 29 labs can seed a dummy org; see `documentation/guides/FLOCI_INTEGRATION.md`.

## One-time setup

```bash
# From repo root - clones github.com/floci-io/floci → vendor/floci-aws and builds Docker image
./scripts/floci/floci-setup.sh

# Fast path (no clone, no Java build - uses published image)
./scripts/floci/floci-setup.sh --image
```

## Daily use

```bash
./scripts/floci/floci-up.sh          # start scas-floci on :4566
source .floci.env              # SCAS_FLOCI_ENABLED=1 + AWS endpoint vars
./scripts/floci/floci-status.sh      # health check
./scripts/floci/floci-down.sh        # stop
```

Dump one lab: `detection-tools/floci/cloud-context.sh 01`

Labs use `/_floci/health` and the AWS API. `/_floci/ui` is a second container. If that page says BindException / Permission denied, the emulator can still be fine. Recreate after a compose change: `./scripts/floci/floci-down.sh && ./scripts/floci/floci-up.sh`. Podman + SELinux last resort: `FLOCI_SELINUX_DISABLE=1` in `infrastructure/floci/.env`.

## Layout

| Path | Purpose |
|------|---------|
| `vendor/floci-aws/` | Git clone of [floci-io/floci](https://github.com/floci-io/floci) (gitignored) |
| `docker-compose.yml` | Build from vendor |
| `docker-compose.image.yml` | Published `floci/floci:latest-compat` |
| `data/` | Persistent emulator state |
| `init/ready.d/` | Optional boot hooks (AWS CLI seed scripts) |
