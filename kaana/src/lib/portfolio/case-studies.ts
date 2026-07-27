import type { CaseStudy } from "./types";

const PORTFOLIO_ORDER = [
  "creator-commerce-operations-platform",
  "kaana-business-automation-suite",
  "student-recognition-platform",
  "healthcare-clinic-digital-suite",
  "restaurant-digital-menu",
  "retail-commerce-storefront",
  "firebase-productivity-pwa",
  "inventory-operations-demo",
  "offline-aquaculture-operations",
] as const;

const caseStudyEntries: CaseStudy[] = [
  {
    slug: "kaana-business-automation-suite",
    title: "Multi-Tenant Business Automation Suite",
    subtitle: "WhatsApp-first operations for clinics, CRM, and customer inbox — one platform, many tenants",
    category: "SaaS Platform",
    featured: true,
    confidential: false,
    solutionTags: ["multi-tenant", "whatsapp-automation", "operations", "ai-automation"],
    industryTags: ["saas", "healthcare"],
    heroImage: "/portfolio/kaana-platform-desktop.png",
    galleryImages: [
      { label: "BotIQ WhatsApp inbox", src: "/portfolio/botiq-inbox-ui.png" },
      { label: "PropCRM lead pipeline", src: "/portfolio/propcrm-ui.png" },
      { label: "Clinic front-desk app", src: "/portfolio/clinic-crm-ui.png" },
      { label: "Kaana marketing site", src: "/portfolio/kaana-platform-desktop.png" },
    ],
    homePreview: {
      category: "SaaS Platform",
      title: "Multi-tenant WhatsApp business operations suite",
      excerpt:
        "Marketing site, customer dashboard, inbox, CRM, clinic desk, and API — one platform provisioning unlimited tenants on GCP.",
      image: "/portfolio/botiq-inbox-ui.png",
      images: [
        "/portfolio/botiq-inbox-ui.png",
        "/portfolio/propcrm-ui.png",
        "/portfolio/clinic-crm-ui.png",
        "/portfolio/kaana-platform-desktop.png",
      ],
    },
    summary:
      "We designed and delivered an end-to-end digital operations suite: marketing site, customer dashboard, WhatsApp inbox, CRM pipeline, clinic front-desk, and a shared API — all multi-tenant from day one.",
    context:
      "Small and mid-sized businesses in India need WhatsApp as their primary customer channel, but stitching together inbox, CRM, appointments, and billing across disconnected tools creates chaos. Kaana needed a unified system where each client gets their own workspace without deploying separate infrastructure per tenant.",
    scenario:
      "A dental clinic group wants to run marketing on their own domain, manage leads in a CRM, handle WhatsApp conversations in a shared inbox, and operate daily patient flow from a front-desk app — while the platform owner provisions new clinics in minutes from an admin console.",
    constraints: [
      "Multi-tenant isolation via JWT and hostname-based tenant context",
      "Single backend API serving inbox, CRM, clinic, and platform apps",
      "Production deployment on GCP Cloud Run with custom domains per product",
      "WhatsApp Business API (Meta) integration with webhook verification",
      "Wildcard subdomain routing for per-tenant URLs (e.g. tenant.inbox, tenant.crm, tenant.clinic)",
      "Low ops overhead — serverless containers, Secret Manager for credentials",
    ],
    solution: [
      "Built six coordinated applications: marketing (Next.js), platform dashboard, BotIQ inbox, PropCRM pipeline, clinic desk, and Express API backend",
      "Implemented platform-admin provisioning API to create tenants, default admin users, and product links in one call",
      "Wired WhatsApp Meta provider with conversation routing, lead capture, clinic booking flows, and broadcast support",
      "Deployed all services to GCP via Cloud Build with environment-specific VITE build args and Secret Manager bindings",
      "Configured global HTTPS load balancer with host-based routing to route 15+ custom domains to the right Cloud Run service",
      "Added Razorpay-ready billing hooks, Resend email, and JWT auth with username-or-email login per tenant",
    ],
    architecture: [
      "Internet → Global HTTPS Load Balancer (single static IP) → URL map routes by hostname",
      "Cloud Run services (asia-south1): web, platform, inbox, CRM, clinic, API — each behind serverless NEGs",
      "Shared API (SQLite + GCS backup bucket) handles auth, tenants, WhatsApp webhooks, leads, appointments, analytics",
      "Frontends receive build-time API URLs; locally proxied to port 3002 for full-stack dev",
      "Optional Render blueprint for API with persistent disk as alternative hosting path",
    ],
    integrations: [
      "Meta WhatsApp Business API (messages, webhooks, phone number ID, verify token)",
      "Razorpay payment keys (platform billing)",
      "Resend transactional email",
      "Firebase (optional clinic auth overrides)",
    ],
    reliability: [
      "Secret Manager for JWT, WhatsApp tokens, admin credentials — never in source",
      "Health check endpoint on API; Cloud Run min/max instance tuning per service",
      "Tenant slug validation on login; platform admin vs tenant user role separation",
    ],
    outcomes: [
      "One codebase serves unlimited tenants — no per-client deployment",
      "Clinic, CRM, and inbox share conversation and lead data through one API",
      "Live production stack on kaana.in subdomains with SSL managed certificates",
      "Platform admin can provision a new client with default credentials and deep links in under a minute",
    ],
    stack: [
      { label: "Frontend", items: ["Next.js 16", "React 19", "Vite", "TypeScript", "Tailwind CSS"] },
      { label: "Backend", items: ["Node.js", "Express", "SQLite", "better-sqlite3", "JWT", "bcrypt"] },
      { label: "Integrations", items: ["Meta WhatsApp API", "Razorpay", "Resend", "Twilio (optional)"] },
      { label: "Infrastructure", items: ["GCP Cloud Run", "Cloud Build", "Artifact Registry", "Secret Manager", "Global HTTPS LB"] },
    ],
    cta: "Need WhatsApp automation, multi-tenant SaaS, or an operations suite for your industry? We design the full system — not just the UI.",
    socialHook:
      "Most businesses don't need another app. They need one system that connects WhatsApp, CRM, and daily operations.",
    linkedInBullets: [
      "Problem: disconnected WhatsApp, CRM, and front-desk tools for SMBs",
      "Solution: multi-tenant suite with shared API + per-tenant subdomains",
      "Stack: Next.js, Vite, Express, GCP Cloud Run, Meta WhatsApp API",
      "Outcome: provision new clients in minutes, one deploy serves all tenants",
    ],
  },
  {
    slug: "offline-aquaculture-operations",
    title: "Offline-First Aquaculture Operations Platform",
    subtitle: "Field-ready feeding, inventory, and approvals for shrimp farms with poor connectivity",
    category: "Operations & Field Tech",
    featured: false,
    confidential: false,
    solutionTags: ["offline-first", "operations", "pwa"],
    industryTags: ["aquaculture"],
    heroImage: "/portfolio/aquafarm-ui.png",
    galleryImages: [
      { label: "Mobile login & farm selection", src: "/portfolio/aquafarm-ui.png" },
      { label: "Owner dashboard", src: "/portfolio/aquafarm-dashboard.png" },
      { label: "Daily feeding entry", src: "/portfolio/aquafarm-feeding.png" },
      { label: "Feed inventory ledger", src: "/portfolio/aquafarm-inventory.png" },
    ],
    homePreview: {
      category: "Field Operations",
      title: "Offline-first aquaculture feeding & inventory system",
      excerpt:
        "A mobile PWA replacing handwritten feeding sheets — works without connectivity, syncs safely, and enforces farm approval workflows.",
      image: "/portfolio/aquafarm-ui.png",
      images: [
        "/portfolio/aquafarm-dashboard.png",
        "/portfolio/aquafarm-feeding.png",
        "/portfolio/aquafarm-inventory.png",
      ],
    },
    summary:
      "We replaced handwritten feeding sheets with a mobile PWA that works offline on low-end Android, syncs safely when connectivity returns, and enforces farm business rules like two-day edit windows and owner approvals.",
    context:
      "Shrimp aquaculture farms in rural India rely on paper feeding reports. Supervisors have limited smartphone experience, connectivity is unreliable, and owners need audit trails, inventory deductions, and PDF/Excel reports — without forcing field staff to learn complex software.",
    scenario:
      "A supervisor walks pond-to-pond recording feed quantities in kilograms. The app saves locally even with no signal. When sync runs, late entries trigger owner approval. The owner reviews dashboards, approves pending items, and exports feeding reports for the week.",
    constraints: [
      "Offline-first on low-end Android (360px minimum, PWA installable)",
      "Phone + 6-digit PIN auth — no email required for field staff",
      "Farm timezone-aware two-day edit rule for supervisors",
      "Immutable inventory ledger — no editable stock fields",
      "Idempotent sync to prevent duplicate feeding entries",
      "English + Telugu-ready i18n architecture",
    ],
    solution: [
      "Built React PWA with IndexedDB (Dexie) queue and background sync worker",
      "NestJS API with Prisma on PostgreSQL — role-based owner vs supervisor permissions",
      "Automatic DOC, Total Daily Feed, and cumulative feed calculations mirroring manual sheets",
      "Late offline submissions route to owner approval workflow with audit history",
      "PDF and Excel report generation (PDFKit, ExcelJS) with share/export",
      "Deployed to GCP Cloud Run (aquafarm.kaana.in) with Cloud SQL Auth Proxy and Secret Manager",
    ],
    architecture: [
      "Supervisor PWA → local IndexedDB → sync queue → REST API → PostgreSQL",
      "Owner dashboard: approvals, historical edits, reports, farm/pond/cycle setup",
      "Cloud Run Jobs for demo seeding and data fix migrations",
      "Monorepo: npm workspaces + Turborepo (web, api, shared packages)",
    ],
    reliability: [
      "Idempotent API endpoints for offline replay",
      "JWT access + refresh tokens in Secret Manager",
      "Health check at /health; deployed image tagged per git commit",
    ],
    outcomes: [
      "Supervisors adopt immediately — workflow matches existing paper process",
      "Owners gain real-time visibility and approval control over field data",
      "Works in ponds with intermittent connectivity",
      "Production live at aquafarm.kaana.in with dedicated API subdomain",
    ],
    stack: [
      { label: "Frontend", items: ["React", "Vite", "PWA", "Dexie", "TanStack Query", "Tailwind"] },
      { label: "Backend", items: ["NestJS", "Prisma", "PostgreSQL 16", "PDFKit", "ExcelJS"] },
      { label: "Infrastructure", items: ["GCP Cloud Run", "Cloud SQL", "Artifact Registry", "Cloud Run Jobs"] },
    ],
    cta: "Running field operations where connectivity fails? We build offline-first systems with sync, approvals, and audit trails.",
    socialHook: "Paper feeding sheets don't fail offline. Your software shouldn't either.",
    linkedInBullets: [
      "Problem: handwritten aquaculture reports + no connectivity in the field",
      "Solution: offline PWA + sync queue + owner approval workflow",
      "Rules: two-day edit window, immutable inventory ledger, idempotent sync",
      "Live: aquafarm.kaana.in on GCP Cloud Run + PostgreSQL",
    ],
  },
  {
    slug: "creator-commerce-operations-platform",
    title: "Instagram Creator Commerce & Campaign Platform",
    subtitle: "Ongoing build — brands, creators, Meta/Instagram APIs, payments, KYC, voice, and chat in one marketplace",
    category: "Marketplace & Creator Economy",
    featured: true,
    confidential: true,
    projectStatus: "ongoing",
    solutionTags: [
      "creator-economy",
      "payments",
      "kyc-compliance",
      "social-integrations",
      "voice-telephony",
      "multi-tenant",
      "ai-automation",
    ],
    industryTags: ["creator-commerce", "saas"],
    heroImage:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&h=800&q=80",
    homePreview: {
      category: "Marketplace · Ongoing",
      title: "Instagram creator commerce with payments, KYC & social APIs",
      excerpt:
        "Active engagement — end-to-end marketplace connecting brands and creators via Meta/Instagram, Razorpay, Exotel voice, Stream chat, and AWS production infra.",
      image:
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    },
    summary:
      "We engineered a full creator-commerce marketplace: brand campaigns, creator packages, cart checkout, KYC verification, wallet ledger, social account linking, in-app voice calls, real-time chat, and AI-assisted content tools — web, admin, and native mobile.",
    context:
      "A confidential client needed a production-grade platform where brands discover creators, run campaigns, purchase packages, submit requirements, pay securely, and collaborate through chat and voice — while creators onboard with identity verification, link social accounts for insights, and manage portfolios and earnings.",
    scenario:
      "A brand builds a campaign targeting Instagram reels in Mumbai, adds creator packages to cart, fills content requirements with reference uploads, pays via Razorpay, and tracks order milestones. A creator links Instagram for audience insights, completes Aadhaar/PAN/GST verification, chats with the brand via Stream, and receives campaign briefs. Support agents place outbound calls through Exotel WebRTC when disputes arise.",
    constraints: [
      "India-specific payments (Razorpay) with idempotent checkout — no duplicate orders on retry",
      "Regulatory KYC: Aadhaar, PAN, GST verification via licensed API provider",
      "Social OAuth token encryption and Meta/Instagram data-deletion compliance",
      "High-volume media uploads to S3 with signed URLs and CloudFront delivery",
      "SMS OTP delivery via Exotel with production fallback paths",
      "Background job processing for recommendations, metrics sync, and notifications",
      "Sensitive data logging redaction (OTP, tokens, KYC payloads, payment details)",
    ],
    solution: [
      "Express + Prisma backend with 40+ feature modules: campaigns, packages, cart, orders, payments, wallet, KYC, portfolio, chat, voice, referrals, CRM, admin",
      "Next.js web app with Redux Toolkit, TanStack Query, atomic design system",
      "Expo React Native mobile app with EAS builds, Firebase Cloud Messaging, Razorpay native checkout",
      "Unified payment flow with order intents, advisory locks, and Razorpay order reuse on retry",
      "Wallet ledger as source of truth — automatic CREDIT/DEBIT entries on referral unlock and withdrawals",
      "Campaign engine with category, location, and package preference matching across Instagram, YouTube, TikTok, LinkedIn, Facebook, Twitter",
      "AI script generator (Anthropic Claude) for ad briefs and content ideation",
      "Admin dashboard for database ops, staff provisioning, and support workflows",
    ],
    architecture: [
      "AWS ECS Fargate (Spot) behind Application Load Balancer — webapp, admin, backend services",
      "Amazon RDS PostgreSQL with safe Prisma migration deploy via one-off ECS tasks",
      "Amazon S3 + CloudFront for portfolio, profile, cover, and campaign media with signed GET URLs",
      "BullMQ + Redis for async jobs: metrics sync, recommendations, notifications, cron pipelines",
      "AWS SSM Parameter Store + KMS for secrets; ECR for container images",
      "GitHub Actions CI/CD with path-based triggers and automated migration on deploy",
    ],
    integrations: [
      "Meta: Facebook OAuth, Instagram Graph API (insights, business discovery, page metrics), Meta webhooks, signed-request verification, data deletion callbacks",
      "Exotel: SMS OTP delivery, outbound voice via Connect API, WebRTC browser agent calling, flow apps, NDNC handling, call status webhooks",
      "Razorpay: unified web + native checkout, webhook signature verification, idempotent order intents",
      "Stream Chat: brand–creator messaging, team chat channels",
      "Google OAuth: sign-in and account linking",
      "LinkedIn OAuth: creator profile connection and token revocation on account deletion",
      "YouTube: metrics and content performance modules",
      "Sandbox.co.in: Aadhaar verification, PAN validation, GST lookup, penny-drop bank verification",
      "Firebase Cloud Messaging: push notifications on iOS and Android",
      "Anthropic Claude API: AI script and brief generation",
      "Twilio: supplementary telephony service layer",
    ],
    reliability: [
      "Winston logger with global metadata redaction — no OTPs, tokens, or KYC values in logs",
      "Payment idempotency keys with PostgreSQL advisory locks on checkout",
      "JWT auth with soft-deleted user guard on optionalAuth middleware",
      "Prisma append-only migration policy — never edit applied migrations",
      "Super-admin gated debug endpoints; cart debug returns metadata only",
      "Structured error codes for KYC and payment flows instead of raw exception leaks",
    ],
    outcomes: [
      "Full marketplace loop: discover → cart → pay → fulfill → chat → settle",
      "Creators verified through multi-step KYC before receiving paid work",
      "Social insights power campaign matching without manual spreadsheet research",
      "Voice and chat embedded in operations — not bolted on as separate tools",
      "Production AWS deployment targeting $20–50/month with Fargate Spot optimization",
    ],
    stack: [
      { label: "Web", items: ["Next.js 15", "React 18", "Redux Toolkit", "TanStack Query", "Tailwind", "Stream Chat React"] },
      { label: "Mobile", items: ["Expo 55", "React Native", "EAS Build", "Firebase Messaging", "Razorpay RN SDK", "NativeWind"] },
      { label: "Backend", items: ["Express", "Prisma", "PostgreSQL", "BullMQ", "Redis", "Winston", "JWT"] },
      { label: "Cloud & DevOps", items: ["AWS ECS Fargate", "ALB", "RDS", "S3", "CloudFront", "SSM", "KMS", "ECR", "GitHub Actions"] },
      { label: "Integrations", items: ["Meta / Instagram Graph", "Exotel SMS + Voice + WebRTC", "Razorpay", "Stream Chat", "Google OAuth", "LinkedIn OAuth", "YouTube API", "Sandbox KYC", "Anthropic Claude", "Firebase FCM"] },
    ],
    cta: "Building a marketplace, creator platform, or campaign ops tool? We integrate payments, KYC, social APIs, and voice — as one system.",
    socialHook:
      "Creator marketplaces fail when payments, KYC, social data, and collaboration live in four different tools. We built them as one.",
    linkedInBullets: [
      "Problem: brands and creators need one place to campaign, pay, verify, and collaborate",
      "Built: web + native mobile + admin + 40+ backend modules on AWS ECS",
      "Integrations: Meta/Instagram, Exotel SMS+Voice, Razorpay, Stream Chat, KYC APIs",
      "Hard parts solved: payment idempotency, token encryption, log redaction, safe migrations",
    ],
  },
  {
    slug: "student-recognition-platform",
    title: "University Student Recognition Platform",
    subtitle: "Scholarship pathways, assessments, and admin portals backed by a typed monorepo",
    category: "EdTech",
    featured: true,
    confidential: false,
    solutionTags: ["education", "multi-tenant", "operations"],
    industryTags: ["education"],
    heroImage: "/portfolio/faralin-web-ui.png",
    galleryImages: [
      { label: "Student recognition app", src: "/portfolio/faralin-web-ui.png" },
      { label: "University portal", src: "/portfolio/faralin-university-ui.png" },
      { label: "University partnerships", src: "/portfolio/faralin-universities-banner.jpg" },
    ],
    homePreview: {
      category: "EdTech",
      title: "University-backed student recognition platform",
      excerpt:
        "Student onboarding, assessments, scholarship pathways, and Clerk-protected admin portals on a typed Turborepo monorepo.",
      image: "/portfolio/faralin-web-ui.png",
      images: [
        "/portfolio/faralin-web-ui.png",
        "/portfolio/faralin-universities-banner.jpg",
      ],
    },
    summary:
      "We delivered a university-backed student recognition system with public web app, NestJS API, Clerk-protected admin and university portals, and PostgreSQL — deployed on GCP alongside a global load balancer.",
    context:
      "Universities need to identify high-potential students, run structured assessments, manage scholarship pathways, and give staff secure admin tools — without compromising student data or running separate codebases per institution.",
    scenario:
      "A student completes an onboarding wizard, takes assessments, and tracks recognition progress. University staff review applications through a Clerk-authenticated portal. Platform admins manage rules, seed university data, and sync policies via Cloud Run Jobs.",
    constraints: [
      "Monorepo with shared types, UI tokens, and Prisma schema",
      "Clerk authentication for admin and university-facing apps",
      "Production on GCP Cloud Run with Cloud SQL PostgreSQL (faralin-pg instance)",
      "Separate domains: public web, API, university portal, admin dashboard",
    ],
    solution: [
      "pnpm + Turborepo monorepo: Next.js web, NestJS API, Next.js admin",
      "Prisma schema with seeded universities, courses, knowledge articles, and assessment data",
      "Cloud Build pipeline deploying web + API to Artifact Registry → Cloud Run",
      "Cloud Run Jobs for schema push, staff provisioning (including Clerk sync), and rule synchronization",
      "Stream Chat integration for support and collaboration features",
    ],
    architecture: [
      "faralin.kaana.in → web app | api.faralin.kaana.in → NestJS API",
      "university.faralin.kaana.in + admin.faralin.kaana.in → Clerk-protected Next.js apps",
      "Cloud SQL PostgreSQL with Secret Manager for DATABASE_URL and Clerk keys",
    ],
    reliability: [
      "Clerk webhook verification for user lifecycle events",
      "Dedicated dbjob Docker image for maintenance tasks",
      "SSL via Google-managed faralin-cert on shared HTTPS load balancer",
    ],
    outcomes: [
      "Students, universities, and admins each get purpose-built interfaces on one data model",
      "Repeatable deploy and DB maintenance via Cloud Run Jobs",
      "Live production domains with managed SSL",
    ],
    stack: [
      { label: "Frontend", items: ["Next.js 15", "React 19", "Clerk Auth", "Shared UI package"] },
      { label: "Backend", items: ["NestJS 11", "Prisma", "PostgreSQL 16"] },
      { label: "Infrastructure", items: ["GCP Cloud Run", "Cloud SQL", "Cloud Run Jobs", "Secret Manager"] },
    ],
    cta: "Need an education platform with student portals, admin tools, and secure auth? We ship monorepos that scale to production.",
    socialHook: "EdTech isn't one app — it's students, institutions, and admins on one platform.",
    linkedInBullets: [
      "Problem: university recognition needs student UX + staff admin + API",
      "Solution: Turborepo monorepo, Clerk auth, NestJS + Prisma on GCP",
      "Ops: Cloud Run Jobs for provisioning and schema maintenance",
    ],
  },
  {
    slug: "healthcare-clinic-digital-suite",
    title: "Healthcare Clinic Digital Suite",
    subtitle: "Tenant marketing sites, CRM desk, and WhatsApp-connected patient operations",
    category: "Healthcare",
    featured: false,
    confidential: false,
    solutionTags: ["healthcare", "multi-tenant", "whatsapp-automation", "operations"],
    industryTags: ["healthcare"],
    heroImage: "/portfolio/clinic-crm-ui.png",
    galleryImages: [
      { label: "Clinic front-desk app", src: "/portfolio/clinic-crm-ui.png" },
      { label: "Tenant marketing website", src: "/portfolio/dental-clinic-ui.png" },
      { label: "Daily patient board", src: "/portfolio/clinic-desk-today.png" },
    ],
    summary:
      "We built a clinic operations stack: multi-tenant front-desk app for patients and bookings, tenant marketing websites, and WhatsApp-connected workflows — deployed per clinic on shared GCP infrastructure.",
    context:
      "Dental and specialty clinics need more than a brochure website. They need daily operations software for appointments, payments, and patient tracking — plus WhatsApp for reminders — while each clinic keeps its own brand and domain.",
    scenario:
      "Denta Care runs clinic.kaana.in for front-desk staff while ajitdentacare.kaana.in serves as the public marketing site for a specific practice. CRM subdomains route tenant desk logins. WhatsApp handles booking confirmations through the shared API.",
    constraints: [
      "Mobile-friendly clinic desk for front-desk staff on tablets",
      "Tenant slug resolution from hostname or query param for local dev",
      "Firebase optional integration for extended auth",
      "Separate Cloud Run deploy for tenant marketing sites",
    ],
    solution: [
      "clinic-crm: React PWA for patients, today board, bookings, payments, visit workflow",
      "dental-clinic: TanStack Start marketing site with shadcn/ui, deployed as ajitdentalclinic Cloud Run service",
      "Shared kaana-api backend for auth, appointments, and WhatsApp clinic bot flows",
      "URL map wildcard routing: *.clinic.kaana.in, crm.{tenant}.kaana.in, tenant marketing domains",
    ],
    architecture: [
      "clinic.kaana.in → kaana-clinic Cloud Run | dentacare.kaana.in → tenant site backend",
      "All clinic apps authenticate against api.kaana.in with tenant-scoped JWT",
    ],
    reliability: [
      "Tenant-scoped JWT on every API request; hostname-based tenant context",
      "WhatsApp webhook verification and Meta provider token in Secret Manager",
      "Managed SSL certificates on shared global load balancer",
    ],
    outcomes: [
      "Clinics get branded web presence plus operational software from one vendor",
      "WhatsApp booking flows integrated into clinic bot module",
      "Multiple tenant domains live on shared load balancer",
    ],
    stack: [
      { label: "Clinic desk", items: ["React 19", "Vite", "TypeScript", "Firebase (optional)"] },
      { label: "Marketing", items: ["TanStack Start", "Nitro", "shadcn/ui", "Tailwind v4"] },
      { label: "Backend", items: ["Node.js Express API", "WhatsApp Meta provider", "Multi-tenant JWT"] },
      { label: "Infrastructure", items: ["GCP Cloud Run", "Global HTTPS LB", "Managed SSL certs"] },
    ],
    cta: "Clinics deserve operations software, not just websites. We connect front-desk, marketing, and WhatsApp.",
    socialHook: "Your clinic website should talk to your front-desk software. Ours does.",
    linkedInBullets: [
      "Problem: clinics juggle marketing sites and disconnected desk tools",
      "Solution: tenant marketing + clinic CRM + WhatsApp on shared API",
      "Live: clinic.kaana.in, dentacare.kaana.in on GCP",
    ],
  },
  {
    slug: "restaurant-digital-menu",
    title: "New Ram Sai — Full-Stack QR Menu App",
    subtitle: "Production hospitality PWA — 200+ dishes, search, cart, item sheets, table QR modes, and Cloud Run deploy",
    category: "Hospitality",
    featured: false,
    confidential: false,
    projectStatus: "live",
    solutionTags: ["pwa", "e-commerce", "operations"],
    industryTags: ["hospitality"],
    heroImage: "/portfolio/qr-menu-hero.png",
    galleryImages: [
      { label: "Restaurant hero & branding", src: "/portfolio/qr-menu-hero.png" },
      { label: "Category browse & veg filters", src: "/portfolio/qr-menu-ui.png" },
      { label: "Full menu experience", src: "/portfolio/qr-menu-app.png" },
      { label: "Cart & order summary", src: "/portfolio/qr-menu-cart.png" },
    ],
    homePreview: {
      category: "Hospitality",
      title: "Full-fledged QR menu app for dine-in & takeaway",
      excerpt:
        "Swiggy-grade mobile UX — sticky category tabs, dish search, veg/non-veg filters, item bottom sheets, local cart, table QR params, and 200+ items live on GCP.",
      image: "/portfolio/qr-menu-hero.png",
      images: [
        "/portfolio/qr-menu-hero.png",
        "/portfolio/qr-menu-ui.png",
        "/portfolio/qr-menu-app.png",
        "/portfolio/qr-menu-cart.png",
      ],
    },
    summary:
      "We delivered a complete QR menu product for New Ram Sai restaurant — not a static PDF, but a full mobile web application with Swiggy-inspired UX, structured menu data, cart workflow, item detail sheets, and production deployment on a custom subdomain.",
    context:
      "Restaurants replacing printed menus need more than a PDF or image gallery. Customers expect search, dietary filters, smooth category navigation, and a cart they can show staff — all loading instantly after scanning a table QR code, with no app store install.",
    scenario:
      "A customer scans a table QR (`?table=12&mode=dine-in`), lands on a branded hero header, searches \"biryani\", filters veg-only, opens a dish bottom sheet with photo and description, adds items to cart, and shows the order summary to staff. Takeaway mode switches via the same app using URL params for future print QR variants.",
    constraints: [
      "Mobile-first Swiggy-style UX on low-end Android over restaurant Wi‑Fi",
      "203 menu items across 32 sections — generated from structured JSON, not hand-maintained JSX",
      "WebP dish image pipeline with category fallbacks for missing photos",
      "Per-table and dine-in / takeaway / delivery modes via query params",
      "Single-tenant subdomain on shared GCP HTTPS load balancer",
      "Installable PWA shell — fast repeat visits for returning customers",
    ],
    solution: [
      "React 19 + Vite + Tailwind v4 SPA with sticky Indian / Chinese / Beverages category tabs",
      "Live search across all dishes; veg / non-veg / all diet toggle on every view",
      "Floating Menu button → sub-category jump modal with smooth scroll-to-section",
      "Item bottom sheet with dish photo, bestseller tags, spice level, and rich metadata",
      "Recommended (bestseller) section auto-built per active category",
      "Local cart context with bottom bar, drawer, quantity controls, and order summary",
      "Menu generation script (`generate-menu.mjs`) and image optimization pipeline for production assets",
      "Cloud Build → Cloud Run (`kaana-qr-menu`) with nginx static serving; route `newramsai.menu.kaana.in`",
    ],
    architecture: [
      "QR scan → HTTPS LB → Cloud Run (nginx + Vite build) → React SPA",
      "Structured `menuSections.json` → TypeScript menu model → filtered views by category, search, diet",
      "Cart state in React context — no backend required for MVP; staff confirm from customer screen",
      "Optional `?table=` and `?mode=` params for table labels and service mode without separate builds",
    ],
    reliability: [
      "Static SPA on Cloud Run — fast cold starts, no server-side session state",
      "Managed SSL via kaana-menu-cert on shared global load balancer",
      "Image manifest + optimize-dish-images pre-build keeps LCP acceptable on mobile",
    ],
    outcomes: [
      "Full menu product live at newramsai.menu.kaana.in — scan-to-order in one step",
      "200+ dishes navigable with search, filters, and cart — matches consumer app expectations",
      "Same codebase supports dine-in table QR, takeaway, and future delivery entry points",
      "Menu updates ship via JSON regen + redeploy — no manual HTML edits",
    ],
    stack: [
      { label: "Frontend", items: ["React 19", "Vite", "TypeScript", "Tailwind CSS 4", "Lucide icons"] },
      { label: "Menu & assets", items: ["JSON menu generator", "WebP dish pipeline", "Category image fallbacks"] },
      { label: "Infrastructure", items: ["GCP Cloud Run", "Cloud Build", "Artifact Registry", "Managed SSL"] },
    ],
    cta: "Need a production QR menu — not a PDF — with cart, search, and your brand UX? We ship full hospitality web apps fast.",
    socialHook: "A QR menu should feel like Swiggy, not a zoomed-in PDF.",
    linkedInBullets: [
      "Built: full QR menu app — 200+ items, search, veg filters, cart, item sheets",
      "Live: newramsai.menu.kaana.in on GCP Cloud Run with table/mode QR params",
      "Stack: React, Vite, Tailwind, structured menu JSON + image pipeline",
    ],
  },
  {
    slug: "retail-commerce-storefront",
    title: "ONLY GODS — Dark Brand Storefront",
    subtitle: "Cinematic dark-theme e-commerce for a streetwear label — unique product showcase with WhatsApp ordering today, full checkout roadmap as the brand scales",
    category: "Retail & E-commerce",
    featured: false,
    confidential: false,
    solutionTags: ["e-commerce", "pwa"],
    industryTags: ["retail"],
    heroImage: "/portfolio/only-gods-ui.png",
    galleryImages: [
      { label: "Cinematic dark hero", src: "/portfolio/only-gods-ui.png" },
      { label: "Product detail page", src: "/portfolio/only-gods-product.png" },
      { label: "Cart drawer", src: "/portfolio/only-gods-cart.png" },
    ],
    summary:
      "A streetwear founder asked us to design a one-of-a-kind dark-themed storefront for ONLY GODS — cinematic hero, ritual-inspired product drops, cart drawer, and WhatsApp order flow for launch, with architecture ready to add payments, inventory, and full e-commerce as the business grows.",
    context:
      "ONLY GODS is a curated streetwear brand built around wearable mythology — limited drops, heavy visual identity, and a moody dark aesthetic. The founder needed a bespoke site (not a generic Shopify theme) that feels like the brand: dramatic imagery, unique product presentation, and a checkout path Indian customers already trust — WhatsApp — while keeping the door open for Razorpay, shipping integrations, and catalog expansion later.",
    scenario:
      "A fan lands on clothing.onlygods.kaana.in, scrolls through the dark cinematic hero and limited-drop grid, opens a product detail page, adds pieces to cart, and taps WhatsApp to send a pre-filled order message. The brand owner fulfills manually today; when volume grows, the same TanStack Start codebase can plug in payment gateways and automated fulfillment without a rebuild.",
    constraints: [
      "Dark, brand-owned visual language — blood-red accents, veil gradients, display typography, not template e-commerce",
      "Mobile-first showcase with optimized product imagery (pre-build pipeline for heavy JPG assets)",
      "Phase 1 checkout: WhatsApp FAB + cart drawer with pre-filled order message",
      "Phase 2 roadmap: payment gateway, order management, inventory sync — without platform lock-in",
      "Custom domain on shared GCP load balancer (clothing.onlygods.kaana.in)",
    ],
    solution: [
      "TanStack Start + shadcn/ui storefront with cinematic hero, marquee gospel strip, and drop-focused product grid",
      "Product slug pages with OptimizedImage pipeline for fast LCP on mobile",
      "Cart state + CartDrawer; WhatsApp FAB sends structured order intent via wa.me deep links",
      "Brand-specific copy and layout — \"wearable mythology\" showcase, not a generic catalog",
      "Dedicated Cloud Build + Cloud Run deploy (only-gods service) on kaana-prod GCP project",
    ],
    architecture: [
      "TanStack Router file-based routes (home, product.$slug) → Cloud Run (only-gods) → HTTPS LB → clothing.onlygods.kaana.in",
      "Cart context shared across header, drawer, and WhatsApp checkout URL builder",
      "Image manifest + optimize-images pre-build for production asset delivery",
    ],
    reliability: [
      "Containerized deploy with reproducible Cloud Build pipeline",
      "Image optimization pre-build reduces LCP on mobile product pages",
      "WhatsApp checkout avoids payment-gateway complexity at launch while orders still convert",
    ],
    outcomes: [
      "Brand-owned dark storefront live on custom domain — unique to ONLY GODS, not a template",
      "WhatsApp-native ordering live today for early drop sales",
      "Extensible codebase ready for full e-commerce integrations as the brand scales",
    ],
    stack: [
      { label: "Frontend", items: ["TanStack Start", "React 19", "shadcn/ui", "Tailwind v4"] },
      { label: "Commerce (phase 1)", items: ["Cart drawer", "WhatsApp order deep links", "Product catalog"] },
      { label: "Roadmap (phase 2)", items: ["Payment gateway", "Order management", "Inventory sync"] },
      { label: "Infrastructure", items: ["GCP Cloud Run", "Cloud Build"] },
    ],
    cta: "Need a dark, brand-first storefront with WhatsApp checkout today and room to grow into full e-commerce? We design the experience and the roadmap.",
    socialHook: "Phase 1: WhatsApp orders. Phase 2: full e-commerce. One bespoke dark storefront built for the brand.",
    linkedInBullets: [
      "Client ask: unique dark-themed ONLY GODS streetwear site — not a template store",
      "Built: cinematic showcase, cart + WhatsApp checkout on TanStack Start",
      "Roadmap: payment + inventory integrations as the brand scales",
    ],
  },
  {
    slug: "firebase-productivity-pwa",
    title: "Personal Productivity PWA",
    subtitle: "Reminders, bills, voice input, and real-time sync with Firebase",
    category: "Consumer Productivity",
    featured: false,
    confidential: false,
    solutionTags: ["pwa", "offline-first"],
    industryTags: ["productivity"],
    heroImage: "/portfolio/reminders-pwa-ui.png",
    galleryImages: [
      { label: "Dashboard with reminders", src: "/portfolio/reminders-pwa-ui.png" },
      { label: "Today view", src: "/portfolio/reminders-pwa-today.png" },
      { label: "Upcoming schedule", src: "/portfolio/reminders-pwa-upcoming.png" },
      { label: "Inbox capture", src: "/portfolio/reminders-pwa-inbox.png" },
      { label: "Voice settings", src: "/portfolio/reminders-pwa-settings.png" },
    ],
    summary:
      "We built an installable PWA for reminders and bill tracking with Firebase Auth, Firestore real-time sync, voice input, natural language date parsing, and swipe actions.",
    context:
      "Users need a simple mobile app for reminders and bills that works offline-ish, syncs across devices, and supports voice entry — without building native iOS/Android separately.",
    scenario:
      "A user speaks 'pay electricity bill next Friday' — chrono-node parses the date, Firestore stores the reminder with uid isolation, and swipe gestures mark complete or delete with optimistic UI.",
    constraints: [
      "Firebase security rules enforcing uid == resource.data.uid",
      "PWA install on iOS and Android",
      "Voice input via Web Speech API with MediaRecorder fallback",
      "Cloud Run source deploy (no custom domain — direct run.app URL)",
    ],
    solution: [
      "Next.js 14 PWA with service worker, manifest, and app icons",
      "Firebase Auth (email/password behind simple name+password UI)",
      "Firestore onSnapshot for live sync; Storage for voice memos",
      "Swipe-to-action cards with accessible button fallbacks",
      "Setup script for Firebase rules deploy and Cloud Run redeploy",
    ],
    architecture: [
      "Next.js PWA → Firebase Auth + Firestore + Storage",
      "Cloud Run source deploy on kaana-prod Firebase-enabled project",
    ],
    reliability: [
      "Firestore security rules enforce per-user data isolation (uid match)",
      "Optimistic UI with rollback and toast on Firestore write failures",
      "Firebase rules deployed via scripted setup before Cloud Run redeploy",
    ],
    outcomes: [
      "Installable cross-platform app from one Next.js codebase",
      "Real-time multi-device sync with security rules",
      "Voice and natural language reduce friction for quick capture",
    ],
    stack: [
      { label: "Frontend", items: ["Next.js 14", "React 18", "Tailwind CSS", "PWA service worker"] },
      { label: "Backend", items: ["Firebase Auth", "Firestore", "Firebase Storage"] },
      { label: "Infrastructure", items: ["GCP Cloud Run", "Firebase (kaana-prod project)"] },
    ],
    cta: "Need a personal or team productivity app with sync and voice? We build Firebase-backed PWAs.",
    socialHook: "Reminders that sync, parse natural language, and work as a PWA.",
    linkedInBullets: [
      "Built: reminders + bills PWA with voice input and swipe actions",
      "Stack: Next.js, Firebase Auth/Firestore, Cloud Run",
    ],
  },
  {
    slug: "inventory-operations-demo",
    title: "Inventory & WMS Operations UI",
    subtitle: "Warehouse dashboard prototype with AI scoring and reorder intelligence",
    category: "Operations Demo",
    featured: false,
    confidential: false,
    solutionTags: ["operations", "ai-automation"],
    industryTags: ["saas"],
    heroImage: "/portfolio/inventory-wms-dashboard.png",
    galleryImages: [
      { label: "Ops dashboard", src: "/portfolio/inventory-wms-dashboard.png" },
      { label: "Live inventory register", src: "/portfolio/inventory-wms-stock.png" },
      { label: "SKU detail panel", src: "/portfolio/inventory-wms-detail.png" },
      { label: "Reports & analytics", src: "/portfolio/inventory-wms-reports.png" },
      { label: "Purchase orders", src: "/portfolio/inventory-wms-orders.png" },
    ],
    summary:
      "We prototyped a StockFlow inventory/WMS dashboard — dark-sidebar ops aesthetic, inline stock bars, AI reorder scores, and detail panel UX — as a sales demo for warehouse digitization.",
    context:
      "Before building a full WMS backend, stakeholders needed a clickable demo showing how inventory ops software should feel — numbers-first, status chips, and AI-assisted reorder hints.",
    scenario:
      "An ops manager scans stock levels, sees AI reorder scores with tooltips, opens a 400px detail panel that pushes the table (no overlay), and dismisses the AI banner after first view.",
    constraints: [
      "Frontend-only demo — local state, no API",
      "Dark navy sidebar + off-white main — distinct from CRM aesthetic",
      "localStorage for banner dismiss persistence",
    ],
    solution: [
      "React + Vite SPA with Recharts and local state management",
      "AI score squares with color-coded tooltips",
      "Detail panel slide pattern for SKU drill-down",
      "Paired with kaana_inventory_wms_demo.html static pitch page",
    ],
    architecture: ["Standalone Vite SPA — demo asset for sales conversations, not production deployed"],
    reliability: [
      "Frontend-only prototype — zero backend attack surface for demo purposes",
    ],
    outcomes: [
      "Stakeholders validate UX before committing to backend build",
      "Clear visual language for warehouse ops vs CRM ops",
    ],
    stack: [{ label: "Frontend", items: ["React 19", "Vite", "TypeScript", "Recharts"] }],
    cta: "Want to validate ops software UX before building the backend? We prototype fast.",
    socialHook: "Validate warehouse software UX before you write a single API endpoint.",
    linkedInBullets: [
      "Prototype: inventory/WMS dashboard with AI reorder scoring",
      "Purpose: sales demo for warehouse digitization conversations",
    ],
  },
];

const orderIndex = new Map<string, number>(
  PORTFOLIO_ORDER.map((slug, i) => [slug, i]),
);

export const caseStudies: CaseStudy[] = [...caseStudyEntries].sort(
  (a, b) => (orderIndex.get(a.slug) ?? 999) - (orderIndex.get(b.slug) ?? 999),
);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return caseStudies.filter((c) => c.featured);
}

export function getAllSlugs(): string[] {
  return caseStudies.map((c) => c.slug);
}
