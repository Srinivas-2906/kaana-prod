# Kaana Tracker (React)

Idea-to-outcome workspace for Kaana — projects, work, finance, and (in progress) timeline/daybook.

- **Production:** https://tracker.kaana.in
- **API:** `kaana-tracker-api` (proxied at `/api` in production)

## Local dev

```bash
# Terminal 1 — API (port 3011)
cd ../kaana-tracker-api && cp .env.example .env && npm install && npm run dev

# Terminal 2 — UI (port 5190)
npm install && npm run dev
```

Open http://localhost:5190

## Auth (Clerk)

Tracker uses Clerk when `VITE_CLERK_PUBLISHABLE_KEY` is set. See [TRACKER_CLERK.md](../TRACKER_CLERK.md).

## Deploy

From repo root:

```bash
gcloud builds submit --config cloudbuild.tracker.yaml --project kaana-prod .
```

Or push to `main` with changes under `kaana-tracker/` — GitHub Action `.github/workflows/deploy-tracker.yml` runs automatically.

See [TRACKER_MIGRATION.md](../TRACKER_MIGRATION.md) for PHP → React migration status.
