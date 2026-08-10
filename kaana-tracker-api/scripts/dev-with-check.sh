#!/usr/bin/env bash
# Quick check before starting tracker API locally
set -euo pipefail

if ! mysql -h "${DB_HOST:-127.0.0.1}" -u "${DB_USER:-root}" "${DB_NAME:-expense_tracker}" -e "SELECT 1" >/dev/null 2>&1; then
  echo "MySQL is not reachable. Start MySQL, then run: npm run dev"
  echo "  DB_HOST=${DB_HOST:-127.0.0.1} DB_USER=${DB_USER:-root} DB_NAME=${DB_NAME:-expense_tracker}"
  exit 1
fi

echo "MySQL OK — starting Kaana Tracker API on port ${PORT:-3011}"
exec node --watch src/index.js
