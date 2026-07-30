# Kaana — GCP deployment

Auto-deploy the **Next.js marketing site** (`kaana/`) on every push to `main`.

```
git push main → Cloud Build → Cloud Run (kaana-web)
```

## Stack

| Component | Path | Hosted on |
|-----------|------|-----------|
| Marketing site | `kaana/` | Cloud Run (`kaana-web`) |

This repo can also deploy the Kaana suite apps (platform/inbox/CRM/clinic/API) as separate Cloud Run services via `cloudbuild.yaml`.

## One-time setup

```bash
chmod +x scripts/gcp-first-time-setup.sh
./scripts/gcp-first-time-setup.sh
```

Connect GitHub:

1. [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers?project=kaana-prod)
2. **Connect repository** → `Srinivas-2906/kaana-prod`
3. **Create trigger** → Push to `^main$` → Config: `cloudbuild.yaml`

## After first deploy

```bash
gcloud run services describe kaana-web --region asia-south1 --format='value(status.url)'
```

Map **kaana.in** in Cloud Run → **Manage custom domains** (SSL included).

## Manual deploy (without git)

```bash
gcloud builds submit --config cloudbuild.yaml .
```

## Deploy only the clinic stack (recommended)

Standalone **clinic-api** + **clinic-crm** — see **[CLINIC_PRODUCTION.md](./CLINIC_PRODUCTION.md)** for DB migration and domain mapping.

```bash
gcloud builds submit --config cloudbuild.clinic.yaml .
```

## Deploy Kaana Tracker (React + API)

Replaces the legacy PHP app at **https://tracker.kaana.in** (same URL, new stack).

```bash
gcloud builds submit --config cloudbuild.tracker.yaml --project kaana-prod .
```

Auto-deploy: push to `main` with changes under `kaana-tracker/` or `kaana-tracker-api/` (see `.github/workflows/deploy-tracker.yml`).

Details: **[TRACKER_MIGRATION.md](./TRACKER_MIGRATION.md)**

## Deploy only the clinic desk UI (legacy single-service)

```bash
gcloud builds submit --config cloudbuild.kaana-clinic.yaml .
```

After deploy, confirm the live URL:

```bash
gcloud run services describe kaana-clinic --region asia-south1 --format='value(status.url)'
```

To make it available at `clinic.kaana.in`, map the custom domain in Cloud Run (or use the HTTPS LB URL-map approach in `scripts/url-map-multi.yaml`).

## Local Docker test

```bash
cd kaana
docker build -t kaana-web .
docker run --rm -p 8080:8080 kaana-web
```

Open [http://localhost:8080](http://localhost:8080).

## Files

- `kaana/Dockerfile` — Next.js standalone container
- `kaana/next.config.ts` — `output: "standalone"` for Cloud Run
- `cloudbuild.yaml` — build image + deploy on push
