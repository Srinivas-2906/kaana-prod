#!/usr/bin/env bash
# One-time setup: Gmail send for Kaana Tracker invites (Google Workspace domain-wide delegation).
set -euo pipefail

PROJECT="${GCP_PROJECT:-kaana-prod}"
SA_NAME="kaana-tracker-gmail"
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
SECRET_NAME="kaana-tracker-gmail-sa"
KEY_FILE="$(mktemp /tmp/kaana-tracker-gmail-key.XXXXXX.json)"

echo "Project: $PROJECT"
echo "Service account: $SA_EMAIL"

gcloud services enable gmail.googleapis.com --project="$PROJECT"

if ! gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="Kaana Tracker Gmail send" \
    --project="$PROJECT"
fi

CLIENT_ID="$(gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT" --format='value(oauth2ClientId)')"
echo "OAuth client ID (for Google Admin): $CLIENT_ID"

gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="$SA_EMAIL" \
  --project="$PROJECT"

if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud secrets versions add "$SECRET_NAME" --data-file="$KEY_FILE" --project="$PROJECT"
else
  gcloud secrets create "$SECRET_NAME" --data-file="$KEY_FILE" --project="$PROJECT"
fi

RUNNER_SA="$(gcloud run services describe kaana-tracker-api --region asia-south1 --project="$PROJECT" --format='value(spec.template.spec.serviceAccountName)' 2>/dev/null || true)"
RUNNER_SA="${RUNNER_SA:-kaana-api-runner@${PROJECT}.iam.gserviceaccount.com}"

gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
  --project="$PROJECT" \
  --member="serviceAccount:${RUNNER_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

rm -f "$KEY_FILE"

cat <<EOF

=== Google Workspace admin step (required once) ===

1. Open https://admin.google.com → Security → Access and data control → API controls
2. Manage Domain Wide Delegation → Add new
3. Client ID: $CLIENT_ID
4. OAuth scopes: https://www.googleapis.com/auth/gmail.send
5. Authorize

Then deploy tracker API (cloudbuild.tracker.yaml mounts secret as GMAIL_SERVICE_ACCOUNT_JSON).

Invites will send FROM the logged-in user's @kaana.in address (e.g. navya-teja9@kaana.in).

EOF
