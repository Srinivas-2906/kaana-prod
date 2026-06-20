# Kaana — Launch Readiness & Execution Plan

**Goal:** First 3–10 paying customers · Manual onboarding · Lowest cost · Fast launch  
**Constraints:** No niche lock-in · No AI/Instagram/QR/web chat · SQLite · No enterprise infra  
**Last reviewed:** June 2026

---

# PART 1 — Launch blockers checklist

## Critical blockers (fix before taking money)

| # | Blocker | Impact | Fix |
|---|---------|--------|-----|
| 1 | **Not deployed to production** | No real customers | Deploy API + marketing + BotIQ + CRM (Part 6) |
| 2 | **Meta token expired / invalid** | Bot cannot reply | Refresh `WHATSAPP_ACCESS_TOKEN`, restart API |
| 3 | **`PUBLIC_URL` not HTTPS production URL** | Webhooks fail, listings broken | Set Render URL in `.env` |
| 4 | **`VITE_WHATSAPP_LINK` empty** | “Talk on WhatsApp” opens email — trust killer | Set `wa.me/91XXXXXXXXXX` on marketing site |
| 5 | **JWT_SECRET default in prod** | Account takeover risk | Generate 32+ char secret in production env |
| 6 | **Razorpay not configured** | Demo billing only; customers think they paid | Add live `RAZORPAY_KEY_ID/SECRET` OR invoice manually for first 3 |
| 7 | **Billing blocked until `active`** | Can't pay while pending — OK for concierge, but must activate before payment ask | Admin activates → then send payment link |
| 8 | **SSO cross-origin in production** | Inbox/CRM won't open from dashboard | Set `VITE_PLATFORM_URL`, `VITE_BOTIQ_URL`, `VITE_CRM_URL` to prod origins |
| 9 | **No SQLite backup** | One disk failure = all customers gone | Daily cron: copy `data/kaana.db` to S3/R2 or Render disk snapshot |
| 10 | **API must be running** | Admin “Failed to fetch”, signup fails | UptimeRobot + process manager on Render |

## High priority (fix in week 1)

| # | Issue | Fix |
|---|-------|-----|
| 11 | Onboarding is 5 steps / 10+ min | Reduce to 3 steps (Part 3) |
| 12 | Locked dashboard feels broken | Rewrite copy + “We’ll WhatsApp you in 24h” + your phone number |
| 13 | WhatsApp connect is developer-grade (Phone Number ID + token) | **You** connect via admin/DB for first 10 — hide form or label “We do this for you” |
| 14 | `RESEND_API_KEY` not set | Alerts only in console — add Resend for signup/payment alerts |
| 15 | Pricing features mismatch (UI vs API `/plans`) | Single source in API; frontend reads only |
| 16 | FAQ says “includes GST” | Remove until GSTIN + invoices ready |
| 17 | PropCRM branding | Rename display strings to “Kaana CRM” |
| 18 | No password reset | Manual reset via admin/DB for now; document process |
| 19 | CORS `*` on API | Restrict to kaana.in + app subdomains when deployed |
| 20 | End-to-end test tenant missing | Create 1 demo tenant you can show in 2 minutes |

## Medium priority (before customer 11)

| # | Issue |
|---|-------|
| 21 | Plan limit enforcement (bot replies) — honor manually first |
| 22 | Razorpay webhook handler is stub (`received: true` only) |
| 23 | Homepage too long — merge demo sections |
| 24 | Admin panel fails silently when API down — better error message |
| 25 | Mini-site looks basic — acceptable for v1 |
| 26 | Bot builder / analytics views in BotIQ — don’t sell these yet |

## Nice-to-have (ignore until 10 paying)

| # | Item |
|---|------|
| 27 | CSV export from admin |
| 28 | Meta Embedded Signup |
| 29 | Email verification on signup |
| 30 | Postgres migration |
| 31 | Real-time WebSocket inbox |
| 32 | Custom mini-site domains |

---

# PART 2 — Homepage conversion audit

## Hero

**Current issue:** Generic headline; 3 CTAs; “Preview” badge contradicts “Official API”; roadmap line dilutes focus; jargon (bot, inbox, CRM, mini-site).

**Recommended change:** One outcome, one primary CTA, one trust line. Remove Preview badge. Remove roadmap from hero.

**Replacement copy:**
- **Kicker:** `WhatsApp for business`
- **Headline:** `Never miss a WhatsApp lead again`
- **Subheadline:** `We reply to your customers on WhatsApp, track every enquiry, and help you follow up — even when you're busy.`
- **Fine print:** `Early access · We set it up for you · No credit card`
- **Primary CTA:** `Start free setup`
- **Secondary CTA:** `Talk to us on WhatsApp` (must be real wa.me link)
- **Remove:** Third CTA “See how it works” from hero — keep in nav only
- **Stats row (replace):**
  - `WhatsApp` / Official Business API
  - `1 login` / Inbox + leads in one place
  - `~24 hrs` / Setup by our team (change “target go-live” to “Setup by our team”)

---

## Navigation

**Current issue:** “Product” hash link unclear; too many top-level items.

**Recommended change:** Simplify labels.

| Current | Replace with |
|---------|--------------|
| How it works | How it works |
| Product | See demo |
| Platform | What's included |
| Industries | Who it's for |
| Pricing | Pricing |
| Start setup → | Start free setup |

---

## Trust bar (marquee)

**Current issue:** Self-asserted claims.

**Replacement items:**
- Meta WhatsApp Business API
- Built for Indian businesses
- Razorpay payments
- Personal setup included

---

## Workspace section (“One login, four apps”)

**Current issue:** “Four apps” is jargon.

**Replacement:**
- **Kicker:** `What you get`
- **Title:** `Everything in one place`
- **Desc:** `After signup, you get a shared WhatsApp inbox, a lead list, and a simple page to share your services — we connect it all for you.`
- **Cards:** Rename to plain language:
  - Kaana Inbox → **Team inbox** — “See and reply to WhatsApp messages with your staff”
  - Kaana CRM → **Lead list** — “Every enquiry saved with name and stage”
  - Mini-site → **Share page** — “One link with your services and WhatsApp button”
  - Billing → keep
  - Remove “One login” card (redundant)

---

## StoryFlow + ProductShowcase (demo sections)

**Current issue:** Two large demo sections — duplicate message, long scroll.

**Recommended change:** **Keep StoryFlow only.** ProductShowcase becomes optional or homepage shows StoryFlow + link “See demo for your industry →” to `/#features` or `/industries`.

**StoryFlow step copy (simplify):**
1. **Customer messages on WhatsApp** — “Auto-replies to common questions”
2. **Your team replies in one inbox** — “No more sharing one phone”
3. **Leads saved automatically** — “Name, number, and status in one list”
4. **Share your services link** — “Send catalog in chat or ads”

---

## Social proof + lead form

**Current issue:** Two conversion paths (signup vs lead form).

**Recommended change:** Keep both but clarify:
- **Headline:** `Not ready to create an account?`
- **Sub:** `Leave your WhatsApp number — we'll call you on WhatsApp to explain setup.`
- Primary on section: lead form
- Secondary: `Or start setup yourself →`

---

## PlatformCapabilities (homepage scroll)

**Current issue:** Too many “Live” cards on homepage.

**Recommended change:** **Remove from homepage.** Link: “See all features →” to `/platform`.

---

## Roadmap section

**Current issue:** Instagram/QR/web chat — out of scope per launch constraints.

**Recommended change:** **Remove `#roadmap` section entirely** until built. Mention nothing on homepage about future channels for launch.

---

## Pricing (page)

**Current issue:** Trial + paid tiers while concierge; GST claim; feature mismatch.

**Replacement header:**
- **Title:** `Simple pricing for WhatsApp businesses`
- **Sub:** `Start free for 14 days. Pay when you're live and getting leads. Setup help included during early access.`

**Plan copy:**
- **Trial:** `₹0 · 14 days` — Bot replies, inbox, lead list, share page, personal setup
- **Starter:** `₹1,499/month` — 1 WhatsApp number, 500 bot replies, 2 team members, email support
- **Setup note (new line under grid):** `Early access includes one-time setup help. Optional setup fee may apply for complex flows — we'll confirm before you pay.`

**Remove:** “includes GST” from FAQ until compliant.

---

## FAQ (top 3 to rewrite)

**Q: Do I need WhatsApp Business API already?**  
**A:** No. Tell us your WhatsApp number in setup. We help you connect the official API — usually within 1–3 working days after Meta verification.

**Q: What happens after I sign up?**  
**A:** You fill a short form (about 5 minutes). Our team configures your replies, inbox, and lead list, then WhatsApps you when ready.

**Q: Is this only for one industry?**  
**A:** No. Any business that gets customers on WhatsApp — clinics, salons, coaches, shops, brokers, schools, and more.

---

# PART 3 — Simplified onboarding (under 5 minutes)

## Target flow

```
Signup (2 min) → Questionnaire (3 min, 3 steps) → Thank you → Dashboard (locked) → You activate → Customer goes live
```

## New 3-step questionnaire

### Step 1 — Your business (required, ~1 min)

| Field | Required | Notes |
|-------|----------|-------|
| What does your business do? | Yes | textarea |
| Main services/products (list with prices if known) | Yes | textarea |
| City / area | Yes | input |

**Remove from customer form:** target customers (optional in call), price range separate field

### Step 2 — WhatsApp (required, ~1 min)

| Field | Required | Notes |
|-------|----------|-------|
| Business WhatsApp number | Yes | prefill from signup phone |
| Business hours | Yes | e.g. Mon–Sat 10–8 |
| Top 3 questions customers ask | Yes | textarea, 3 lines min |

**Move to manual call:** Meta Business account, team size, agent names

### Step 3 — Finish (required, ~30 sec)

| Field | Required | Notes |
|-------|----------|-------|
| What should WhatsApp handle? | Yes | chips: FAQs, Bookings, Orders, Share catalog, Payment link |
| Anything else? | No | one optional textarea |

**Remove from customer form entirely (manual call / admin notes):**
- bot tone (default: friendly)
- brand notes (ask on call)
- custom requests long form
- hasMetaBusiness
- needsBooking (infer from use cases)

## Thank-you screen copy

**Replace:**
> Thank you — we received your details. **We'll WhatsApp you within 24 hours** on the number you provided when your setup is ready. Questions? Message us on WhatsApp at [number].

## Signup form simplification

| Keep | Change |
|------|--------|
| Business name, name, email, phone, industry, password | Phone label: “WhatsApp number” |
| | Password min 8 chars message |
| | Remove “Self-serve unlocks later” line |

---

# PART 4 — Product readiness (KEEP / REMOVE / POSTPONE / BUILD NOW)

## Dashboard

| Feature | Action |
|---------|--------|
| Workspace hub + plan status | **KEEP** |
| Locked banner | **KEEP** — rewrite copy (Part 2) |
| Open Inbox / CRM via SSO | **KEEP** — fix prod URLs |
| Mini-site link | **KEEP** |
| Stats when live | **KEEP** |
| WhatsApp connect form (token/phone ID) | **POSTPONE** for customers — **you** set in DB/admin |
| Billing upgrade buttons | **KEEP** — after activation only |
| Setup checklist (3 items) | **BUILD NOW** — “Submitted ✓ → We configure → You're live ✓” |

## Inbox (BotIQ)

| Feature | Action |
|---------|--------|
| Conversations list + thread view | **KEEP** |
| Send reply | **KEEP** — must work reliably |
| SSO login | **KEEP** |
| Overview / analytics views | **POSTPONE** — hide from sidebar |
| Bot builder view | **REMOVE** from nav or label “Preview only” |
| Live preview panel | **POSTPONE** |
| Settings | **KEEP** minimal |

## CRM (PropCRM)

| Feature | Action |
|---------|--------|
| Kanban pipeline | **KEEP** |
| Lead detail sidebar | **KEEP** |
| API sync from WhatsApp | **KEEP** |
| Rename to Kaana CRM | **BUILD NOW** (copy only) |
| WhatsApp link on lead | **BUILD NOW** — wa.me with phone |
| Properties view | **POSTPONE** — hide unless real-estate tenant |
| Calendar / reports / follow-ups | **POSTPONE** |
| AI summary card | **REMOVE** from dashboard |

## Mini-site

| Feature | Action |
|---------|--------|
| `/listings?tenant=slug` | **KEEP** |
| Industry catalog from seed | **KEEP** |
| Custom branding | **POSTPONE** — manual CSS/settings for first 10 |
| Custom domain | **POSTPONE** |

## Admin panel

| Feature | Action |
|---------|--------|
| Today queue | **KEEP** — your daily driver |
| Activate tenant | **KEEP** |
| Tenant detail + intake | **KEEP** |
| Leads (homepage form) | **KEEP** |
| Overview stats | **KEEP** |
| Billing tab | **KEEP** |
| CSV export | **POSTPONE** |

---

# PART 5 — WhatsApp readiness

## Production setup checklist

- [ ] Meta Business Manager verified (Kaana + client businesses separate)
- [ ] WhatsApp Business Account created
- [ ] Cloud API app in Meta Developer Console
- [ ] System user or long-lived token for **your** BSP flow
- [ ] Per-client: phone number added OR migration planned (warn: loses consumer app history)
- [ ] `WHATSAPP_ACCESS_TOKEN` valid (rotate before expiry — set calendar reminder)
- [ ] `WHATSAPP_PHONE_NUMBER_ID` per tenant in DB OR shared number with routing for v1
- [ ] `WHATSAPP_VERIFY_TOKEN` set — same in Meta webhook config
- [ ] Webhook URL: `https://api.kaana.in/webhook` (GET verify + POST messages)
- [ ] Subscribe to `messages` field
- [ ] `PUBLIC_URL` and `LISTINGS_BASE_URL` = production API URL
- [ ] Test: send message to number → appears in BotIQ → bot replies → lead in CRM

## Embedded Signup

**Verdict: POSTPONE.** Not needed for first 10. You configure Meta for each client on a call + screen share.

## Token management (practical v1)

1. Store per-tenant token in `tenants.whatsapp_token` (already exists)
2. **You** paste token when activating tenant — not customer
3. Add startup check: log warning if token invalid (already exists)
4. Document: refresh token every 60 days — calendar alert
5. Optional **BUILD NOW:** admin field on tenant detail “WhatsApp token” (masked)

## Webhook reliability (minimal)

1. Return 200 immediately on webhook POST (already does)
2. Log failed handler errors to file or console
3. **BUILD NOW:** persist raw webhook payload on error for replay
4. **POSTPONE:** queue/retry system

---

# PART 6 — Deployment plan (cheapest reliable)

## Architecture: 0–10 customers

```
kaana.in          → Vercel (marketing)           Free/Hobby
app.kaana.in      → Vercel (BotIQ + CRM paths or subdomains)  Free
api.kaana.in      → Render Web Service $7/mo + 1GB disk $0.25
SQLite            → /data/kaana.db on Render disk
Email             → Resend free tier (3k/mo)
Monitoring        → UptimeRobot free + Sentry free
Backups           → Daily scp/curl copy of DB to Google Drive or R2
SSL               → Included (Vercel + Render)
WhatsApp          → Meta Cloud API direct (no BSP fee)
```

## Architecture: 10–100 customers

Same stack. Upgrade when needed:
- Render → $25/mo instance if CPU/RAM tight
- Resend paid if >3k emails
- Still SQLite until ~50 paying OR corruption scares you
- **Do not** add Postgres until pain is real

## Monthly cost estimates

| Item | 0–10 customers | 10–100 customers |
|------|----------------|------------------|
| Vercel | ₹0–800 | ₹0–1,600 |
| Render API + disk | ₹600–1,200 | ₹2,000–4,000 |
| Domain | ₹80 | ₹80 |
| Resend | ₹0 | ₹0–800 |
| UptimeRobot / Sentry | ₹0 | ₹0 |
| Meta conversation fees | ₹500–3,000 | ₹5,000–25,000 |
| **Total (excl. Meta pass-through)** | **₹700–2,500/mo** | **₹2,500–8,000/mo** |

## Env vars checklist (production)

**API:** `JWT_SECRET`, `PUBLIC_URL`, `WHATSAPP_*`, `RAZORPAY_*`, `KAANA_NOTIFY_EMAIL`, `RESEND_API_KEY`, `PLATFORM_ADMIN_*`

**Marketing:** `VITE_API_URL`, `VITE_BOTIQ_URL`, `VITE_CRM_URL`, `VITE_LISTINGS_URL`, `VITE_WHATSAPP_LINK`

**BotIQ/CRM:** `VITE_PLATFORM_URL`, `VITE_WHATSAPP_API`

---

# PART 7 — Revenue readiness

## Current pricing problem

- ₹1,499/mo **too low** for manual setup labor
- Customers **cannot pay** while `pending_onboarding` (correct for concierge)
- Demo Razorpay creates false “paid” state

## Recommended pricing (first 10 customers)

| Offer | Price | Notes |
|-------|-------|-------|
| **Founding trial** | ₹0 / 14 days | Full setup included |
| **Founding member** | **₹999/mo** for first 3 months, then ₹1,499 | Reward early trust |
| **Setup fee** | **₹0 for first 3**, then **₹2,999 one-time** | Say it verbally after 3 |
| **Payment timing** | After go-live + 7 days of use | Not at signup |

## Trial strategy

- No credit card at signup ✓
- Trial starts at **activation**, not signup (fairer — they get 14 days of real usage)
- **BUILD NOW:** set `trial_ends_at` on admin activate, not signup

## Early access strategy

- Cap: **10 concierge slots** (already in config)
- Show “X slots left” on signup ✓
- When full: lead form only + waitlist
- **You** WhatsApp every signup within 2 hours — non-negotiable

## Unit economics target

| Metric | Target |
|--------|--------|
| Setup time | ≤3 hours per client (reuse templates) |
| Support | ≤2 hrs/month per client in first 30 days |
| Churn | Expect 1 of first 3 to churn — learn why |
| CAC | ₹0 — network + WhatsApp outreach only (no ads yet) |

## What to upsell later (not now)

- Growth plan (more replies)
- Extra WhatsApp number
- Custom flows
- Setup for complex catalog

---

# PART 8 — Execution plans

## 7-day launch plan

| Day | Tasks |
|-----|-------|
| **1** | Set `VITE_WHATSAPP_LINK`; fix Meta token; deploy API to Render; backup script |
| **2** | Deploy kaana.in on Vercel; all `VITE_*` prod URLs; smoke test signup |
| **3** | Deploy BotIQ + CRM; test SSO end-to-end; create demo tenant |
| **4** | Razorpay live OR document manual UPI for first 3; Resend for alerts |
| **5** | Shorten onboarding to 3 steps (code); dashboard copy; CRM rename |
| **6** | Homepage copy pass (Part 2 hero + remove roadmap section); pricing FAQ fix |
| **7** | Full E2E test with friend’s business; fix blockers; **reach out to 10 businesses on WhatsApp** |

**Day 7 success metric:** 1 signed up + questionnaire complete (not necessarily paid).

## 30-day plan

| Week | Focus |
|------|-------|
| **1** | Launch + 3 design partners (discounted/free trial) |
| **2** | Activate all 3; daily WhatsApp check-ins; fix inbox/CRM bugs |
| **3** | Ask for payment from happiest user; collect testimonial screenshot |
| **4** | 5 more outreach conversations; 1 case study on site; tighten onboarding from learnings |

**30-day success metric:** **3 paying** OR **3 live with payment committed**.

## 60-day plan

| Week | Focus |
|------|-------|
| **5–6** | 7 more customers via referrals + WhatsApp status; introduce ₹2,999 setup fee for new |
| **7–8** | Trial starts at activation; basic plan limits documented; consider Render upgrade if slow |

**60-day success metric:** **10 paying customers** OR clear reason why not (document objections).

---

# Implementation priority (code changes)

If implementing from this doc, do in this order:

1. `VITE_WHATSAPP_LINK` + contact.ts verified
2. Production deploy + env vars
3. Onboarding 5→3 steps
4. Dashboard locked copy + setup checklist
5. Homepage hero copy + remove roadmap section from homepage
6. CRM display name “Kaana CRM”
7. Trial starts on activate (backend)
8. Pricing/FAQ GST + feature sync
9. Admin tenant WhatsApp token field (optional)
10. Lead card wa.me link in CRM

---

*Brutally practical: revenue beats perfection. Delete before you build.*
