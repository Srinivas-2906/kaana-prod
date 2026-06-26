# Denta Care — Quick demo (Dr. D. Ajit)

Simple 2-step local demo. No Kaana platform needed for the login screen.

## 1. Start API

```bash
cd botiq-whatsapp-server
# Ensure .env has: WHATSAPP_DRY_RUN=true
npm run dev
```

## 2. Start dental dashboard

```bash
cd clinic-crm
npm run dev
```

Open **http://localhost:5185**

## 3. Sign in

| Email | Password |
|-------|----------|
| **demo@dentacare.in** | **demo1234** |

The login page shows **Denta Care Dental Clinic · Dr. D. Ajit · Visakhapatnam**.

After login you’ll see **3 sample appointments today** (Lakshmi, Rajesh, Priya) ready to demo Confirm → Arrived → Done.

---

## Clinic details (pre-loaded)

- **Doctor:** Dr. D. Ajit — BDS, MDS (Oral Medicine & Radiology), 18 years
- **Clinic:** Denta Care Dental Clinic, Muralinagar, Visakhapatnam
- **Hours:** Mon–Sat · 10 AM – 1 PM · 5 PM – 9 PM
- **Consultation:** ₹100
- **Services:** Dentures, Cosmetic Dentistry, Conservative Dentistry, Artificial Teeth

---

## Optional: simulate WhatsApp booking

With API running:

```bash
npm run test:clinic
```

(from `botiq-whatsapp-server` folder)

---

Full technical guide: [CLINIC_LOCAL.md](./CLINIC_LOCAL.md)
