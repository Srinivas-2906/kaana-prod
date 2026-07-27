# Kaana — Digital Solutions

Next.js marketing site for [Kaana](https://kaana.in). Converted from the original single-page HTML for reliable deployment and scaling.

## Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Swiper** — hero carousel
- **GSAP** (optional, legacy animations)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Project structure

```
src/
  app/              # Next.js routes, layout, globals
  components/site/  # Page sections (Header, Hero, Contact, …)
  hooks/            # React hooks (useSiteEffects)
  lib/              # Client-side init logic (initSiteEffects)
legacy/
  index.html        # Original static site (reference)
```

## API

- `POST /api/contact` — Contact form submission (logs payload; wire to Resend/SendGrid in production)
- `POST /api/ai/generate` — Gemini-powered AI text demo (rate-limited, server-side key)

### AI demo environment

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey).

Production uses Secret Manager secret `kaana-gemini-api-key` on Cloud Run (`kaana-web`).

Rate limits (defaults): 50 global/day, 3 per IP per 15 min, 8 per IP/day, 10s minimum between requests.

## Deployment

Hosted on **GCP Cloud Run** via Cloud Build (push to `main` auto-deploys).

```bash
# From repo root
gcloud builds submit --config cloudbuild.yaml .
```

See [../DEPLOY.md](../DEPLOY.md) for full setup.

## Regenerating from legacy HTML

If you update `legacy/index.html`:

```bash
node scripts/convert-sections.mjs   # Regenerate React components
node scripts/build-site-effects.mjs # Regenerate initSiteEffects.ts
```
