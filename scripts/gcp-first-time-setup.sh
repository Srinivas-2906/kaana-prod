#!/usr/bin/env bash
# One-time GCP setup for Kaana Next.js site (Cloud Build → Cloud Run)
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-kaana-prod}"
REGION="${REGION:-asia-south1}"
ARTIFACT_REPO="${ARTIFACT_REPO:-kaana}"
SERVICE="${SERVICE:-kaana-web}"
CB_SA="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')@cloudbuild.gserviceaccount.com"

echo "==> Using project: $PROJECT_ID (region: $REGION)"

gcloud config set project "$PROJECT_ID"

echo "==> Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project="$PROJECT_ID"

echo "==> Creating Artifact Registry repo..."
gcloud artifacts repositories describe "$ARTIFACT_REPO" \
  --location="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || \
gcloud artifacts repositories create "$ARTIFACT_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Kaana container images"

echo "==> Granting Cloud Build permissions..."
for role in roles/run.admin roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${CB_SA}" \
    --role="$role" \
    --condition=None >/dev/null
done

echo ""
echo "==> Next: connect GitHub and create Cloud Build trigger"
echo ""
echo "1. Open: https://console.cloud.google.com/cloud-build/triggers?project=${PROJECT_ID}"
echo "2. Connect repository: Srinivas-2906/kaana-prod"
echo "3. Create trigger:"
echo "   - Event: Push to branch ^main$"
echo "   - Config: cloudbuild.yaml (repository root)"
echo ""
echo "4. After first deploy, get your live URL:"
echo "   gcloud run services describe ${SERVICE} --region ${REGION} --format='value(status.url)'"
echo ""
echo "5. Optional: map custom domain kaana.in in Cloud Run → Manage custom domains"
echo ""
echo "Done. Push to main on GitHub to deploy."
