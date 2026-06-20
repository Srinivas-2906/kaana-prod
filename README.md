# Kaana Production

Next.js marketing site for [kaana.in](https://kaana.in).

## App

- `kaana/` — Next.js 16 site (App Router, contact API)

## Local dev

```bash
cd kaana
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Every push to `main` deploys via **Cloud Build → Cloud Run**.

See **[DEPLOY.md](./DEPLOY.md)** for one-time GCP setup.

Manual deploy:

```bash
gcloud builds submit --config cloudbuild.yaml .
```
