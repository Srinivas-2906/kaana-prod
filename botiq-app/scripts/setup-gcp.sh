#!/usr/bin/env bash
# One-time GCP setup for botiq-app (Postgres + secrets + deploy)
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-kaana-prod}"
REGION="${REGION:-asia-south1}"
INSTANCE="${INSTANCE:-botiq-pg}"
DB_NAME="${DB_NAME:-botiq}"
DB_USER="${DB_USER:-botiq}"
SECRET_NAME="${SECRET_NAME:-kaana-database-url}"
ROOT_PASS="${ROOT_PASS:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)}"

echo "==> Project: $PROJECT_ID | Region: $REGION | Instance: $INSTANCE"

gcloud config set project "$PROJECT_ID"

echo "==> Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  --project="$PROJECT_ID"

echo "==> Creating Cloud SQL Postgres (if missing)..."
if ! gcloud sql instances describe "$INSTANCE" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud sql instances create "$INSTANCE" \
    --database-version=POSTGRES_16 \
    --edition=enterprise \
    --tier=db-f1-micro \
    --region="$REGION" \
    --storage-auto-increase \
    --project="$PROJECT_ID"
  echo "    Waiting for instance to be ready..."
  gcloud sql instances describe "$INSTANCE" --project="$PROJECT_ID" --format='value(state)' 
fi

echo "==> Creating database and user..."
gcloud sql databases create "$DB_NAME" --instance="$INSTANCE" --project="$PROJECT_ID" 2>/dev/null || true
gcloud sql users create "$DB_USER" --instance="$INSTANCE" --password="$ROOT_PASS" --project="$PROJECT_ID" 2>/dev/null || \
  gcloud sql users set-password "$DB_USER" --instance="$INSTANCE" --password="$ROOT_PASS" --project="$PROJECT_ID"

CONN="postgres://${DB_USER}:${ROOT_PASS}@/${DB_NAME}?host=/cloudsql/${PROJECT_ID}:${REGION}:${INSTANCE}"
echo "==> Storing DATABASE_URL in Secret Manager ($SECRET_NAME)..."
if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo -n "$CONN" | gcloud secrets versions add "$SECRET_NAME" --data-file=- --project="$PROJECT_ID"
else
  echo -n "$CONN" | gcloud secrets create "$SECRET_NAME" --data-file=- --project="$PROJECT_ID"
fi

echo "==> Grant Cloud Run service account access to secrets + Cloud SQL..."
SA="kaana-api-runner@${PROJECT_ID}.iam.gserviceaccount.com"
for s in kaana-database-url kaana-jwt-secret kaana-whatsapp-access-token kaana-whatsapp-phone-id kaana-whatsapp-verify-token kaana-admin-email kaana-admin-password; do
  gcloud secrets add-iam-policy-binding "$s" \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID" >/dev/null 2>&1 || true
done

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA}" \
  --role="roles/cloudsql.client" \
  --condition=None >/dev/null 2>&1 || true

echo ""
echo "==> Deploy: gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID ."
echo ""
echo "==> Hostinger DNS (if using kaana.in domains):"
echo "    A record  @ / api / inbox / app  →  34.36.130.96  (GCP HTTPS load balancer)"
echo "    Or CNAME each subdomain to ghs.googlehosted.com if using Cloud Run domain mapping directly."
echo ""
echo "Done."
