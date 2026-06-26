# GCP Deployment (Reusable for any repo)

This repo is set up to deploy to **Google Cloud Run** using **Docker + Cloud Build**.

You can copy the whole `gcp/` folder + `Dockerfile` into other repos and only change:
- service name
- region
- env vars / secrets
- container port (usually 8080)

---

## 1) Prerequisites (one time per machine)

- Install Google Cloud CLI: `gcloud`
- Login:

```bash
gcloud auth login
gcloud auth application-default login
```

- Pick your project:

```bash
gcloud config set project YOUR_PROJECT_ID
```

Confirm:

```bash
gcloud config get-value project
```

---

## 2) Prerequisites (one time per GCP project)

These scripts enable the required APIs and create an Artifact Registry repo for Docker images.

Set variables (defaults are provided):

```bash
export REGION="asia-south1"
export SERVICE_NAME="dental-clinic"
export AR_REPO="apps"
```

Run bootstrap:

```bash
npm run gcp:bootstrap
```

What it does:
- Enables: Cloud Run, Cloud Build, Artifact Registry, IAM, Secret Manager
- Creates Artifact Registry Docker repo if it doesn’t exist

---

## 3) Deploy (manual)

Deploy from your current branch:

```bash
npm run gcp:deploy
```

This will:
- Build a container with Cloud Build
- Push to Artifact Registry
- Deploy a new Cloud Run revision

---

## 4) What to confirm before pushing

- **No secrets in git**
  - Don’t commit `.env`
  - Use Secret Manager for API keys/tokens
- **Start command works**
  - This repo uses: `npm run build` → outputs `.output/`
  - Production command: `node .output/server/index.mjs`
- **Port**
  - Cloud Run provides `$PORT` (we default to 8080 in the container).

---

## 5) Secrets & env vars

Recommended approach:
- store secrets in Secret Manager
- mount them as env vars in Cloud Run

Example commands (adjust names/values):

```bash
echo -n "VALUE_HERE" | gcloud secrets create MY_SECRET --data-file=-
# or update:
echo -n "VALUE_HERE" | gcloud secrets versions add MY_SECRET --data-file=-
```

Then on Cloud Run you can set:

```bash
gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --set-secrets "MY_SECRET=MY_SECRET:latest"
```

---

## 6) Continuous deployment (recommended)

Option A: Cloud Build Trigger (GitHub)
- Connect your GitHub repo in **Cloud Build → Triggers**
- Set it to run `gcp/cloudbuild.yaml` on push to `main`

Option B: Cloud Run continuous deployment (GitHub)
- Set up from the Cloud Run UI
- Same idea: deploy on push

---

## 7) Domain

In Cloud Run:
- Go to **Custom domains**
- Map your service
- Follow DNS instructions

---

## Notes for this repo (TanStack Start + Nitro)

- Build command: `npm run build`
- Output: `.output/`
- Run command: `node .output/server/index.mjs`

