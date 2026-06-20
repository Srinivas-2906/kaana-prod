#!/usr/bin/env bash
# One-time GCP setup for Kaana CI/CD (Cloud Build + Cloud Run + Firebase Hosting)
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-kaana-prod}"
REGION="${REGION:-asia-south1}"
ARTIFACT_REPO="${ARTIFACT_REPO:-kaana}"
DB_BUCKET="${DB_BUCKET:-kaana-prod-db}"
API_SERVICE="${API_SERVICE:-kaana-api}"
RUN_SA="kaana-api-runner"
RUN_SA_EMAIL="${RUN_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
CB_SA="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')@cloudbuild.gserviceaccount.com"

echo "==> Using project: $PROJECT_ID (region: $REGION)"

gcloud config set project "$PROJECT_ID"

echo "==> Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  firebase.googleapis.com \
  firebasehosting.googleapis.com \
  --project="$PROJECT_ID"

echo "==> Creating Artifact Registry repo..."
gcloud artifacts repositories describe "$ARTIFACT_REPO" \
  --location="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || \
gcloud artifacts repositories create "$ARTIFACT_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Kaana container images"

echo "==> Creating GCS bucket for SQLite replication..."
gsutil ls -b "gs://${DB_BUCKET}" 2>/dev/null || \
gsutil mb -l "$REGION" -b on "gs://${DB_BUCKET}"

echo "==> Creating Cloud Run service account..."
gcloud iam service-accounts describe "$RUN_SA_EMAIL" --project="$PROJECT_ID" 2>/dev/null || \
gcloud iam service-accounts create "$RUN_SA" \
  --display-name="Kaana API Cloud Run"

gcloud storage buckets add-iam-policy-binding "gs://${DB_BUCKET}" \
  --member="serviceAccount:${RUN_SA_EMAIL}" \
  --role="roles/storage.objectAdmin" \
  --project="$PROJECT_ID" >/dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${RUN_SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None >/dev/null

echo "==> Granting Cloud Build permissions..."
for role in roles/run.admin roles/iam.serviceAccountUser roles/secretmanager.secretAccessor roles/firebase.admin; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${CB_SA}" \
    --role="$role" \
    --condition=None >/dev/null
done

echo "==> Creating Secret Manager placeholders (edit values in GCP console)..."
create_secret() {
  local name="$1"
  local value="$2"
  if gcloud secrets describe "$name" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "  secret exists: $name"
  else
    printf '%s' "$value" | gcloud secrets create "$name" --data-file=- --project="$PROJECT_ID"
    echo "  created: $name"
  fi
}

JWT_PLACEHOLDER="$(openssl rand -hex 32 2>/dev/null || echo 'change-me-generate-with-openssl-rand-hex-32')"
VERIFY_PLACEHOLDER="$(openssl rand -hex 16 2>/dev/null || echo 'change-me-verify-token')"

create_secret kaana-jwt-secret "$JWT_PLACEHOLDER"
create_secret kaana-whatsapp-access-token "REPLACE_WITH_META_TOKEN"
create_secret kaana-whatsapp-phone-id "REPLACE_WITH_PHONE_NUMBER_ID"
create_secret kaana-whatsapp-verify-token "$VERIFY_PLACEHOLDER"
create_secret kaana-admin-email "admin@kaana.ai"
create_secret kaana-admin-password "REPLACE_WITH_STRONG_PASSWORD"
create_secret kaana-razorpay-key-id "REPLACE_OR_LEAVE"
create_secret kaana-razorpay-key-secret "REPLACE_OR_LEAVE"
create_secret kaana-resend-api-key "REPLACE_OR_LEAVE"
create_secret kaana-resend-from "Kaana <onboarding@kaana.in>"
create_secret kaana-notify-email "you@example.com"

echo "==> Linking Firebase to GCP project..."
FB="firebase"
if ! command -v firebase >/dev/null 2>&1; then
  FB="npx --yes firebase-tools"
fi

if ! $FB projects:list 2>/dev/null | grep -q "$PROJECT_ID"; then
  $FB projects:addfirebase "$PROJECT_ID" || true
fi

echo "==> Creating Firebase Hosting sites..."
create_site() {
  local site="$1"
  if $FB hosting:sites:list --project "$PROJECT_ID" 2>/dev/null | grep -q "$site"; then
    echo "  site exists: $site"
  else
    $FB hosting:sites:create "$site" --project "$PROJECT_ID" || echo "  (create $site manually if needed)"
  fi
}

create_site kaana-prod-marketing
create_site kaana-prod-inbox
create_site kaana-prod-crm

echo ""
echo "==> Next: connect GitHub and create Cloud Build trigger"
echo ""
echo "1. Open: https://console.cloud.google.com/cloud-build/triggers?project=${PROJECT_ID}"
echo "2. Connect repository: Srinivas-2906/kaana-prod"
echo "3. Create trigger:"
echo "   - Event: Push to branch ^main$"
echo "   - Config: cloudbuild.yaml (repository root)"
echo ""
echo "4. After first deploy, update cloudbuild.yaml substitutions with real URLs:"
echo "   - Cloud Run URL from: gcloud run services describe ${API_SERVICE} --region ${REGION} --format='value(status.url)'"
echo "   - Firebase site URLs from Firebase console"
echo ""
echo "5. Fill Secret Manager values (Meta token, admin password, etc.)"
echo ""
echo "Done. Push to main on GitHub to deploy."
