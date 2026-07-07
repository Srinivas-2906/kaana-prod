# Denta Care Dental Clinic — Website

Marketing website for **Denta Care Dental Clinic** (Dr. D. Ajit) in Muralinagar, Visakhapatnam.

Built with TanStack Start + React + Vite. Deployed to Google Cloud Run.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

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
npm run gcp:deploy
```

## Clinic details

- **Phone / WhatsApp:** 6301433852
- **Email:** ajitdentacare@gmail.com
- **Consultation:** ₹300
- **Address:** #39-11-70, 1st Floor, Shankar Plaza, Muralinagar, Visakhapatnam (Landmark: Shankar Plaza)
