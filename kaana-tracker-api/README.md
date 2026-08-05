# Kaana Tracker API

Express + MySQL REST API for [Kaana Tracker](../kaana-tracker/). Uses the existing Cloud SQL database (`expense_tracker`).

## Local dev

```bash
cp .env.example .env
# Set DB_HOST, DB_NAME, DB_USER, DB_PASS for local MySQL
npm install
npm run dev
```

Health: http://localhost:3011/api/health

## Auth

- **Clerk (recommended):** set `CLERK_SECRET_KEY`; API verifies Clerk session JWTs and maps `users.clerk_user_id`.
- **Legacy JWT:** `POST /api/auth/login` still supported during migration.
- **Webhook:** `POST /api/auth/webhooks/clerk` (Svix-signed; requires raw body).

See [TRACKER_CLERK.md](../TRACKER_CLERK.md).

## Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Email + password → JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List projects (clusters) |
| POST | `/api/projects` | Create project |
| GET | `/api/work-items` | List work items |
| GET | `/api/work-items/stats` | Hub stats |

Production connects via `DB_SOCKET` to Cloud SQL. See `cloudbuild.tracker.yaml`.
