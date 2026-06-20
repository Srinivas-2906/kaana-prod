#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

require() {
  if [ -z "${!1:-}" ]; then
    echo "Missing required env var: $1" >&2
    exit 1
  fi
}

require VITE_API_URL
require VITE_BOTIQ_URL
require VITE_CRM_URL
require VITE_LISTINGS_URL
require VITE_WHATSAPP_LINK
require VITE_WHATSAPP_API
require VITE_PLATFORM_URL

write_env() {
  local dir="$1"
  cat > "$dir/.env.production" <<EOF
VITE_API_URL=${VITE_API_URL}
VITE_BILLING_URL=${VITE_BILLING_URL:-${VITE_API_URL%/platform}/billing}
VITE_BOTIQ_URL=${VITE_BOTIQ_URL}
VITE_CRM_URL=${VITE_CRM_URL}
VITE_LISTINGS_URL=${VITE_LISTINGS_URL}
VITE_WHATSAPP_LINK=${VITE_WHATSAPP_LINK}
VITE_WHATSAPP_API=${VITE_WHATSAPP_API}
VITE_PLATFORM_URL=${VITE_PLATFORM_URL}
EOF
}

write_env kaana-platform
write_env botiq
write_env propcrm

for app in kaana-platform botiq propcrm; do
  echo "Building ${app}..."
  (cd "$app" && npm ci && npm run build)
done

echo "Frontend builds complete."
