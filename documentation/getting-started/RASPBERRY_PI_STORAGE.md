# Raspberry Pi + external disk storage

> [Documentation](../index.md) › [Getting started](./index.md) › Raspberry Pi storage

Run SCAS on a Pi without filling the SD card: put **Docker** (images, containers, volumes) and optionally the **repo / npm cache** on a USB HDD/SSD.

## Why

Elasticsearch, Kibana, and Floci images are multi‑GB. On a Pi, keeping Docker’s data-root on the SD card is slow and wears the card. Point Docker at the attached disk instead.

## One-time setup (on the Pi)

1. Mount the disk (example path):

   `/run/media/rajanagori/a0a6fb60-8114-4e3b-a274-aa1139667b7b`

2. From the SCAS repo:

```bash
chmod +x scripts/setup-external-storage.sh
./scripts/setup-external-storage.sh \
  /run/media/rajanagori/a0a6fb60-8114-4e3b-a274-aa1139667b7b \
  --persist-mount \
  --move-repo
```

| Flag | Effect |
|------|--------|
| `--persist-mount` | Mount disk at `/mnt/scas-data` via systemd (survives reboot; Docker waits for it) |
| `--move-repo` | Copy this repo to `<disk>/scas/repo/…` and optionally symlink `~/supply-chain-attack-simulator` |
| `--clone-repo` | Fresh `git clone` onto the disk |
| `--docker-only` | Only relocate Docker data-root |
| `-y` | Non-interactive yes |

3. Confirm:

```bash
docker info | grep 'Docker Root Dir'
# expect: …/scas/docker
```

4. Install the stack from the HDD copy:

```bash
cd ~/supply-chain-attack-simulator   # symlink or HDD path
source /mnt/scas-data/scas/scas-storage.env   # if using --persist-mount
./install.sh
```

## Layout created

```
<disk-or-/mnt/scas-data>/scas/
├── docker/          # Docker data-root (images, containers, volumes)
├── npm-cache/       # npm cache (less SD wear)
├── logs/
├── repo/supply-chain-attack-simulator/   # optional
└── scas-storage.env
```

## Notes

- `/run/media/...` mounts are often **temporary** — use `--persist-mount`.
- After moving Docker, old data may remain in `/var/lib/docker.bak.scas.*` until you delete it.
- Full stack (ES + Kibana + Floci) still wants **plenty of RAM** (swap on the HDD helps if you add a swapfile there).
- Do not commit host passwords or disk UUIDs into the repo.

## Related

- [Full-stack setup](./FULL_STACK_SETUP.md)
- [`scripts/setup-external-storage.sh`](../../scripts/setup-external-storage.sh)
