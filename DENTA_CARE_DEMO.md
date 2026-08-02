# Denta Care — Kaana clinic tenant (`dentacare`)

Dental clinic desk for **Dr. D. Ajit** — Denta Care Dental Clinic, Visakhapatnam.

## Production URLs

| URL | Purpose |
|-----|---------|
| **https://crm.dentacare.kaana.in** | Clinic desk (preferred tenant URL) |
| **https://clinic-api.kaana.in** | Standalone clinic API (patients, bookings, payments) |
| **https://dentacare.kaana.in** | Denta Care marketing website |
| **https://dentacare.crm.kaana.in** | Legacy clinic desk URL |
| **https://clinic.kaana.in?tenant=dentacare** | Works without tenant DNS |

API (legacy, being replaced): **https://api.kaana.in**

## Sign in

| Field | Value |
|-------|-------|
| **Email** | `ajitdentacare@gmail.com` |
| **Password** | `Dentacare@123` |

Alternate demo accounts (same tenant):

| Email | Password |
|-------|----------|
| `admin@dentacare.in` | `Dentacare@2024` |
| `demo@dentacare.in` | `demo1234` |

---

## Local dev

### 1. Start API

```bash
cd botiq-app
# Ensure .env has: WHATSAPP_DRY_RUN=true
npm run dev
```

### 2. Start clinic desk

```bash
cd clinic-crm
npm run dev
```

Open **http://localhost:5185** (defaults to tenant `dentacare`).

Or explicitly: **http://localhost:5185?tenant=dentacare**

---

## Clinic details (pre-loaded)

- **Doctor:** Dr. D. Ajit — BDS, MDS (Oral Medicine & Radiology), 18 years
- **Clinic:** Denta Care Dental Clinic, Muralinagar, Visakhapatnam
- **Hours:** Mon–Sat · 10 AM – 1 PM · 5 PM – 9 PM
- **Consultation:** ₹100
- **Services:** Dentures, Cosmetic Dentistry, Conservative Dentistry, Artificial Teeth

After login you'll see **3 sample appointments today** (Lakshmi, Rajesh, Priya).

---

## Optional: simulate WhatsApp booking

```bash
cd botiq-app
npm run test:clinic
```

Or `POST /api/demo/whatsapp` with `{ "tenantSlug": "dentacare", "phone": "919876543210", "message": "hi" }`.

---

Full technical guide: [CLINIC_LOCAL.md](./CLINIC_LOCAL.md)
