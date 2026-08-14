# Raspberry Pi + external disk storage

> [Documentation](../index.md) › [Getting started](./index.md) › Raspberry Pi storage

**Optional path** for hosts with a USB HDD/SSD (e.g. Raspberry Pi). Most users should ignore this and use the generic installer:

```bash
./install.sh -y
```

## Two installers (do not mix concerns)

| Script | Who | What |
|--------|-----|------|
| [`install.sh`](../../install.sh) | Everyone / workshops | Generic full stack (prereqs, npm, ES/Kibana, Floci) |
| [`install-external.sh`](../../install-external.sh) | External-disk hosts only | Step 1: move Docker/repo onto the disk · Step 2: call `install.sh` |

Low-level storage helper (no SCAS stack): [`scripts/setup/setup-external-storage.sh`](../../scripts/setup/setup-external-storage.sh).

## One-shot on an external disk

```bash
chmod +x install-external.sh
./install-external.sh /run/media/$USER/<disk-uuid-or-label> -y
```

Example:

```bash
./install-external.sh /run/media/rajanagori/a0a6fb60-8114-4e3b-a274-aa1139667b7b -y
```

This:

1. Mounts the disk persistently at `/mnt/scas-data` (systemd)
2. Sets Docker `data-root` to `/mnt/scas-data/scas/docker`
3. Puts npm cache + a repo copy on the disk
4. Runs generic `./install.sh -y`

### Storage already configured

```bash
./install-external.sh --skip-storage -y
# same as:
./install.sh -y
```

### Storage only (no ES/Floci yet)

```bash
./scripts/setup/setup-external-storage.sh /run/media/$USER/<disk> --persist-mount --move-repo
```

## Layout

```
/mnt/scas-data/scas/          # after --persist-mount
├── docker/                   # Docker data-root
├── npm-cache/
├── logs/
├── repo/supply-chain-attack-simulator/
└── scas-storage.env
```

## Notes

- `/run/media/...` mounts are often temporary - `install-external.sh` uses `--persist-mount` by default.
- Full stack still needs enough **RAM** (ES + Kibana + Floci); the disk only fixes space/SD wear.
- Do not put disk paths or host credentials in the repo.

## Floci on Raspberry Pi 4 (Cortex-A72)

Published `floci/floci:*` images are **GraalVM native** binaries that require **ARM LSE** (`atomics` in `/proc/cpuinfo`).

| Board | LSE? | Floci path |
|-------|------|------------|
| Pi 4 (Cortex-A72) | No | JVM source build: `./scripts/floci/floci-setup.sh --auto` then `./scripts/floci/floci-up.sh` |
| Pi 5 | Yes | Published image OK (`--image` / UI Setup) |
| amd64 / Apple Silicon | Yes | Published image OK |

UI **Setup** already uses `--auto`. If you previously ran Setup with `--image` on a Pi 4, re-run Setup (or `./scripts/floci/floci-setup.sh --auto`) so `FLOCI_USE_IMAGE=0` and the JVM image is built - first build is slow.

## Related

- [Full-stack setup](./FULL_STACK_SETUP.md) (generic `./install.sh`)
