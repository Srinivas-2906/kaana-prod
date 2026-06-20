#!/bin/sh
set -e

mkdir -p /data
DB_PATH="${DATABASE_PATH:-/data/kaana.db}"

if [ -n "$LITESTREAM_BUCKET" ]; then
  cat > /tmp/litestream.yml <<EOF
dbs:
  - path: ${DB_PATH}
    replicas:
      - type: gcs
        bucket: ${LITESTREAM_BUCKET}
        path: kaana.db
EOF

  litestream restore -if-replica-exists -config /tmp/litestream.yml
  exec litestream replicate -config /tmp/litestream.yml -exec "node /app/src/index.js"
fi

exec node /app/src/index.js
