# Workspace Report — `/Users/srinivas/Downloads/Demos`

This workspace is a **multi-project demo hub** (one git repo at the workspace root) containing:
- a production Kaana stack (marketing + platform + inbox + CRM + clinic desk + API) designed to be hosted as multiple subdomains
- additional standalone demos (Dental Clinic marketing, Inventory/WMS UI)
- one monorepo (`faralin/`) with its own deployment pipeline
- supporting docs and UI screenshots

Last scanned: 2026-06-26

---

## Quick index (what lives where)

### Kaana “suite” (linked apps)
- `kaana/`: Kaana marketing site (Next.js)
- `kaana-platform/`: main platform web app (Vite/React SPA)
- `botiq/`: inbox web app (Vite/React SPA)
- `propcrm/`: CRM web app (Vite/React SPA)
- `clinic-crm/`: clinic front-desk web app (Vite/React SPA)
- `botiq-whatsapp-server/`: backend API (Node/Express + SQLite + WhatsApp provider)

### Other projects
- `dental-clinic/`: Dental clinic marketing site (TanStack Start + Nitro)
- `faralin/`: monorepo (pnpm workspaces + Turborepo; Next.js + NestJS + Prisma)
- `inventory-wms/`: StockFlow inventory/WMS UI demo (Vite/React SPA)

### Non-app artifacts / docs
- `ui-review/`: PNG screenshots only (no runnable app)
- `scripts/`: infra helpers (GCP bootstrap, clinic demo runner, URL map YAMLs)
- Top-level docs: `DEPLOY.md`, `GO_LIVE.md`, `LAUNCH_READINESS.md`, etc.
- Top-level HTML demos: `kaana_*_demo.html` (static pages)

---

## How projects are linked (the “wiring”)

### The Kaana suite wiring (local + production)

The Kaana suite is designed as **multiple frontends** that all talk to a **single backend API**:
- **Backend API**: `botiq-whatsapp-server/`
- **Frontends**: `kaana-platform/`, `botiq/`, `propcrm/`, `clinic-crm/` (+ `kaana/` marketing)

In production, URLs are hard-wired via Cloud Build substitutions (see `cloudbuild.yaml` at workspace root):
- Marketing: `https://kaana.in`
- Platform: `https://app.kaana.in`
- Inbox: `https://inbox.kaana.in`
- CRM: `https://crm.kaana.in`
- Clinic desk: `https://clinic.kaana.in`
- API: `https://api.kaana.in`

At build time, the SPAs receive `VITE_*` URLs (build args) pointing to the API + other apps.

Locally, the same wiring is done via `.env`/`.env.production.example` files and/or a Vite proxy.

### Optional: “single entrypoint” load balancer mapping

The workspace includes a URL map config (`scripts/url-map-multi.yaml`) that routes **multiple hostnames** to different backend services. This suggests a production setup can be either:
- **Cloud Run custom domain mappings per service**, or
- **HTTPS Load Balancer** in front, routing by hostname to backends

---

## Hosting / deployment overview

### GCP Cloud Run + Cloud Build (primary)

**Source of truth for what deploys**: the workspace-root `cloudbuild.yaml`.
> Note: `DEPLOY.md` is written from the “Kaana marketing deploy” perspective and says other apps aren’t deployed from this repo, but the current `cloudbuild.yaml` *does* build/deploy platform/inbox/CRM/clinic/API as separate Cloud Run services.

There are **three patterns** used in this workspace:

1) **Workspace root** `cloudbuild.yaml` (multi-service pipeline)
- Builds and deploys multiple Cloud Run services from subdirectories:
  - marketing (`./kaana`)
  - platform (`./kaana-platform`)
  - inbox (`./botiq`)
  - crm (`./propcrm`)
  - clinic (`./clinic-crm`)
  - api (`./botiq-whatsapp-server`)

2) **Per-project `gcp/` folder** (reusable templates)
- `dental-clinic/gcp/` deploys `dental-clinic` to Cloud Run
- `faralin/gcp/` deploys `faralin-web` and `faralin-api` to Cloud Run

3) **Domain/subdomain guide**
- `faralin/gcp/ANY_REPO_SUBDOMAIN_GUIDE.md` explains two options:
  - Cloud Run “Custom domains” (simpler)
  - HTTPS Load Balancer + static IP (works when domain mapping is region-limited)

### Render (secondary / alternative for API)

`render.yaml` is a Render Blueprint for deploying `botiq-whatsapp-server/` as `kaana-api` with a persistent disk mounted at `/data` (SQLite DB).

---

## Local access (run everything on your machine)

### Kaana suite (recommended local “full stack” flow)

Follow: `CLINIC_LOCAL.md` (it’s the most complete end-to-end local guide).

**Ports (local reference)**
- API: `http://localhost:3002` (base) / `http://localhost:3002/api` (API)
- Platform: `http://localhost:5180`
- Clinic desk: `http://localhost:5185`
- Inbox (optional): `http://localhost:5173`

**Minimal steps**

Backend API:
```bash
cd botiq-whatsapp-server
npm install
cp .env.example .env
# For local demo without real WhatsApp token:
echo "WHATSAPP_DRY_RUN=true" >> .env
npm run dev
```

Platform:
```bash
cd ../kaana-platform
npm install
npm run dev
```

Clinic desk:
```bash
cd ../clinic-crm
npm install
npm run dev
```

Optional inbox:
```bash
cd ../botiq
npm install
npm run dev
```

### Faralin (monorepo)

From `faralin/` root:
```bash
cd faralin
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev
```

Local URLs (from `faralin/README.md`):
- Web: `http://localhost:3000`
- API: `http://localhost:3001/api`
- Admin: `http://localhost:3002`

### Dental clinic marketing site

```bash
cd dental-clinic
npm install
npm run dev
```

Local URL: `http://localhost:3000` (configured in `dental-clinic/vite.config.ts`)

### Inventory/WMS (StockFlow) UI demo

```bash
cd inventory-wms
npm install
npm run dev -- --port 5174
```

Local URL: `http://localhost:5174`

---

## Global access (how to reach each app “on the internet”)

### Kaana suite — production hostnames

The root `cloudbuild.yaml` bakes in public URLs (substitutions) that define the intended production topology:
- `kaana-web` → `https://kaana.in`
- `kaana-platform` → `https://app.kaana.in`
- `kaana-inbox` → `https://inbox.kaana.in`
- `kaana-crm` → `https://crm.kaana.in`
- `kaana-clinic` → `https://clinic.kaana.in`
- `kaana-api` → `https://api.kaana.in`

**How to get the current Cloud Run URL (fallback URL)**

```bash
gcloud run services describe SERVICE_NAME \
  --region asia-south1 \
  --format='value(status.url)'
```

Replace `SERVICE_NAME` with:
- `kaana-web`
- `kaana-platform`
- `kaana-inbox`
- `kaana-crm`
- `kaana-clinic`
- `kaana-api`

### Faralin — production hostnames

From `faralin/gcp/README.md` and `faralin/gcp/cloudbuild.yaml`:
- Cloud Run service: `faralin-web` (intended domain: `https://faralin.kaana.in`)
- Cloud Run service: `faralin-api` (intended domain: `https://api.faralin.kaana.in`)

### Dental clinic — Cloud Run service

From `dental-clinic/gcp/cloudbuild.yaml`:
- Cloud Run service name: `dental-clinic` (region `asia-south1`)
- Domain mapping is not specified in the repo; use the Cloud Run `*.run.app` URL or map a custom domain in Cloud Run.

---

## Project-by-project details

### `kaana/` — Marketing site

- **Purpose**: Next.js marketing site for Kaana (`kaana.in`).
- **Tech**: Next.js 16 (App Router), React 19, Tailwind.
- **Local**:
  - `npm install && npm run dev`
  - URL: `http://localhost:3000`
- **Production**:
  - Deployed via Cloud Build → Cloud Run.
  - Container listens on `8080` (see `kaana/Dockerfile`).
  - Cloud Run service: `kaana-web`.

### `kaana-platform/` — Platform web app

- **Purpose**: Main Kaana platform SPA (links out to inbox/CRM/clinic, calls API).
- **Tech**: Vite + React, React Router.
- **Local**:
  - `npm install && npm run dev`
  - URL: `http://localhost:5180` (see `kaana-platform/vite.config.ts`)
- **Production**:
  - Built as static assets then served via Nginx on `8080` (see `kaana-platform/Dockerfile` + `nginx.conf`).
  - Cloud Run service: `kaana-platform`.
  - Build-time config via `VITE_*` args (API URL, billing URL, inbox URL, etc.) set by root `cloudbuild.yaml`.

### `botiq/` — Inbox web app

- **Purpose**: Inbox UI (WhatsApp-like conversations) for Kaana.
- **Tech**: Vite + React.
- **Local**:
  - `npm install && npm run dev`
  - URL: typically `http://localhost:5173` (Vite default; no fixed port configured)
- **Production**:
  - Static assets served via Nginx on `8080`.
  - Cloud Run service: `kaana-inbox`.
  - Build-time args: `VITE_WHATSAPP_API`, `VITE_PLATFORM_URL` (see `botiq/Dockerfile`).

### `propcrm/` — CRM web app

- **Purpose**: Real-estate CRM demo (pipeline, AI scoring, reports).
- **Tech**: Vite + React, `@dnd-kit/core`, Recharts.
- **Local**:
  - `npm install && npm run dev`
  - URL: typically `http://localhost:5173` (Vite default; consider `--port` if conflicts)
- **Production**:
  - Static assets served via Nginx on `8080`.
  - Cloud Run service: `kaana-crm`.
  - Build-time args: `VITE_WHATSAPP_API`, `VITE_PLATFORM_URL` (root `cloudbuild.yaml`).

### `clinic-crm/` — Clinic front desk

- **Purpose**: Clinic “desk” UI (appointments, patients, payments) for Kaana clinic vertical.
- **Tech**: Vite + React.
- **Local**:
  - `npm install && npm run dev`
  - URL: `http://localhost:5185` (see `clinic-crm/vite.config.ts`)
  - Vite dev proxy: `/api` → `http://localhost:3002` (so the desk can call the local API without CORS pain)
- **Production**:
  - Static assets served via Nginx on `8080`.
  - Cloud Run service: `kaana-clinic`.
  - Build-time args include `VITE_INBOX_URL` in addition to API/platform (see `clinic-crm/Dockerfile`).

### `botiq-whatsapp-server/` — Kaana API

- **Purpose**: Backend API for platform + WhatsApp bot/webhooks + demo flows.
- **Tech**: Node.js (ESM), Express, SQLite (`better-sqlite3`), JWT auth, WhatsApp provider (Meta/Twilio).
- **Local**:
  - `npm install`
  - `cp .env.example .env`
  - `npm run dev`
  - URL: `http://localhost:3002`
  - Health: `GET /health`
  - Routers:
    - `/api/platform` (platform APIs)
    - `/api/billing` (billing APIs)
    - `/api/demo` (local/demo endpoints like WhatsApp simulation)
    - `/api` (general API)
  - Webhooks:
    - `GET/POST /webhook/whatsapp` (Meta/Twilio inbound)
- **Production (GCP)**:
  - Cloud Run service: `kaana-api`
  - Runs on port `3002` (explicit in root `cloudbuild.yaml` deploy step)
  - Uses Secret Manager for JWT + WhatsApp tokens + admin credentials (see `cloudbuild.yaml` `--set-secrets`)
  - Uses a persistent SQLite file at `/data/kaana.db` and Litestream for backup/replication (see `botiq-whatsapp-server/Dockerfile` and `cloudbuild.yaml` envs)
- **Production (Render alternative)**:
  - `render.yaml` blueprint deploys the same service with a persistent disk mounted at `/data`.

### `dental-clinic/` — Dental clinic marketing site

- **Purpose**: Marketing site for Denta Care Dental Clinic (Visakhapatnam).
- **Tech**: TanStack Start + Nitro + Vite + Tailwind.
- **Local**:
  - `npm install && npm run dev`
  - URL: `http://localhost:3000` (set in `vite.config.ts`)
- **Production (GCP)**:
  - Cloud Run service name: `dental-clinic`
  - Build + deploy via:
    - `npm run gcp:bootstrap` (enables APIs + creates Artifact Registry repo)
    - `npm run gcp:deploy` (Cloud Build + Cloud Run deploy)
  - Container listens on `8080` (see `dental-clinic/Dockerfile`)

### `faralin/` — Student recognition & scholarship platform (monorepo)

- **Purpose**: University-backed student recognition and scholarship pathway platform.
- **Tech**:
  - Monorepo: pnpm workspaces + Turborepo
  - `apps/web`: Next.js 15
  - `apps/admin`: Next.js (admin)
  - `apps/api`: NestJS 11
  - DB: PostgreSQL + Prisma
  - Auth: Clerk
- **Local**:
  - Use `pnpm` from `faralin/` root (see section above).
  - Ports:
    - web `:3000`
    - api `:3001` (`/api`)
    - admin `:3002`
- **Production (GCP)**:
  - `faralin/gcp/cloudbuild.yaml` deploys:
    - `faralin-web` (Next.js standalone; port `8080`)
    - `faralin-api` (NestJS; port `8080`)
  - API deploy attaches a Cloud SQL instance and sets secrets for `DATABASE_URL` + Clerk (see `--add-cloudsql-instances` and `--set-secrets` in `faralin/gcp/cloudbuild.yaml`).
  - Domain mapping assumptions in `faralin/gcp/README.md`:
    - `faralin.kaana.in`
    - `api.faralin.kaana.in`

### `inventory-wms/` — StockFlow Inventory / WMS UI demo

- **Purpose**: Warehouse inventory dashboard demo (UI/UX + charts; no backend).
- **Tech**: Vite + React + Recharts.
- **Local**:
  - `npm install`
  - `npm run dev -- --port 5174`
  - URL: `http://localhost:5174`
- **Production**:
  - No Cloud Build / Docker / Cloud Run config found in this workspace for this project (it can be hosted similarly if needed).

### `ui-review/` — UI screenshots

- **Purpose**: A set of PNG screenshots for UI review/reference.
- **Local/Production**: Not applicable (no runnable project detected).

---

## What to check if something doesn’t work

- **Ports conflicting locally**: many Vite apps default to `5173` unless pinned; use `npm run dev -- --port <port>`.
- **Frontends calling wrong API locally**:
  - Prefer using the dev proxy where available (`clinic-crm` proxies `/api` to `localhost:3002`).
  - For other SPAs, set `VITE_WHATSAPP_API=http://localhost:3002/api` for local dev.
- **Cloud Run shows 502/failed health checks**:
  - Confirm container port matches deploy port (`8080` for SPAs/Next standalone; `3002` for kaana-api).
- **Domain not resolving / SSL pending**:
  - If Cloud Run custom domains aren’t available/allowed, use the HTTPS Load Balancer approach described in `faralin/gcp/ANY_REPO_SUBDOMAIN_GUIDE.md`.

