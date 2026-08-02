# Kaana Platform — Go Live Guide

Multi-tenant SaaS stack: marketing site, API, WhatsApp bot, BotIQ dashboard, PropCRM, mini-site.

## Architecture

```
kaana-platform (5180)  →  Sign up / Login / Pricing
         ↓ JWT (SSO postMessage)
botiq-app (3002)       →  Postgres, WhatsApp API, inbox UI (SERVE_CLIENT)
propcrm (5175)         →  Lead CRM
/listings?tenant=slug  →  Branded mini-site (served by botiq-app)
```

## Quick start (local)

### 1. BotIQ unified app (API + inbox)
```bash
cd botiq-app
cp server/.env.example server/.env   # DATABASE_URL + Meta token + JWT_SECRET
npm run db:up && npm install
npm run db:migrate && npm run db:seed
npm run dev                        # API :3002, inbox :5174
```

### 2. Marketing website
```bash
cd kaana-platform
npm install
npm run dev
# → http://localhost:5180
```

### 3. Dashboards
```bash
cd botiq && npm run dev          # :5174
cd propcrm && npm run dev -- --port 5175
```

### 4. Flow (concierge mode — default)

Self-serve is **built but locked**. New signups get white-glove onboarding for the first cohort.

1. Open **http://localhost:5180/signup** → request early access
2. Complete the **5-step questionnaire** at `/onboarding`
3. Dashboard shows **locked** state until admin activates
4. Log in as **admin@kaana.ai** → `/admin` → **Activate** tenant (seeds catalog + applies intake)
5. Customer dashboard unlocks → connect WhatsApp → bot, inbox, CRM, mini-site go live

**Unlock self-serve later** (instant provisioning for anyone):

```bash
# botiq-whatsapp-server/.env
KAANA_SELF_SERVE=true
```

**Cohort size** (default 10):

```bash
KAANA_CONCIERGE_SPOTS=10
```

### 4b. Flow (self-serve — when unlocked)

1. Sign up → tenant is `active` immediately, catalog seeded
2. Dashboard → connect WhatsApp → Open BotIQ / CRM

## Default accounts

| Role | Email | Password |
|------|-------|----------|
| Platform admin | admin@kaana.ai | kaanaadmin |
| Demo tenant | (sign up new) | your password |

## Deploy free

| Component | Host | Notes |
|-----------|------|-------|
| **kaana-platform** | [Vercel](https://vercel.com) | Connect repo, root `kaana-platform`, build `npm run build`, output `dist` |
| **API** | [Render](https://render.com) | Web service, `npm start`, set env vars, persistent disk for `data/` |
| **BotIQ / CRM** | Vercel or Netlify | Static Vite builds |

### Vercel env (kaana-platform)
```
VITE_API_URL=https://your-api.onrender.com/api/platform
VITE_BOTIQ_URL=https://app.yourdomain.com/botiq
VITE_CRM_URL=https://app.yourdomain.com/crm
VITE_LISTINGS_URL=https://your-api.onrender.com/listings
```

### Link from your Hostinger site
Add a button: **“Get started”** → `https://your-vercel-app.vercel.app`

## API endpoints

### Public
- `POST /api/platform/signup` — create tenant + user
- `POST /api/platform/login` — JWT
- `GET /api/platform/plans` — pricing
- `GET /api/properties?tenant=slug` — listings (branded)

### Authenticated (Bearer JWT)
- `GET /api/platform/me`
- `GET /api/conversations`
- `GET /api/leads`
- `POST /api/conversations/:id/send`
- `POST /api/billing/create-order`

### Admin
- `GET /api/platform/admin/tenants` — platform admin only (includes overview stats)
- `GET /api/platform/admin/overview` — visitors, signups, alerts
- `GET /api/platform/admin/billing` — subscription orders
- `PATCH /api/platform/admin/tenants/:id/activate` — mark live, seed catalog, apply intake
- `GET /api/platform/config` — public: concierge spots, self-serve flag
- `GET/POST /api/platform/onboarding/intake` — setup questionnaire
- `POST /api/platform/track` — anonymous pageview tracking (marketing site)

## Business tracking & email alerts

The API logs signups, questionnaire submissions, and payments. Alerts go to **srinivas@kaana.in** by default.

```bash
# botiq-whatsapp-server/.env
KAANA_NOTIFY_EMAIL=srinivas@kaana.in
RESEND_API_KEY=re_xxxx          # optional — without this, alerts log to console + /admin
RESEND_FROM=Kaana <hello@yourdomain.com>
```

**Admin dashboard** at `/admin` (login as `admin@kaana.ai`):
- Overview — page views, signups, top pages, recent alerts
- Businesses — email, phone, activation
- Billing — Razorpay orders

The marketing site sends anonymous page views on every route change to `POST /api/platform/track`.
- `POST /api/platform/lead` — homepage lead form (name + WhatsApp, no account)

### Optional analytics (marketing site)

Add to `kaana-platform/.env` when ready:

```bash
# Plausible (recommended — simple, privacy-friendly)
VITE_PLAUSIBLE_DOMAIN=kaana.in

# Or Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Both work alongside the built-in Kaana admin tracker. Leave blank in local dev.

## Razorpay

1. Create account at razorpay.com
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in API `.env`
3. Without keys, billing runs in **demo mode** (activates plan on verify)

## Multi-tenant WhatsApp

Each tenant row can store `whatsapp_phone_id`. Meta webhook resolves tenant from incoming `phone_number_id`.

For first clients (manual):
1. Sign up tenant on platform
2. Update DB: `UPDATE tenants SET whatsapp_phone_id = '...' WHERE slug = '...'`
3. Or set `DEFAULT_TENANT_ID` for single-number demo

## Next steps for production

- [ ] Custom domain + SSL on all apps
- [ ] Email verification (Resend/Brevo)
- [x] Per-tenant catalog in DB (auto-seeded on signup)
- [ ] Meta Embedded Signup for self-serve WhatsApp connect (manual connect via dashboard works)
- [ ] OpenAI usage metering per tenant
- [ ] Postgres instead of SQLite at scale
- [x] Persistent conversations & leads in SQLite
- [x] Razorpay checkout UI (dashboard + pricing)
- [x] Industry bots for all 12 verticals
- [x] Analytics API + dashboard stats
- [x] CRM lead writeback (stage changes persist)
- [x] Platform admin page (`/admin`)
