# Kaana — GCP deployment

Auto-deploy on every push to `main` via **Cloud Build** → **Cloud Run** (API) + **Firebase Hosting** (3 frontends).

## Stack

| App | Folder | Hosted on |
|-----|--------|-----------|
| Marketing site | `kaana-platform/` | Firebase (`kaana-prod-marketing`) |
| WhatsApp inbox | `botiq/` | Firebase (`kaana-prod-inbox`) |
| CRM | `propcrm/` | Firebase (`kaana-prod-crm`) |
| API + SQLite | `botiq-whatsapp-server/` | Cloud Run (`kaana-api`) |

SQLite is replicated to GCS via [Litestream](https://litestream.io/) (`LITESTREAM_BUCKET=kaana-prod-db`).

## One-time setup

```bash
# From repo root
chmod +x scripts/*.sh
./scripts/gcp-first-time-setup.sh
```

Then connect GitHub:

1. [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers?project=kaana-prod)
2. **Connect repository** → `Srinivas-2906/kaana-prod`
3. **Create trigger** → Push to branch `^main$` → Configuration: `cloudbuild.yaml`

## After first deploy

1. Get Cloud Run URL:
   ```bash
   gcloud run services describe kaana-api --region asia-south1 --format='value(status.url)'
   ```

2. Update `cloudbuild.yaml` substitutions (`_PUBLIC_URL`, `_VITE_*`, etc.) with real URLs.

3. Fill secrets in [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=kaana-prod):
   - `kaana-whatsapp-access-token`
   - `kaana-whatsapp-phone-id`
   - `kaana-whatsapp-verify-token`
   - `kaana-admin-password`
   - (others as needed)

4. Push to `main` again to redeploy with correct URLs.

## Custom domains (optional)

| Domain | Point to |
|--------|----------|
| `kaana.in` | Firebase site `kaana-prod-marketing` |
| `inbox.kaana.in` | Firebase site `kaana-prod-inbox` |
| `crm.kaana.in` | Firebase site `kaana-prod-crm` |
| `api.kaana.in` | Cloud Run custom domain mapping |

## Manual deploy (without git push)

```bash
gcloud builds submit --config cloudbuild.yaml .
```

## Local API in Docker

```bash
cd botiq-whatsapp-server
docker build -t kaana-api .
docker run --rm -p 3002:3002 --env-file .env kaana-api
```

Without `LITESTREAM_BUCKET`, the API runs with local SQLite only (fine for dev).

## Files added for hosting

- `botiq-whatsapp-server/Dockerfile` — API container
- `botiq-whatsapp-server/docker-entrypoint.sh` — Litestream + Node startup
- `cloudbuild.yaml` — CI/CD pipeline
- `firebase.json` / `.firebaserc` — 3 Firebase Hosting targets
- `scripts/build-frontends.sh` — builds all Vite apps with prod env
- `scripts/gcp-first-time-setup.sh` — one-time GCP bootstrap
