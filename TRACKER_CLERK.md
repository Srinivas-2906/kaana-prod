# Kaana Tracker — Clerk auth

Using the **Faralin** Clerk application to match its OTP-less sign-up behavior. Legacy JWT login remains during migration.

## Architecture

```
Browser → Clerk Sign-in → session JWT
React (Vite) → getToken() → Authorization: Bearer …
Express API → verifyToken(@clerk/backend) → users.clerk_user_id → internal user id
Clerk webhook → POST /api/auth/webhooks/clerk → sync user create/update/delete
```

## Clerk Dashboard setup (one-time)

Application name: **Faralin** (shared)

### Paths

| Setting | Value |
|---------|--------|
| Sign-in URL | `/login` |
| Sign-up URL | `/sign-up` |
| After sign-in | `/` |
| After sign-up | `/` |

### Allowed origins (no custom domain required)

- `https://tracker.kaana.in`
- `http://localhost:5190`

### Sign-up like Faralin — no email OTP

1. **Configure → Email, phone, username → Email**
2. Turn **ON** “Sign-up with email” and **password**
3. Turn **OFF** “Verify at sign-up” / email verification code
4. Save

Tracker uses **custom sign-up forms** backed by `POST /api/auth/register`, which creates the Clerk user via the Backend API (no email OTP). After registration, the browser signs in with email + password.

Optional: enable Google under **Social connections** (no OTP for social sign-in).

### Webhook (production)

- URL: `https://tracker.kaana.in/api/auth/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`
- Copy signing secret → `CLERK_WEBHOOK_SECRET`

## Local env

**Frontend** (`kaana-tracker/.env`):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**API** (`kaana-tracker-api/.env`):

```env
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

Leave Clerk keys blank to use legacy email/password login locally.

## Production (GCP)

Secrets in `kaana-prod`:

- `kaana-tracker-clerk-secret-key` → `CLERK_SECRET_KEY`
- `kaana-tracker-clerk-webhook-secret` → `CLERK_WEBHOOK_SECRET`

Publishable key is baked into the frontend via `cloudbuild.tracker.yaml` → `_VITE_CLERK_PUBLISHABLE_KEY`.

Deploy:

```bash
gcloud builds submit --config cloudbuild.tracker.yaml --project kaana-prod .
```

## User linking

Existing DB users merge **by email** on first Clerk sign-in or `user.created` webhook.
