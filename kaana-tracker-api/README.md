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

JWT email/password + Google Sign-In:

- `POST /api/auth/register` — public signup
- `POST /api/auth/login` — sign in
- `POST /api/auth/google` — Google ID token → JWT (links existing users by email)
- `GET /api/auth/me` — current user (Bearer token)

Set `JWT_SECRET` and `GOOGLE_CLIENT_ID` in production. See [TRACKER_AUTH.md](../TRACKER_AUTH.md).

## Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Email + password → JWT |
| POST | `/api/auth/login` | Email + password → JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List projects (clusters) |
| POST | `/api/projects` | Create project |
| GET | `/api/work-items` | List work items |
| GET | `/api/work-items/stats` | Hub stats |

Production connects via `DB_SOCKET` to Cloud SQL. See `cloudbuild.tracker.yaml`.
