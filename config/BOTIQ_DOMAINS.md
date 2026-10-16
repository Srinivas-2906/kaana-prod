# Bot IQ hostnames (interim)

Bot IQ product URLs use the **`botiq.kaana.in`** namespace so they are distinct from generic Kaana marketing (`kaana.in`) and clinic (`clinic.kaana.in`, `clinic-api.kaana.in`).

Canonical mapping is in [`botiq-domains.json`](./botiq-domains.json).

| Role | Host | Notes |
|------|------|--------|
| Platform (login, dashboard, templates, interim legal) | `app.botiq.kaana.in` | Same Cloud Run service as legacy `app.kaana.in` |
| Inbox SPA | `inbox.botiq.kaana.in` | Legacy: `inbox.kaana.in` |
| WhatsApp API + webhooks | `api.botiq.kaana.in` | Legacy: `api.kaana.in` |
| CRM | `crm.botiq.kaana.in` | Legacy: `crm.kaana.in` |
| Short link / marketing entry | `botiq.kaana.in` | Same platform app as `app.botiq.kaana.in` |

**Not moved:** `kaana.in` (company marketing), clinic desk/API, tenant sites (`dentacare.kaana.in`, etc.).

**Legal (interim):** Privacy and terms stay on the platform app until you move to a dedicated Bot IQ domain. Data deletion **instructions** remain on `https://kaana.in/data-deletion` for now.

## One-time GCP (DNS + LB + SSL)

From repo root (PowerShell):

```powershell
.\scripts\gcp-setup-botiq-subdomains.ps1
```

Then add the new hostnames to the managed SSL certificate attached to the HTTPS load balancer (see script output). Redeploy **platform**, **inbox**, **api**, and **crm** so build-time `VITE_*` and API `PUBLIC_URL` match.

## Meta App Dashboard

After DNS is live, update:

- Privacy → `https://app.botiq.kaana.in/privacy`
- Terms → `https://app.botiq.kaana.in/terms`
- Webhook callback → `https://api.botiq.kaana.in/webhook/whatsapp`
- Data deletion instructions → still `https://kaana.in/data-deletion` until a Bot IQ-owned domain exists

Legacy `*.kaana.in` Bot IQ hosts remain on the load balancer during migration; remove them once redirects and Meta settings are updated.
