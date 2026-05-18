#!/usr/bin/env bash
#
# Nightly Postgres backup script.
#
# Runs `pg_dump` inside the postgres container and writes a compressed dump to
# /home/deploy/vespin/backups/. Keeps the last 7 daily backups; older files
# are deleted.
#
# Install on the VPS:
#   1. Place this file at /home/deploy/vespin/backup.sh
#   2. chmod +x /home/deploy/vespin/backup.sh
#   3. Add to crontab (`crontab -e` as the deploy user):
#        0 3 * * * /home/deploy/vespin/backup.sh >> /home/deploy/vespin/backups/backup.log 2>&1
#      This runs every day at 03:00 server time.
#
# Restore example:
#   gunzip -c backups/vespin-2026-05-15.sql.gz | \
#     docker compose -f docker-compose.prod.yml exec -T postgres \
#     psql -U vespin -d vespin

set -euo pipefail

BACKUP_DIR="/home/deploy/vespin/backups"
KEEP_DAYS=7
TIMESTAMP=$(date +%F)   # YYYY-MM-DD
BACKUP_FILE="${BACKUP_DIR}/vespin-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -Iseconds)] Starting backup → ${BACKUP_FILE}"

# Run pg_dump inside the running postgres container.
# --clean and --if-exists make the dump safely restorable over an existing DB.
docker compose -f /home/deploy/vespin/docker-compose.prod.yml \
    --env-file /home/deploy/vespin/.env \
    exec -T postgres \
    pg_dump -U vespin -d vespin --clean --if-exists \
    | gzip > "${BACKUP_FILE}"

# Delete backups older than KEEP_DAYS.
find "${BACKUP_DIR}" -name 'vespin-*.sql.gz' -mtime "+${KEEP_DAYS}" -delete

echo "[$(date -Iseconds)] Backup complete. Current backups:"
ls -lh "${BACKUP_DIR}"/vespin-*.sql.gz 2>/dev/null || echo "  (none)"
