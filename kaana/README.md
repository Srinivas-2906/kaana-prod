# Kāna — Digital Solutions

Next.js marketing site for [Kāna](https://kaana.in). Converted from the original single-page HTML for reliable deployment and scaling.

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

## Deployment

Works on Vercel, Render, or any Node host:

```bash
npm run build
npm run start
```

Set `PORT` if your host requires it.

## Regenerating from legacy HTML

If you update `legacy/index.html`:

```bash
node scripts/convert-sections.mjs   # Regenerate React components
node scripts/build-site-effects.mjs # Regenerate initSiteEffects.ts
```
