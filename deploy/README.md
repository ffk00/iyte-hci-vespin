# Deploy — Vespin production stack

Production runs on a single Hetzner VPS as a Docker Compose stack behind Caddy.
This directory is the source of truth for that stack; CI rsyncs it to the VPS on
deploy. For day-to-day local development you do **not** need anything here — use
[`../dev.sh`](../dev.sh) instead.

## Topology

```
internet → Caddy (:80/:443, TLS) → api (:8080) → postgres (internal only)
                                       ↑
                                   migrate (one-shot, runs before api)
```

Only Caddy is published to the host. `api` and `postgres` are reachable only on
the internal Docker network. Caddy obtains and renews Let's Encrypt certs
automatically (DuckDNS domain, HTTP-01 challenge — no DNS plugin needed).

## Files

| File | Purpose |
|---|---|
| `docker-compose.prod.yml` | The production stack (caddy, api, postgres, migrate). |
| `Caddyfile` | Reverse proxy, TLS, security headers. |
| `.env.example` | Template for the real `.env` (never commit the real one). |
| `backup.sh` | Nightly `pg_dump`, 7-day retention. Installed via cron on the VPS. |

## First-time setup (on the VPS)

```bash
# As the deploy user, in /home/deploy/vespin/
cp .env.example .env
chmod 600 .env
# Edit .env: DOMAIN, ACME_EMAIL, GHCR_OWNER, POSTGRES_PASSWORD, JWT_SECRET.
# Generate secrets: openssl rand -base64 32  (password) / -base64 64 (JWT).

docker login ghcr.io            # so the host can pull private images
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

## Deploys

Normally automatic: `.github/workflows/backend.yml` builds and pushes
`vespin-api` + `vespin-migrate` to GHCR, rsyncs this directory to the VPS, pulls,
and restarts the stack — gated by the `DEPLOY_ENABLED` repo variable (or a manual
`workflow_dispatch`). The `migrate` container runs to completion before `api`
starts, applying any new migrations. The job then probes `/healthz`.

Manual deploy (same commands the workflow runs):

```bash
cd /home/deploy/vespin
export IMAGE_TAG=<sha-or-latest>
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d --remove-orphans
```

## Backups & restore

`backup.sh` runs nightly via cron (see the header of that file for the crontab
line). To restore a dump:

```bash
gunzip -c backups/vespin-YYYY-MM-DD.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env exec -T postgres \
  psql -U vespin -d vespin
```

## Scope note

No Kubernetes, no Traefik/nginx — Caddy + Compose is the locked choice for this
HCI project. See the root [`CLAUDE.md`](../CLAUDE.md) for the full infra decisions.
