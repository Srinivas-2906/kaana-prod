# Clinic stack — production migration & mapping

Standalone **clinic-api** + **clinic-crm** for Denta Care (and future clinic tenants).

## Production URLs (target)

| Service | URL | Cloud Run | LB backend |
|---------|-----|-----------|------------|
| Clinic desk (UI) | https://crm.dentacare.kaana.in | `kaana-clinic` | `kaana-clinic-backend` |
| Clinic API | https://clinic-api.kaana.in | `clinic-api` | `clinic-api-backend` |
| Marketing site | https://dentacare.kaana.in | `ajitdentalclinic` | `ajitdentalclinic-backend` |

Website **Contact → Book an appointment** posts to `clinic-api` public booking endpoints; requests appear on CRM Today board as **Not confirmed** (source: Website).

Legacy `api.kaana.in` (botiq) is **no longer required** for the clinic desk once migration is complete.

---

## One-time: migrate DB from production kaana.db

Requires `gcloud` + `gsutil` authenticated to `kaana-prod`.

```bash
cd clinic-api
chmod +x scripts/download-and-migrate.sh
npm run migrate:prod-download
```

This will:

1. **Restore** `gs://kaana-prod-db/kaana.db` via litestream (production DB is a replica, not a flat file)
2. Copy **dentacare** tenant (patients, appointments, payments, users, catalog) → `clinic-api/data/clinic.db`
3. **Upload** litestream replica to `gs://kaana-prod-db/clinic.db` (used by clinic-api on Cloud Run)

Requires `gcloud auth application-default login` for GCS access.

### Local-only migration (from dev kaana.db)

```bash
cd clinic-api
node scripts/migrate-from-kaana-db.js \
  --source ../botiq-whatsapp-server/data/kaana.db \
  --tenant dentacare
```

Dry run:

```bash
node scripts/migrate-from-kaana-db.js --source /path/to/kaana.db --tenant dentacare --dry-run
```

---

## Deploy clinic stack

```bash
gcloud builds submit --config cloudbuild.clinic.yaml .
```

Deploys:

- **clinic-api** — SQLite at `/data/clinic.db`, litestream → `gs://kaana-prod-db/clinic.db`
- **kaana-clinic** — CRM UI built with `VITE_CLINIC_API=https://clinic-api.kaana.in/api`

Verify:

```bash
curl https://clinic-api.kaana.in/api/health
# open https://crm.dentacare.kaana.in
```

---

## One-time: load balancer mapping for clinic-api.kaana.in

After first Cloud Run deploy:

```bash
chmod +x scripts/setup-clinic-api-backend.sh
./scripts/setup-clinic-api-backend.sh
```

This creates:

- Serverless NEG → `clinic-api` Cloud Run
- Backend `clinic-api-backend`
- Imports `scripts/url-map-multi.yaml` (adds `clinic-api.kaana.in`)

**DNS:** Add `clinic-api.kaana.in` → same load balancer A record as `kaana.in` (if not using wildcard).

---

## Rollback

Point CRM build back to legacy API:

```
VITE_CLINIC_API=https://api.kaana.in/api
```

Redeploy `kaana-clinic` only. Data in `clinic.db` remains in GCS untouched.

---

## Files

| Path | Purpose |
|------|---------|
| `clinic-api/scripts/migrate-from-kaana-db.js` | SQLite tenant copy |
| `clinic-api/scripts/download-and-migrate.sh` | GCS download + upload |
| `scripts/setup-clinic-api-backend.sh` | GCP LB wiring |
| `scripts/url-map-multi.yaml` | Host routing |
| `cloudbuild.clinic.yaml` | Deploy API + CRM |
