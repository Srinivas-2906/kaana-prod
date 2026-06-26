#!/usr/bin/env bash
# Simulate a full WhatsApp dental booking locally → check clinic dashboard Today tab
set -euo pipefail

API="${API:-http://localhost:3002/api}"
SLUG="${SLUG:-denta-care}"
PHONE="${PHONE:-919998887766}"

send() {
  local msg="$1"
  echo "→ $msg"
  curl -s -X POST "$API/demo/whatsapp" \
    -H 'Content-Type: application/json' \
    -d "{\"tenantSlug\":\"$SLUG\",\"phone\":\"$PHONE\",\"message\":\"$msg\"}" | jq -r '.ok // .error // .'
  sleep 0.5
}

echo "Testing clinic WhatsApp flow (tenant=$SLUG phone=$PHONE)"
echo ""

send "hi"
send "📅 Book appointment"
send "🦷 Tooth pain"
send "Test Patient Local"
send "Tomorrow"
send "10:00 AM"

echo ""
echo "Done. Open http://localhost:5185 and sign in with demo@dentacare.in / demo1234"
