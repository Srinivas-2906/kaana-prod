# whatsapp-auto

Unified WhatsApp bot + team inbox (React + Node + PostgreSQL).

## Structure

```
botiq-app/
├── client/          React 19 inbox UI (Vite, port 5174 in dev)
├── server/          Express API + WhatsApp bot (port 3002)
├── docker-compose.yml   Local Postgres on port 5433
└── package.json     npm workspaces root
```

## Quick start

```bash
npm run db:up          # Postgres via Docker
cp server/.env.example server/.env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- **Inbox UI (dev):** http://localhost:5174
- **API:** http://localhost:3002/api
- **Production:** `inbox.kaana.in` and `api.kaana.in` → same Cloud Run service (`kaana-api`)

## Migrate from legacy SQLite

If you have an old `kaana.db` from the SQLite era:

```bash
# Optional: download production replica
# litestream restore -o /tmp/kaana.db gcs://kaana-prod-db/kaana.db

npm run db:migrate:sqlite -- --source /path/to/kaana.db
# Add --truncate to replace existing Postgres data
# Add --dry-run to preview counts
```

Requires `DATABASE_URL` in `server/.env`.

## Production deploy

Built and deployed via root `cloudbuild.yaml` as a single image:

- `SERVE_CLIENT=true` — inbox UI at `/`, API at `/api`
- `DATABASE_URL` from Secret Manager (`kaana-database-url`)
- Load balancer: `inbox.kaana.in` → `kaana-api-backend` (same as `api.kaana.in`)

## SSO from kaana-platform

Platform opens `VITE_BOTIQ_URL` (https://inbox.kaana.in) and passes JWT via `postMessage`.
Inbox client is built with `VITE_WHATSAPP_API=/api` (same-origin relative API calls).
