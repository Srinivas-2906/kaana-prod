# Bot IQ — Meta App Review reviewer tenant setup

**Product identity:** Bot IQ by Kaana (platform login at `app.kaana.in`, Meta app name: Kaana Platform).

No reviewer passwords or tokens belong in this repository. Provision credentials out of band.

---

## 1. Meta app access

1. In [Meta App Dashboard](https://developers.facebook.com/apps/27724398370520714/), add the reviewer as **Admin**, **Developer**, or **Tester** on app `27724398370520714`.
2. Confirm they can open **WhatsApp → API Setup** and **Embedded Signup** for the test configuration.

---

## 2. Platform tenant (Bot IQ account)

Use one dedicated tenant for all review sessions (recommended slug: `meta-review` or similar).

### Option A — Admin provision (production)

1. Sign in as **platform admin** on `https://app.kaana.in/admin`.
2. Create or select a tenant with:
   - `status` / live flags set so the tenant is **live** (`isLive` — same as existing admin provisioning).
   - Industry and bot name suitable for demo (e.g. “Bot IQ Review Demo”).
3. Create an **owner** user for the reviewer:
   - Email address Meta will use for login (reviewer’s or a shared review inbox you control).
   - Strong password delivered via secure channel (1Password, email, not git).
4. Mark onboarding complete / intake approved if your admin flow requires it.

### Option B — Self-serve signup (staging)

1. Reviewer signs up at `https://app.kaana.in/signup`.
2. Platform admin approves intake and sets tenant **live** in admin console.

---

## 3. Connect WhatsApp (WABA)

On the reviewer tenant dashboard (`/dashboard`):

1. **Connect with Meta Embedded Signup** (preferred), **or**
2. **Advanced → paste API credentials** with:
   - Phone Number ID
   - WABA-scoped access token (from Embedded Signup or API Setup)
   - Optional display number

Verify `GET /api/platform/me` shows `tenant.whatsappConnected: true`.

Backend stores credentials only on the server (`tenants.whatsapp_*`); the browser never receives the access token.

---

## 4. Webhook mapping (required for inbox)

Inbound messages route **only** by `phone_number_id` → `tenants.whatsapp_phone_id`.

1. Ensure the connected **Phone Number ID** is saved on the reviewer tenant (Embedded Signup does this).
2. Confirm Meta app webhook callback: `https://api.kaana.in/webhook/whatsapp` (or your environment URL).
3. Production must set **`META_APP_SECRET`** on the API service (signature verification). Do **not** set `ALLOW_DEFAULT_TENANT_WEBHOOK` in production.

Local dev only (optional):

```env
ALLOW_DEFAULT_TENANT_WEBHOOK=1
DEFAULT_TENANT_ID=<your-dev-tenant-id>
META_WEBHOOK_SKIP_SIGNATURE=1   # only if testing without signature locally
```

---

## 5. Inbox (Bot IQ)

1. Set **`VITE_HIDE_DEMO_VIEWS=true`** on the Inbox build (`inbox.kaana.in`) to hide mock Builder/Analytics/Live Preview during review.
2. From dashboard, **Open Inbox** (SSO).
3. Send a WhatsApp message **to** the connected business number from a personal test phone.
4. Confirm the thread appears in Inbox; reply from Inbox and confirm delivery on WhatsApp.

---

## 6. Templates

1. Dashboard → **Open templates** (`/templates`).
2. Create a UTILITY template (unique name, e.g. `botiq_review_demo_001`).
3. **Submit to Meta** — calls `POST /{WABA_ID}/message_templates`.
4. **Refresh status** until Meta shows `PENDING` / `APPROVED` / `REJECTED`.

---

## 7. Checklist for reviewer path A–H

| Step | Action |
|------|--------|
| A | Log in at `https://app.kaana.in/login` with provisioned user |
| B | Dashboard shows WhatsApp connected |
| C | Open Inbox via SSO |
| D | Send message from phone to business number |
| E | Receive bot/agent reply in Inbox |
| F | Open `/templates` |
| G | Create & submit template |
| H | Refresh and read Meta status |

---

## 8. Secrets checklist (ops, not in git)

| Secret | Where |
|--------|--------|
| `META_APP_SECRET` | Cloud Run `kaana-api` / botiq-whatsapp-server |
| `JWT_SECRET` | Same |
| Reviewer login password | Secure share to Meta reviewer |
| WABA token | Stored in DB per tenant after Embedded Signup |
