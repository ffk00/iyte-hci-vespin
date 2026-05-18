# Vespin Retro Companion — Deployment

This directory contains everything needed to deploy and operate the API on a
Hetzner VPS.

## Architecture

```
                          ┌───────────────────────┐
internet ── :80/:443 ───→│ Caddy (TLS terminator)│
                          └──────────┬────────────┘
                                     │
                              api:8080 (docker network)
                                     │
                          ┌──────────▼────────────┐
                          │ Go API (vespin-api)  │
                          └──────────┬────────────┘
                                     │
                            postgres:5432 (docker network)
                                     │
                          ┌──────────▼────────────┐
                          │   Postgres 16         │
                          │   (volume: pg-data)   │
                          └───────────────────────┘
```

Caddy handles TLS via Let's Encrypt automatically. The API and Postgres are
only reachable inside the Docker network — neither is exposed to the host.

## One-time VPS setup

These steps are done **once**, by hand, on a fresh Hetzner VPS. All subsequent
deploys are automated via GitHub Actions.

### 1. Provision the VPS

A Hetzner CX11 (or equivalent) is more than enough for this scope. Ubuntu 24.04 LTS.

### 2. Create the deploy user

SSH in as root, then:

```bash
adduser deploy
usermod -aG sudo deploy
# Add your SSH public key:
mkdir -p /home/deploy/.ssh
# (paste key into /home/deploy/.ssh/authorized_keys)
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Confirm you can SSH in as `deploy` from your machine. Then disable root SSH:

```bash
# In /etc/ssh/sshd_config:
PermitRootLogin no
PasswordAuthentication no
systemctl restart ssh
```

### 3. Install Docker

```bash
# As the deploy user, with sudo:
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy
# Log out and back in for the group change to take effect.
docker --version
docker compose version
```

### 4. Configure DuckDNS

Sign up at https://www.duckdns.org and create a subdomain (e.g.,
`vespin-api.duckdns.org`). Get your token from the DuckDNS dashboard.

Point the subdomain at your VPS's public IPv4:

```bash
# Quick one-shot update:
curl "https://www.duckdns.org/update?domains=vespin-api&token=YOUR_TOKEN&ip="
```

For automatic updates (in case Hetzner ever changes your IP), add a cron entry:

```bash
crontab -e
# Add:
*/5 * * * * curl -s "https://www.duckdns.org/update?domains=vespin-api&token=YOUR_TOKEN&ip=" > /dev/null
```

Verify DNS resolves:

```bash
dig +short vespin-api.duckdns.org
# Should return your VPS IP.
```

### 5. Configure firewall

Hetzner has a cloud firewall, or you can use UFW on the VPS itself:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp   # HTTP/3
sudo ufw enable
```

Note: do **not** open 5432 or 8080 — Postgres and the API are not exposed to
the host network.

### 6. Authenticate to GHCR

The VPS pulls images from GitHub Container Registry. Generate a Personal
Access Token (classic) with `read:packages` scope at
https://github.com/settings/tokens, then:

```bash
echo "YOUR_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Credentials are stored in `~/.docker/config.json` and persist across reboots.

### 7. Place deployment files

```bash
mkdir -p /home/deploy/vespin
cd /home/deploy/vespin
# Copy these files from the repo's deploy/ directory:
#   - docker-compose.prod.yml
#   - Caddyfile
#   - backup.sh
#   - .env.example   →  rename to .env and fill in real values
```

The easiest way is to clone the repo (read-only is fine), then symlink or copy:

```bash
git clone https://github.com/YOUR_HANDLE/vespin.git /tmp/vespin-repo
cp /tmp/vespin-repo/deploy/docker-compose.prod.yml .
cp /tmp/vespin-repo/deploy/Caddyfile .
cp /tmp/vespin-repo/deploy/backup.sh .
cp /tmp/vespin-repo/deploy/.env.example .env
chmod +x backup.sh
chmod 600 .env
```

Edit `.env` with real secrets. Generate strong values:

```bash
openssl rand -base64 32   # for POSTGRES_PASSWORD
openssl rand -base64 64   # for JWT_SECRET
```

### 8. First deploy (manual)

The first deploy is manual because there are no images in GHCR yet. Push a
commit to `main` in the repo first to trigger CI and publish the initial
images. Then on the VPS:

```bash
cd /home/deploy/vespin
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Watch the logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Caddy will obtain a Let's Encrypt certificate on first request. Test:

```bash
curl https://vespin-api.duckdns.org/healthz
```

### 9. Set up nightly backups

```bash
crontab -e
# Add:
0 3 * * * /home/deploy/vespin/backup.sh >> /home/deploy/vespin/backups/backup.log 2>&1
```

This runs `pg_dump` every night at 03:00 server time and keeps the last 7
daily snapshots.

## Routine operations

### Deploying a new version

This is automated via `.github/workflows/backend.yml`. On a push to `main`:

1. CI builds the `vespin-api` and `vespin-migrate` images and pushes them
   to GHCR with two tags: `latest` and the commit SHA.
2. CI SSHes into the VPS as `deploy` and runs:

   ```bash
   cd /home/deploy/vespin
   docker compose -f docker-compose.prod.yml --env-file .env pull
   docker compose -f docker-compose.prod.yml --env-file .env up -d
   ```

3. The `migrate` container runs migrations and exits.
4. The new `api` container starts.
5. Caddy continues running with no downtime.

### Manual deploy (if needed)

```bash
cd /home/deploy/vespin
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### Rolling back

Each image is tagged with its commit SHA. To roll back:

```bash
# Edit .env and set IMAGE_TAG=<previous-sha>, then:
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### Viewing logs

```bash
# All services:
docker compose -f docker-compose.prod.yml logs -f

# Just the API:
docker compose -f docker-compose.prod.yml logs -f api

# Last 100 lines from Caddy (e.g., debugging TLS issues):
docker compose -f docker-compose.prod.yml logs --tail=100 caddy
```

### Restoring from a backup

```bash
# List available backups:
ls -lh /home/deploy/vespin/backups/

# Restore (this overwrites the current database!):
gunzip -c /home/deploy/vespin/backups/vespin-2026-05-15.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env exec -T postgres \
  psql -U vespin -d vespin
```

### Postgres shell

```bash
docker compose -f docker-compose.prod.yml --env-file .env exec postgres \
  psql -U vespin -d vespin
```

### Tearing down everything

⚠️ **Destructive.** This removes containers and volumes (database data is lost).

```bash
docker compose -f docker-compose.prod.yml --env-file .env down -v
```

## Troubleshooting

**Caddy can't get a certificate.** Check that DNS for the domain points to
the VPS, ports 80 and 443 are open in the firewall, and check Caddy logs:
`docker compose logs caddy`. Let's Encrypt has a rate limit on duplicate
failed challenges — if you hit it, switch to the staging CA (commented in
`Caddyfile`) until you've fixed the issue.

**Migration container fails on startup.** Inspect:
`docker compose logs migrate`. Most common cause: a migration file references
a column or table that doesn't exist. Never edit a committed migration —
always add a new one to fix the state.

**API can't reach Postgres.** Both containers must be on the same Docker
network. `docker compose -f docker-compose.prod.yml --env-file .env ps`
shows their network status. Check the API logs for the actual connection
error.

**Out of disk.** Most likely culprit: old Docker images. Clean up:
`docker system prune -a` (keeps running containers and their images).
