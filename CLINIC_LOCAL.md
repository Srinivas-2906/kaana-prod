# Kaana Clinic — Local testing guide

Test the full dental clinic stack on your machine without deploying to GCP.

## What you need

- Node.js 20+
- Two terminal windows (**clinic-api**, **clinic-crm**)

Optional: `botiq-whatsapp-server` only if you need WhatsApp booking sync (separate stack).

---

## Step 1 — Install dependencies (one time)

```bash
cd clinic-api && npm install
cd ../clinic-crm && npm install
```

---

## Step 2 — Start clinic API (terminal 1)

```bash
cd clinic-api
cp .env.example .env   # skip if .env already exists
npm run dev
```

You should see:

```
Clinic API (standalone)
API:    http://localhost:3010/api
Login:  ajitdentacare@gmail.com / Dentacare@123  (tenant: dentacare)
```

---

## Step 3 — Start clinic dashboard (terminal 2)

```bash
cd clinic-crm
npm run dev
```

Open **http://localhost:5185?tenant=dentacare**

---

## Step 4 — Log in

### Option A — Demo clinic account (fastest)

1. Go to **http://localhost:5180/login**
2. Email: `clinic@demo.kaana.in`
3. Password: `demo1234`
4. On the dashboard, click **Open clinic desk →** (or open http://localhost:5185 directly)

### Option B — Platform admin

- Email: `admin@kaana.ai` / Password: `kaanaadmin` (from `.env`)
- Sign up a new clinic at `/signup` with industry **Clinic**

---

## Step 6 — Simulate WhatsApp booking (no phone needed)

Run this in a **fourth terminal** to walk through the bot:

```bash
API=http://localhost:3002/api
PHONE=919876543210

# Start conversation
curl -s -X POST "$API/demo/whatsapp" -H 'Content-Type: application/json' \
  -d '{"tenantSlug":"smile-dental","phone":"'"$PHONE"'","message":"hi"}'

# Book appointment — reason
curl -s -X POST "$API/demo/whatsapp" -H 'Content-Type: application/json' \
  -d '{"tenantSlug":"smile-dental","phone":"'"$PHONE"'","message":"🦷 Tooth pain"}'

# Name
curl -s -X POST "$API/demo/whatsapp" -H 'Content-Type: application/json' \
  -d '{"tenantSlug":"smile-dental","phone":"'"$PHONE"'","message":"Ravi Kumar"}'

# Date
curl -s -X POST "$API/demo/whatsapp" -H 'Content-Type: application/json' \
  -d '{"tenantSlug":"smile-dental","phone":"'"$PHONE"'","message":"Tomorrow"}'

# Time (pick one shown by bot)
curl -s -X POST "$API/demo/whatsapp" -H 'Content-Type: application/json' \
  -d '{"tenantSlug":"smile-dental","phone":"'"$PHONE"'","message":"10:00 AM"}'
```

**Then refresh the clinic dashboard → Today tab.** You should see Ravi Kumar’s appointment as **Needs confirm**.

Or run the all-in-one script:

```bash
bash scripts/test-clinic-local.sh
```

---

## Step 7 — Test front desk flows

| Tab | What to try |
|-----|-------------|
| **Today** | Confirm → Mark arrived → Mark done on an appointment |
| **Patients** | Open patient card, add a note, open WhatsApp chat link |
| **Book** | 3-step walk-in: name/phone → service → date/time |
| **Pay** | Record a cash/UPI payment for a patient |
| **Setup** | Onboarding checklist (Google profile, reminders, etc.) |

---

## Step 8 — Test API directly (optional)

Get a token:

```bash
curl -s -X POST http://localhost:3002/api/platform/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"clinic@demo.kaana.in","password":"demo1234"}' | jq -r .token
```

Use token:

```bash
TOKEN=your_token_here

curl -s http://localhost:3002/api/clinic/today -H "Authorization: Bearer $TOKEN" | jq
curl -s http://localhost:3002/api/patients -H "Authorization: Bearer $TOKEN" | jq
curl -s http://localhost:3002/api/clinic/payments -H "Authorization: Bearer $TOKEN" | jq
```

---

## Step 9 — Test reminders locally

Reminders run every 60 seconds. Without WhatsApp connected they **log to the API console**:

```
📋 [reminder] tenant=smile-dental phone=919876543210: 🦷 Reminder from your dental clinic…
```

To test quickly, create an appointment **2 hours from now** via the Book tab — reminders for 24h/2h before will be scheduled automatically.

When you mark a visit **Done**, a **6-month recall** reminder is scheduled.

---

## Step 10 — Real WhatsApp (optional)

1. Set valid `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in `botiq-whatsapp-server/.env`
2. Run ngrok: `ngrok http 3002`
3. Point Meta webhook to `https://YOUR-NGROK/webhook/whatsapp`
4. Link tenant `smile-dental` to your phone number ID in the DB or platform settings
5. Message your WhatsApp business number — same flow as demo curl

---

## Ports reference

| App | URL |
|-----|-----|
| API | http://localhost:3002 |
| Platform | http://localhost:5180 |
| Clinic desk | http://localhost:5185 |
| Inbox (optional) | http://localhost:5173 |

---

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Demo dental clinic | `clinic@demo.kaana.in` | `demo1234` |
| Platform admin | `admin@kaana.ai` | `kaanaadmin` |

Demo tenant slug: **`smile-dental`** (Smile Dental Clinic)

---

## Troubleshooting

**401 on clinic dashboard** — Log in again at localhost:5185.

**Empty Today tab** — Use the Book tab to add a walk-in, or check that `clinic-api` seeded demo data on first run.

**API connection refused** — Start `clinic-api` first (`npm run dev` in `clinic-api`, port **3010**). The CRM proxies `/api` there automatically in dev.

**Phone cannot connect** — Same Wi‑Fi as Mac; allow Node/Vite through macOS firewall.

```bash
curl http://localhost:3010/api/health
```
