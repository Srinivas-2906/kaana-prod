# Kaana — GCP deployment

Auto-deploy the **Next.js marketing site** (`kaana/`) on every push to `main`.

```
git push main → Cloud Build → Cloud Run (kaana-web)
```

## Stack

| Component | Path | Hosted on |
|-----------|------|-----------|
| Marketing site | `kaana/` | Cloud Run (`kaana-web`) |

Other apps in this workspace (`kaana-platform`, `botiq`, `propcrm`, API) are **not deployed** from this repo.

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
