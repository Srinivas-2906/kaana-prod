# Kaana Tracker — Clerk auth

Tracker supports **Clerk** (recommended) with **legacy JWT login** kept during migration.

Pattern matches [Faralin](../faralin/) (`clerkMiddleware` + `@clerk/backend` verify + `users.clerk_user_id` mapping).

## Architecture

```
Browser → Clerk Sign-in → session JWT
React (Vite) → getToken() → Authorization: Bearer …
Express API → verifyToken(@clerk/backend) → users.clerk_user_id → internal user id
Clerk webhook → POST /api/auth/webhooks/clerk → sync user create/update/delete
```

## Local setup

### 1) Create a Clerk application

1. [Clerk Dashboard](https://dashboard.clerk.com) → **Add application**
2. Allowed origins:
   - `http://localhost:5190`
   - `https://tracker.kaana.in`
3. Copy keys:
   - **Publishable key** → frontend
   - **Secret key** → API
4. Webhook endpoint (production):
   - URL: `https://tracker.kaana.in/api/auth/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy **Signing secret** → API

### 2) Configure env

Tracker reuses the **same Clerk application** as Faralin. Map env names:

| Faralin (`.env`) | Tracker |
|------------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or `CLERK_PUBLISHABLE_KEY` | `kaana-tracker/.env` → `VITE_CLERK_PUBLISHABLE_KEY` |
| `CLERK_SECRET_KEY` | `kaana-tracker-api/.env` → `CLERK_SECRET_KEY` |
| `CLERK_WEBHOOK_SECRET` | `kaana-tracker-api/.env` → `CLERK_WEBHOOK_SECRET` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` | Tracker uses **`/login`** (already set in `AuthProvider`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` | Tracker uses **`/sign-up`** |

**API** (`kaana-tracker-api/.env`):

```env
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...   # not whsec_placeholder — copy from Clerk → Webhooks
```

**Frontend** (`kaana-tracker/.env`):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Leave Clerk keys blank to keep legacy email/password login locally.

**Clerk Dashboard → Paths:** set Sign-in URL to `/login` for tracker.kaana.in (Faralin keeps `/sign-in`).

### 3) Run

```bash
# Terminal 1
cd kaana-tracker-api && npm install && npm run dev

# Terminal 2
cd kaana-tracker && npm install && npm run dev
```

Open http://localhost:5190 — you should see Clerk Sign-in.

## Production (GCP)

Create Secret Manager entries in `kaana-prod`:

```bash
gcloud secrets create kaana-tracker-clerk-secret-key --project kaana-prod --replication-policy=automatic
printf '%s' 'sk_live_...' | gcloud secrets versions add kaana-tracker-clerk-secret-key --project kaana-prod --data-file=-

gcloud secrets create kaana-tracker-clerk-webhook-secret --project kaana-prod --replication-policy=automatic
printf '%s' 'whsec_...' | gcloud secrets versions add kaana-tracker-clerk-webhook-secret --project kaana-prod --data-file=-
```

Update `cloudbuild.tracker.yaml` substitution `_VITE_CLERK_PUBLISHABLE_KEY` to your live publishable key (or pass via trigger).

Deploy:

```bash
gcloud builds submit --config cloudbuild.tracker.yaml --project kaana-prod .
```

## User migration

- Existing DB users are linked **by email** on first Clerk sign-in or `user.created` webhook.
- Legacy `/api/auth/login` still works when Clerk token verification fails (dual-auth phase).
- Clerk-only users get a placeholder password hash in MySQL (not used for login).

## Next phase (optional)

- Disable legacy login UI when all users are on Clerk
- Remove `JWT_SECRET` and `/api/auth/login`
