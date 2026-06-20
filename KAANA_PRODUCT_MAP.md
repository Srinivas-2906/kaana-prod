# Kaana — Product & UI Map

Internal reference for the full Kaana stack: marketing site, customer apps, API, design system, and roadmap.  
**Public domain:** [kaana.in](https://kaana.in) → deploy `kaana-platform`.

---

## Architecture

```
kaana-platform (5180)     Sign up · Login · Marketing · Dashboard · Admin
         ↓ JWT + SSO
botiq-whatsapp-server (3002)   Tenants · WhatsApp · SQLite · Billing · Tracking
         ↓
botiq (5174)              Team inbox
propcrm (5175)            Lead CRM
/listings?tenant=slug     Branded mini-site
```

| App | Port | Role |
|-----|------|------|
| **kaana-platform** | 5180 | Marketing + account + workspace hub + platform admin |
| **botiq-whatsapp-server** | 3002 | Multi-tenant API, WhatsApp bot, persistence, Razorpay |
| **botiq** | 5174 | Conversations inbox, agent handoff, analytics |
| **propcrm** | 5175 | Kanban CRM, follow-ups, reports |
| **Mini-site** | 3002/listings | Per-tenant catalog/listings page |

**Strategy:** One Kaana platform (one login, one billing, one admin). New channels (Instagram, QR ordering, web chat) are **connectors/modules** on the same core — not separate products.

---

## Customer journey

```
Visit kaana.in → Homepage lead OR Sign up → Questionnaire (/onboarding)
→ Admin activates (concierge) → Dashboard → Connect WhatsApp
→ BotIQ + CRM + mini-site → Razorpay upgrade
```

**Concierge mode (default):** `KAANA_SELF_SERVE=false` — tenant status `pending_onboarding` until admin activates.  
**Self-serve:** Set `KAANA_SELF_SERVE=true` in API `.env`.

**Admin:** `admin@kaana.ai` / `kaanaadmin` → `/admin`

**Alerts:** `srinivas@kaana.in` (signups, intakes, payments, homepage leads)

---

## Marketing website (`kaana-platform`)

### Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | HomePage | Primary conversion — WhatsApp-first |
| `/platform` | PlatformPage | Live vs soon capabilities + roadmap |
| `/industries` | IndustriesPage | 12 verticals + custom |
| `/pricing` | PricingPage | Trial / Starter / Growth / Pro |
| `/signup` | SignupPage | Account + industry + plan |
| `/login` | LoginPage | JWT; admins → `/admin` |
| `/onboarding` | OnboardingPage | 5-step intake questionnaire |
| `/dashboard` | DashboardPage | Customer workspace hub |
| `/admin` | AdminPage | Platform ops (Today, Overview, Leads, Businesses, Billing) |
| `/admin/tenants/:id` | AdminTenantPage | Single business detail |
| `/terms`, `/privacy` | Legal | Terms & privacy |

### Homepage sections (top → bottom)

| # | Component | Layout | Message |
|---|-----------|--------|---------|
| 1 | Hero + `HeroCommandCenter` | 2-col grid | “Never miss a WhatsApp lead again” · industry-aware demo |
| 2 | `TrustBar` | Marquee strip | Meta API, ~24h go-live, inbox, Razorpay |
| 3 | `WorkspaceSection` | Bento grid | One login, four apps |
| 4 | `StoryFlow` `#story-start` | 4 story steps + demos | Bot → Inbox → CRM → Mini-site |
| 5 | `SocialProof` | Text + lead form | Early access + name/WhatsApp capture |
| 6 | `ProductShowcase` `#features` | Tabbed demos | Bot / Inbox / CRM / Site per industry |
| 7 | `PlatformCapabilities` | Horizontal scroll | Live vs Soon feature cards |
| 8 | `RoadmapSection` `#roadmap` | 3-col dashed cards | Instagram DM, QR ordering, web chat — early access |
| 9 | `FAQ` | Accordion | 8 honest FAQs |
| 10 | Final CTA + `StickyCTA` | Fixed mobile bar | Start setup |

### Global shell

- **Navbar:** How it works, Product, Platform, Industries, Pricing, theme toggle, Log in, Start setup
- **UltimateBackground:** Green spotlights + vignette
- **Footer:** Links + legal
- **Theme:** Light default (Indian SMB); dark optional via `ThemeContext`
- **Tracking:** `POST /api/platform/track` + optional Plausible/GA env vars

### Copy system (`lib/onboarding.ts`)

| Key | Text |
|-----|------|
| Primary CTA | **Start setup** |
| Trial note | Early access · personal setup · no credit card |
| Hero roadmap | Starting with WhatsApp today. Instagram DM, QR ordering, web chat — same platform, early access next. |

### Roadmap data (`data/industries.ts`)

**PLATFORM_ROADMAP** (early access, not built yet):
- Instagram DM inbox
- QR table ordering (restaurants)
- Website chat widget

**PLATFORM_CAPABILITIES:** Live vs Soon labels for WhatsApp-era features (payments, broadcasts, analytics, etc.)

### Industries

12 configured verticals in `data/industries.ts` — each has hero messages, bot/inbox/CRM/mini-site demo content, showcase bullets. Used by `IndustryContext` across homepage demos.

---

## Design system

### Fonts (Google Fonts, `ultimate.css`)

| Role | Font | Weights |
|------|------|---------|
| Body / UI | **Inter** | 400, 500, 600 |
| Headlines / buttons | **Plus Jakarta Sans** | 500–800 |

### Typography tokens

- `--text-hero`: clamp(2.5rem, 5.2vw, 3.75rem)
- `--text-3xl`: section titles
- `--text-lg`: descriptions
- `.ultimate-kicker`: uppercase green label
- `.ultimate-accent`: green gradient text

### Colors (`tokens.css`)

- **Light (default):** `#f6f8f7` background, white surfaces, `#128c7e` / `#16a34a` accent
- **Dark:** `#0c0f0e` charcoal, `#25d366` accent
- **CTA:** Green gradient + glow + shimmer on `.btn-accent`

### Layout

- Container: `min(1200px, 92vw)`
- Section padding: `clamp(40px, 5vw, 64px)`
- Radius: 12–28px cards, 999px pill buttons
- Page top: 80px (fixed nav)

### CSS architecture

No Tailwind. Layered custom CSS:
- `tokens.css` — semantic colors/spacing
- `index.css` — base, buttons, glass, container
- `ultimate.css` — typography, fonts
- `light-contrast.css` — light-mode readability tweaks
- Per-component `*.css` files

---

## Supporting apps

### BotIQ (`botiq/` — :5174)

Team WhatsApp inbox: conversations, overview, bot builder preview, analytics, settings.  
Auth: SSO from platform via `postMessage` (`lib/sso.ts`).

### PropCRM (`propcrm/` — :5175)

Kanban pipeline, lead detail, properties, follow-ups, calendar, reports.  
Syncs with `GET/PATCH /api/leads`.

### API (`botiq-whatsapp-server/` — :3002)

| Area | Status |
|------|--------|
| Multi-tenant JWT auth | ✅ |
| WhatsApp Meta webhooks | ✅ |
| Conversations + messages | ✅ |
| CRM leads | ✅ |
| Industry catalog seeding | ✅ |
| Onboarding intake | ✅ |
| Razorpay billing | ✅ (demo without keys) |
| Mini-site `/listings` | ✅ |
| Pageview + lead tracking | ✅ |
| Email alerts (Resend optional) | ✅ |
| Admin queue + tenant detail | ✅ |

### Customer dashboard (`/dashboard`)

Locked until admin activates · WhatsApp connect form · Open BotIQ/CRM · mini-site link · analytics · upgrade.

### Platform admin (`/admin`)

| Tab | Function |
|-----|----------|
| Today | Setup pipeline + action queue |
| Overview | Visitors, signups, leads, revenue |
| Leads | Homepage form follow-up |
| Businesses | All tenants + stages |
| Billing | Razorpay orders |

---

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Node.js, Express, SQLite (better-sqlite3) |
| Auth | JWT, bcrypt |
| Payments | Razorpay |
| Email | Resend (optional) |
| Icons | Lucide via `KaanaIcons.tsx` |

### Key env vars

**kaana-platform:**
- `VITE_API_URL`, `VITE_BOTIQ_URL`, `VITE_CRM_URL`, `VITE_LISTINGS_URL`
- `VITE_WHATSAPP_LINK`, `VITE_PLAUSIBLE_DOMAIN`, `VITE_GA_MEASUREMENT_ID`

**botiq-whatsapp-server:**
- Meta WhatsApp tokens, `JWT_SECRET`, Razorpay keys
- `KAANA_NOTIFY_EMAIL=srinivas@kaana.in`
- `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`
- `KAANA_SELF_SERVE`, `KAANA_CONCIERGE_SPOTS`

---

## What we have built vs what is pending

Honest status as of **June 2026**. Use this for planning, pitching, and prioritising work.

### Summary

| Area | Built | Pending |
|------|-------|---------|
| Marketing site | ~95% | Production deploy, real WhatsApp link, optional analytics keys |
| Signup & onboarding | ~90% | Email verification, polish |
| Customer dashboard | ~80% | Embedded WhatsApp signup, richer usage UI |
| API & multi-tenant core | ~85% | Postgres at scale, usage metering |
| WhatsApp bot | ~75% | Token refresh UX, self-serve Meta connect |
| BotIQ inbox | ~70% | Full production hardening, some views demo-heavy |
| PropCRM | ~70% | Deeper API sync, industry-agnostic naming |
| Mini-site | ~60% | Custom domains, richer templates |
| Billing | ~70% | Live Razorpay keys, subscription management UI |
| Admin & tracking | ~85% | CSV export, Resend live emails |
| Future channels | ~5% | Instagram, QR ordering, web chat |

---

### 1. Marketing website (`kaana-platform`)

#### ✅ Built
- Full homepage: hero, trust bar, workspace bento, story flow, product showcase, capabilities scroll, roadmap section, FAQ, final CTA, sticky mobile CTA
- Pages: `/platform`, `/industries`, `/pricing`, `/terms`, `/privacy`
- 12 industry configs with live animated demos (bot, inbox, CRM, mini-site)
- Light/dark theme toggle (light default)
- Unified CTAs: “Start setup”, “Talk on WhatsApp” (mailto fallback)
- Homepage lead form (name + WhatsApp, no account)
- SEO: favicon, `robots.txt`, `sitemap.xml`, OG/Twitter meta, canonical
- Anonymous pageview tracking to API
- Optional Plausible / GA hooks (env-driven)
- SSO to BotIQ/CRM (no JWT in URL)
- Internal product map doc (`KAANA_PRODUCT_MAP.md`)
- Honest copy — no fake testimonials, logos, or inflated numbers

#### 🟡 Partial
- `VITE_WHATSAPP_LINK` not set → “Talk on WhatsApp” falls back to email
- Plausible/GA not configured until env vars added on deploy
- Some capability cards marked “Live” reflect backend capability; customer-facing UI for a few features is still basic

#### ❌ Pending
- Point **kaana.in** DNS to deployed site (Vercel/Hostinger)
- Production env vars for API, BotIQ, CRM, listings URLs
- Custom domain SSL on all apps
- Email verification on signup
- Blog / case studies (optional, not started)

---

### 2. Account, signup & onboarding

#### ✅ Built
- Signup: business name, owner, email, phone, password, industry, plan
- Login with JWT stored in `localStorage`
- Platform admin login → `/admin`
- 5-step onboarding questionnaire (`/onboarding`) saved to API
- Concierge mode: tenant `pending_onboarding` until admin activates
- Self-serve flag exists (`KAANA_SELF_SERVE=true`) — instant active tenant
- Concierge spot limit (`KAANA_CONCIERGE_SPOTS`)
- Post-signup redirect: onboarding or dashboard based on mode

#### 🟡 Partial
- Questionnaire UX works; admin must manually review and activate
- Password reset / forgot password — not built

#### ❌ Pending
- Email verification (Resend/Brevo)
- SMS OTP for phone (optional)
- Customer-facing “setup progress” tracker (beyond locked dashboard banner)
- Automated activation when self-serve is turned on at scale

---

### 3. Customer dashboard (`/dashboard`)

#### ✅ Built
- Workspace hub: tenant name, plan, status badges
- Locked state while concierge setup runs
- WhatsApp connect form (phone number ID + access token + number)
- Open BotIQ / PropCRM via SSO
- Mini-site preview link (`/listings?tenant=slug`)
- Analytics snapshot when tenant is live
- Razorpay checkout for plan upgrade (demo mode without keys)
- Link to edit questionnaire, contact hello@kaana.in

#### 🟡 Partial
- WhatsApp connect is manual (paste Meta credentials) — not guided Embedded Signup
- Analytics shown only when live; limited metrics

#### ❌ Pending
- Meta Embedded Signup (self-serve WhatsApp onboarding)
- In-dashboard setup checklist (“Connect WhatsApp → Test bot → Share mini-site”)
- Team invite / multi-user management UI
- Usage limits UI (bot replies remaining, etc.)

---

### 4. API & backend (`botiq-whatsapp-server`)

#### ✅ Built
- Multi-tenant SQLite: tenants, users, subscriptions, conversations, messages, leads, catalog, intake
- JWT auth, bcrypt passwords, platform admin role
- Signup, login, `/me`, tenant settings
- WhatsApp Meta webhook → inbound messages → bot replies
- Per-tenant `whatsapp_phone_id` routing
- Industry catalog templates seeded on activate/signup
- Conversations API, send message, leads CRUD
- Onboarding intake GET/POST
- Razorpay create-order + verify (demo mode without keys)
- Mini-site static listings per tenant
- Site event tracking (`site_events`)
- Homepage leads table (`site_leads`) with status + notes
- Platform notifications log + email to `srinivas@kaana.in`
- Admin: queue, overview, leads, tenants, billing, tenant detail, activate, notes
- CORS, health endpoint
- 12 industry bot templates in conversation flow

#### 🟡 Partial
- Meta access token expires — manual refresh in `.env` (no in-app rotation)
- SQLite fine for early clients; not production-scale yet
- OpenAI usage not metered per tenant
- Broadcasts/reminders APIs exist; limited customer UI

#### ❌ Pending
- Postgres migration for scale
- Meta Embedded Signup OAuth flow
- Automated token health monitoring + admin alerts
- Per-tenant usage metering and plan enforcement
- Webhook retry / dead-letter queue
- API rate limiting
- Automated backups

---

### 5. BotIQ inbox (`botiq/` — :5174)

#### ✅ Built
- Login gate with SSO from kaana-platform
- Conversations view — live threads from API
- Overview, analytics, settings views
- Bot builder preview
- Live phone-frame chat preview
- Sidebar navigation, toast notifications
- Polling/refetch for conversations

#### 🟡 Partial
- Some views still demo/mock-heavy alongside live API data
- Bot builder is preview-oriented, not full visual flow editor

#### ❌ Pending
- Production deploy on custom subdomain
- Push notifications / real-time (WebSocket) instead of polling
- Full bot flow editor for customers
- Multi-agent assignment UI polish
- Mobile-responsive inbox for agents on phone

---

### 6. PropCRM (`propcrm/` — :5175)

#### ✅ Built
- Login gate with SSO
- Kanban pipeline with drag-and-drop
- Lead table, lead detail sidebar
- Stats cards, AI summary card (UI)
- Properties view, follow-ups, calendar, reports, settings
- Syncs leads from API (`GET /api/leads`, stage PATCH writeback)

#### 🟡 Partial
- Still named/branded “PropCRM” internally — works for all industries but copy is real-estate leaning in places
- Calendar/follow-ups partly UI-first

#### ❌ Pending
- Industry-neutral rebrand in UI (“Kaana CRM”)
- Full two-way sync for all lead fields
- Customer-configurable pipeline stages
- WhatsApp click-to-chat from lead card (deep link)
- Production deploy

---

### 7. Mini-site (`/listings?tenant=slug`)

#### ✅ Built
- Static branded listings/catalog page per tenant
- Served from API server
- Industry-seeded catalog items on tenant activate
- WhatsApp CTA on items (conceptually)

#### 🟡 Partial
- Basic template — not fully customisable by customer yet
- Only reachable via query param, not `{slug}.kaana.in`

#### ❌ Pending
- Custom domain per tenant (`properties.clientname.com`)
- Theme editor (logo, colours, fonts)
- Restaurant menu layout (for QR ordering future)
- SEO per mini-site

---

### 8. Billing & payments

#### ✅ Built
- Plans API: Trial, Starter ₹1,499, Growth ₹3,999, Pro ₹7,999
- Pricing page with API fallback plans
- Razorpay checkout from dashboard
- Demo mode: activates plan without real keys
- Subscriptions stored in DB
- Admin billing tab + payment notifications

#### 🟡 Partial
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` not set in prod → demo mode only
- No customer invoice history UI
- No dunning / failed payment retry

#### ❌ Pending
- Live Razorpay account + production keys
- GST invoices
- Subscription cancel/downgrade UI
- Admin MRR dashboard improvements

---

### 9. Admin & business ops (`/admin`)

#### ✅ Built
- **Today:** setup pipeline counts + action queue (activate, follow-up, WhatsApp pending, trial expiry, new leads)
- **Overview:** pageviews, signups, leads, revenue, top pages, recent alerts/visits/leads/payments
- **Leads:** homepage form list, status dropdown, WhatsApp link, mark contacted
- **Businesses:** all tenants with stage, link to detail
- **Billing:** subscription orders
- **Tenant detail:** contact, intake, usage, notes, activate, open apps
- Email/log alerts to srinivas@kaana.in on signup, intake, payment, homepage lead

#### 🟡 Partial
- Emails log to console + DB until `RESEND_API_KEY` set
- “Failed to fetch” if API server not running locally

#### ❌ Pending
- CSV export (leads, tenants)
- Assign Kaana team member per tenant
- In-admin WhatsApp send (currently opens wa.me)
- Automated trial expiry emails to customers

---

### 10. Future platform modules (roadmap — not built)

These are on the marketing site as **Early access** only:

| Module | Status | Notes |
|--------|--------|-------|
| Instagram DM inbox | ❌ Not started | Same inbox/CRM abstraction planned |
| QR table ordering | ❌ Not started | Restaurant module; orders → CRM |
| Website chat widget | ❌ Not started | Embeddable on kaana.in / mini-site |
| Reviews & feedback | ❌ Not started | Marked “Soon” on platform page |
| Multi-location / franchise | ❌ Not started | Marked “Soon” on platform page |

---

### 11. Infrastructure & go-live

#### ✅ Built
- Local dev stack documented (`GO_LIVE.md`)
- All apps build successfully (Vite + TypeScript)
- `.env.example` files for API and marketing site

#### ❌ Pending (blockers for first paying client)
- [ ] Deploy kaana-platform → Vercel (or Hostinger)
- [ ] Deploy API → Render with persistent disk
- [ ] Deploy BotIQ + CRM → Vercel/Netlify
- [ ] Point kaana.in DNS
- [ ] Set production `VITE_*` URLs
- [ ] Valid Meta WhatsApp token + webhook on public HTTPS URL
- [ ] Razorpay live keys
- [ ] Resend for transactional + alert emails
- [ ] Set `VITE_WHATSAPP_LINK` to real business WhatsApp
- [ ] SSL everywhere, backup strategy for SQLite/DB

---

### Suggested priority order (next 2–4 weeks)

1. **Go live:** deploy stack + kaana.in + API + valid WhatsApp token + Resend  
2. **First 3 clients:** use admin Today tab + manual activation (concierge)  
3. **WhatsApp:** Meta Embedded Signup or better connect wizard  
4. **Billing:** live Razorpay  
5. **CRM polish:** Kaana CRM naming, WhatsApp from lead card  
6. **Then:** pick one roadmap module (QR ordering *or* Instagram) based on inbound demand  

---

## kaana.in deployment

1. Deploy **kaana-platform** to Vercel (root `kaana-platform`, output `dist`)
2. Point **kaana.in** DNS to Vercel
3. Deploy API to Render with persistent disk for SQLite
4. Set `VITE_*` URLs to production API and app URLs
5. Keep message consistent: **WhatsApp now**, others early access on `/platform` and `#roadmap`

See also: [GO_LIVE.md](./GO_LIVE.md)

---

*Last updated: June 2026 — update this doc when routes, capabilities, or architecture change.*
