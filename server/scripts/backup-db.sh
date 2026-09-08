#!/bin/bash
# ═══════════════════════════════════════════
# SHAPIO — Database Backup Script
# Run before any schema migration
# Usage: bash scripts/backup-db.sh
# ═══════════════════════════════════════════

set -euo pipefail

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep DIRECT_URL | xargs)
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="${BACKUP_DIR}/shapio_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up database to ${BACKUP_FILE}..."

# Extract connection parts from DIRECT_URL
# Format: postgresql://user:pass@host:port/dbname
DB_URL="${DIRECT_URL}"

pg_dump "$DB_URL" --no-owner --no-acl --clean --if-exists > "$BACKUP_FILE" 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Backup complete: ${BACKUP_FILE} ($(wc -c < "$BACKUP_FILE") bytes)"
else
  echo "❌ Backup failed!"
  exit 1
fi
