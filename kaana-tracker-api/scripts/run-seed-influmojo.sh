#!/usr/bin/env bash
# Seed Influmojo on production Cloud SQL for navya-teja9@kaana.in
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROXY_BIN="${CLOUD_SQL_PROXY:-/tmp/cloud-sql-proxy}"
PROXY_PORT="${CLOUD_SQL_PROXY_PORT:-3307}"
INSTANCE="kaana-prod:asia-south1:kaana-tracker-mysql"
PASS_FILE="$(mktemp)"
PROXY_PID=""

cleanup() {
  if [[ -n "$PROXY_PID" ]]; then kill "$PROXY_PID" 2>/dev/null || true; fi
  rm -f "$PASS_FILE"
}
trap cleanup EXIT

if [[ ! -x "$PROXY_BIN" ]]; then
  ARCH="$(uname -m)"
  case "$ARCH" in
    arm64) PROXY_URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.3/cloud-sql-proxy.darwin.arm64" ;;
    x86_64) PROXY_URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.3/cloud-sql-proxy.darwin.amd64" ;;
    *) echo "Unsupported arch: $ARCH"; exit 1 ;;
  esac
  echo "Downloading cloud-sql-proxy…"
  curl -fsSL -o "$PROXY_BIN" "$PROXY_URL"
  chmod +x "$PROXY_BIN"
fi

gcloud secrets versions access latest --secret=kaana-tracker-db-password --project=kaana-prod > "$PASS_FILE"
pkill -f "cloud-sql-proxy.*${PROXY_PORT}" 2>/dev/null || true
"$PROXY_BIN" "$INSTANCE" --port "$PROXY_PORT" > /tmp/cloud-sql-proxy-seed.log 2>&1 &
PROXY_PID=$!

for i in {1..15}; do sleep 1; nc -z 127.0.0.1 "$PROXY_PORT" && break; done

export DB_HOST=127.0.0.1
export DB_PORT="$PROXY_PORT"
export DB_NAME=expense_tracker
export DB_PASS="$(tr -d '\n\r' < "$PASS_FILE")"

for DB_USER in tracker; do
  export DB_USER
  cd "$ROOT" && node scripts/seed-influmojo.mjs
  exit $?
done
