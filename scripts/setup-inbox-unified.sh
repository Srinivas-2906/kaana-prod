#!/usr/bin/env bash
# Point inbox.kaana.in at the unified botiq-app service (kaana-api).
set -euo pipefail
PROJECT_ID="${PROJECT_ID:-kaana-prod}"
URL_MAP="${URL_MAP:-kaana-web-map-multi}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

gcloud config set project "$PROJECT_ID"
gcloud compute url-maps import "$URL_MAP" \
  --source="$SCRIPT_DIR/url-map-multi.yaml" \
  --global \
  --quiet

echo "Done. inbox.kaana.in → kaana-api-backend (unified botiq-app)"
