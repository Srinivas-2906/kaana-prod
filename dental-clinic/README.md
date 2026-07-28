# Denta Care Dental Clinic — Website

Marketing website for **Denta Care Dental Clinic** (Dr. D. Ajit) in Muralinagar, Visakhapatnam.

Built with TanStack Start + React + Vite. Deployed to Google Cloud Run.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

**Online booking** (Contact page) needs `clinic-api` on port 3010. The site calls same-origin `/api/platform`; Vite (dev) and the Nitro server (production) proxy that to clinic-api.

```bash
# Terminal 1
cd ../clinic-api && npm run dev

# Terminal 2
cd dental-clinic && npm run dev
```

Book at http://localhost:3000/contact — request appears in clinic CRM Today board (`requested`, source **Web**).

## Production build

```bash
npm run build
npm start
```

## Deploy to GCP (Cloud Run)

Prerequisites: `gcloud` CLI, project configured.

```bash
export PROJECT_ID="kaana-prod"
export REGION="asia-south1"
export SERVICE_NAME="ajitdentalclinic"

npm run gcp:bootstrap   # once per project
npm run gcp:deploy      # deploys ajitdentalclinic; needs clinic-api on Cloud Run first
```

Production booking requires **clinic-api** deployed and `CLINIC_API_ORIGIN` set on the marketing site Cloud Run service (the deploy script sets this automatically from the `clinic-api` service URL).

## Clinic details

- **Phone / WhatsApp:** 6301433852
- **Email:** ajitdentacare@gmail.com
- **Consultation:** ₹300
- **Address:** #39-11-70, 1st Floor, Shankar Plaza, Muralinagar, Visakhapatnam (Landmark: Shankar Plaza)
