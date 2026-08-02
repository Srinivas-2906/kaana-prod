#!/usr/bin/env bash
# Verify Meta webhook GET handshake against Kaana API.
# Usage:
#   ./scripts/verify-webhook.sh                          # localhost:3002
#   ./scripts/verify-webhook.sh https://api.kaana.in     # production
#   WHATSAPP_VERIFY_TOKEN=secret ./scripts/verify-webhook.sh <url>

set -euo pipefail

BASE_URL="${1:-http://localhost:3002}"
BASE_URL="${BASE_URL%/}"
VERIFY_TOKEN="${WHATSAPP_VERIFY_TOKEN:-propbot_verify_token}"
CHALLENGE="kaana_verify_$(date +%s)"

echo "→ Base URL:      $BASE_URL"
echo "→ Verify token:  ${VERIFY_TOKEN:0:4}**** (set WHATSAPP_VERIFY_TOKEN to override)"
echo ""

echo "1) Health check"
HEALTH=$(curl -sS -m 15 "${BASE_URL}/health" || true)
if echo "$HEALTH" | grep -q '"ok":true'; then
  echo "   ✅ /health OK — $HEALTH"
else
  echo "   ❌ /health failed — is the API running? Got: ${HEALTH:0:120}"
  exit 1
fi

echo ""
echo "2) Webhook GET verify (Meta subscribe handshake)"
RESP=$(curl -sS -m 15 \
  "${BASE_URL}/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${CHALLENGE}" || true)

if [ "$RESP" = "$CHALLENGE" ]; then
  echo "   ✅ Webhook verify OK — challenge echoed"
else
  echo "   ❌ Webhook verify FAILED"
  echo "   Expected challenge: $CHALLENGE"
  echo "   Got: ${RESP:0:200}"
  echo ""
  echo "   Fix: WHATSAPP_VERIFY_TOKEN on server must match Meta Developer Console."
  exit 1
fi

echo ""
echo "3) Meta token (optional — requires .env with WHATSAPP_ACCESS_TOKEN)"
if [ -f .env ]; then
  if npm run test-token 2>/dev/null; then
    echo "   ✅ Meta token valid"
  else
    echo "   ⚠️  Meta token check failed — refresh token before live WhatsApp"
    echo "      npm run test-token"
  fi
else
  echo "   ⏭  Skipped (no .env in cwd)"
fi

echo ""
echo "Done. Next: Meta Developer Console → WhatsApp → Configuration"
echo "  Callback URL: ${BASE_URL}/webhook"
echo "  Verify token: (same as WHATSAPP_VERIFY_TOKEN on server)"
echo "  Subscribe:    messages"
