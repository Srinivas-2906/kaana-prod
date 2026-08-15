# Kaana Tracker — Auth

Email + password and **Google Sign-In**, both backed by JWT sessions.

## Flow

```
Email/password → POST /api/auth/register or /api/auth/login → JWT
Google button  → POST /api/auth/google { credential }       → JWT
React          → Authorization: Bearer … (localStorage)
Express        → verify JWT → users.id
```

## Google Sign-In (existing users)

Users who onboarded via Clerk/Google keep the same email in MySQL. When they click **Continue with Google**, the API:

1. Verifies the Google ID token
2. Finds the user **by email** (including legacy Clerk rows)
3. Issues a Tracker JWT — no password needed

New Google users get a public account automatically.

## Google Cloud setup (one-time)

Google OAuth **Web client IDs cannot be created via gcloud** on standalone projects — use the Console once, then automate the rest:

1. Open [Create OAuth client](https://console.cloud.google.com/auth/clients/create?project=kaana-prod)
2. Application type: **Web application**
3. Name: `Kaana Tracker Sign-In`
4. **Authorized JavaScript origins:**
   - `https://tracker.kaana.in`
   - `http://localhost:5190`
5. Copy the **Client ID** (no redirect URI needed)

Then run (stores secret, updates Cloud Run, ready to deploy):

```powershell
cd kaana-tracker-api/scripts
.\setup-google-signin-gcp.ps1 -ClientId "YOUR_CLIENT_ID.apps.googleusercontent.com"
```

Already done on GCP automatically:
- `tracker.kaana.in` added to Identity Platform authorized domains
- Secret name: `kaana-tracker-google-client-id`
- Cloud Build reads Client ID from Secret Manager at deploy time

## Local env

**Frontend** (`kaana-tracker/.env`):

```env
VITE_TRACKER_API=/api
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

**API** (`kaana-tracker-api/.env`):

```env
JWT_SECRET=tracker-dev-secret-change-me
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

Use the **same Client ID** in both files.

## Production (GCP)

- `kaana-tracker-google-client-id` → `GOOGLE_CLIENT_ID` (API + frontend build)
- `kaana-jwt-secret` → `JWT_SECRET`

Deploy:

```bash
gcloud builds submit --config cloudbuild.tracker.yaml --project kaana-prod .
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Email + password signup |
| POST | `/api/auth/login` | Email + password sign-in |
| POST | `/api/auth/google` | Google ID token → JWT |

## User linking

Existing DB users merge **by email** on register, login, or Google sign-in.

Clerk-only accounts (no password) can sign in with Google immediately if the email matches.
