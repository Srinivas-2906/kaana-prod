#!/usr/bin/env bash
# Create Google OAuth Web client for Kaana Tracker Sign-In.
# Usage: bash scripts/setup-google-signin.sh [PROJECT_ID]
set -euo pipefail

PROJECT="${1:-kaana-prod}"
ORIGINS=(
  "https://tracker.kaana.in"
  "http://localhost:5190"
)

echo "=== Kaana Tracker — Google Sign-In setup ==="
echo "Project: $PROJECT"
echo ""
echo "1. Open OAuth consent screen (once per project):"
echo "   https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT"
echo "   - User type: External (public signup) or Internal (@kaana.in only)"
echo "   - App name: Kaana Tracker"
echo ""
echo "2. Create OAuth client ID → Web application:"
echo "   https://console.cloud.google.com/apis/credentials?project=$PROJECT"
echo "   Name: Kaana Tracker Sign-In"
echo ""
echo "   Authorized JavaScript origins:"
for origin in "${ORIGINS[@]}"; do
  echo "     $origin"
done
echo ""
echo "   Authorized redirect URIs: (leave empty — Sign-In button uses ID token flow)"
echo ""
echo "3. Copy the Client ID into:"
echo "   kaana-tracker/.env              → VITE_GOOGLE_CLIENT_ID=..."
echo "   kaana-tracker-api/.env          → GOOGLE_CLIENT_ID=..."
echo "   cloudbuild.tracker.yaml         → _GOOGLE_CLIENT_ID: '...'"
echo ""
echo "4. Redeploy:"
echo "   gcloud builds submit --config cloudbuild.tracker.yaml --project $PROJECT ."
echo ""
echo "Existing users (including former Clerk/Google accounts) sign in by matching email."
