#!/bin/sh
set -e

mkdir -p /data
DB_PATH="${DATABASE_PATH:-/data/kaana.db}"

if [ -n "${LITESTREAM_BUCKET:-}" ]; then
  REPLICA_URL="gcs://${LITESTREAM_BUCKET}/kaana.db"

  # Restore snapshot if it exists.
  litestream restore -if-replica-exists -o "${DB_PATH}" "${REPLICA_URL}"

  # Replicate while running the API process.
  exec litestream replicate -exec "node /app/src/index.js" "${DB_PATH}" "${REPLICA_URL}"
fi

exec node /app/src/index.js
