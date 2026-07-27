export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  publishedAt: string;
  readMinutes: number;
  heroImage: string;
  relatedServiceSlug: string;
  relatedCaseStudySlug: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
};

export const articles: Article[] = [
  {
    slug: "instagram-influencer-collaboration-platform",
    title: "Building a Brand–Influencer Collaboration Platform",
    excerpt:
      "A technical look at marketplace architecture for Instagram-led campaigns — social OAuth, creator verification, payments, and in-app collaboration in one stack.",
    metaDescription:
      "How to architect an Instagram brand and influencer collaboration platform: Meta social APIs, campaign checkout, KYC, wallet ledger, chat, and voice on production cloud infra.",
    keywords: [
      "Instagram influencer platform",
      "creator marketplace architecture",
      "Meta Graph API",
      "brand creator collaboration",
      "influencer campaign software",
    ],
    publishedAt: "2026-07-25",
    readMinutes: 10,
    heroImage:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&h=800&q=80",
    relatedServiceSlug: "multi-tenant-saas-gcp",
    relatedCaseStudySlug: "creator-commerce-operations-platform",
    sections: [
      {
        heading: "What a collaboration platform actually needs",
        paragraphs: [
          "Brands want to discover creators, run campaigns, buy packages, and track delivery. Creators need onboarding, social account linking, portfolio visibility, and reliable payouts. That is not a landing page problem — it is a multi-surface product with auth, payments, messaging, and compliance from day one.",
          "We approach these builds as a single marketplace loop: discover → package or campaign → checkout → requirements → fulfillment → chat or voice → settlement. Each step needs its own API module, but one shared user, wallet, and notification model.",
        ],
      },
      {
        heading: "Social API layer (Instagram-first, multi-network ready)",
        paragraphs: [
          "Instagram is usually the primary channel, but production platforms also connect YouTube, LinkedIn, and other networks. OAuth flows must encrypt tokens at rest, refresh them safely, and expose audience insights only after explicit user consent.",
          "Meta webhooks, signed-request verification, and data-deletion callbacks are not optional — they are part of the core backend, not a post-launch add-on. Treat social account linking as a first-class domain with its own audit trail and revocation paths.",
        ],
      },
      {
        heading: "Payments, KYC, and trust",
        paragraphs: [
          "Marketplaces break when money and identity are bolted on late. A typical stack includes cart checkout, order milestones, a wallet ledger, and identity verification before creators receive paid work.",
          "Keep payment webhooks idempotent, separate platform fees from creator earnings in the ledger, and gate high-value actions behind verification status — not just a profile photo upload.",
        ],
      },
      {
        heading: "Collaboration inside the product",
        paragraphs: [
          "Brands and creators should not jump to WhatsApp or email for every brief. In-app chat, optional voice for support or disputes, and push notifications keep operations inside the platform you can measure and secure.",
          "Admin tooling for disputes, manual review, and campaign moderation belongs in the same system — otherwise operations teams live in spreadsheets while the app claims to be all-in-one.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you need native mobile apps on day one?",
        answer:
          "Not always. A responsive web app plus a solid API can launch campaigns quickly. Native apps matter when creators need push, offline drafts, or camera-first workflows at high volume.",
      },
      {
        question: "Instagram-only or multi-platform?",
        answer:
          "Start Instagram-first if that is where the audience lives, but design packages, campaigns, and social linking as network-agnostic data models so YouTube or LinkedIn can be added without rewriting checkout.",
      },
      {
        question: "GCP or AWS for this kind of product?",
        answer:
          "Either works. We choose based on existing infra, team familiarity, and integration footprint — payment gateways, SMS/voice providers, and chat SDKs matter more than cloud brand in most marketplace builds.",
      },
    ],
  },
  {
    slug: "whatsapp-business-api-crm-gcp",
    title: "Connecting WhatsApp Business API to a CRM on GCP",
    excerpt:
      "How we wire Meta webhooks, a shared inbox, and a lead pipeline on Cloud Run — without a separate deploy per client.",
    metaDescription:
      "Technical guide: WhatsApp Business API webhooks, shared inbox, CRM pipeline, and multi-tenant auth on Google Cloud Run.",
    keywords: ["WhatsApp Business API", "GCP Cloud Run", "CRM integration", "webhook verification"],
    publishedAt: "2026-07-20",
    readMinutes: 8,
    heroImage: "/portfolio/botiq-inbox-ui.png",
    relatedServiceSlug: "whatsapp-business-automation",
    relatedCaseStudySlug: "kaana-business-automation-suite",
    sections: [
      {
        heading: "Why WhatsApp needs a backend, not just a phone",
        paragraphs: [
          "When a business outgrows a single WhatsApp number, conversations scatter across devices. The Business API centralises messaging, but you still need routing, lead capture, and agent workflows.",
          "We typically route Meta webhooks to one API layer, land conversations in a shared inbox, and sync enquiries to a CRM pipeline — all behind tenant-scoped authentication.",
        ],
      },
      {
        heading: "Architecture on GCP",
        paragraphs: [
          "Cloud Run hosts the API, inbox, CRM, and platform dashboard. A global HTTPS load balancer routes app.kaana.in, inbox.kaana.in, crm.kaana.in, and api.kaana.in to the right service.",
          "WhatsApp tokens and JWT secrets live in Secret Manager — never in source control. Webhook verification uses a dedicated verify token per environment.",
        ],
      },
      {
        heading: "What to plan before go-live",
        paragraphs: [
          "Meta Business verification and phone number ID setup often dominate timelines more than code. Budget time for template approvals if you send outbound notifications.",
          "Start with inbound message handling and lead creation; add agent takeover and CRM stages once the webhook loop is stable in production.",
        ],
      },
    ],
    faqs: [
      {
        question: "Meta or Twilio for WhatsApp?",
        answer:
          "We default to Meta Cloud API for direct integration. Twilio remains supported where clients already have Twilio contracts.",
      },
      {
        question: "Can agents reply from a web inbox?",
        answer:
          "Yes. A web inbox with agent takeover and live WhatsApp send via the API is the usual pattern, with optional demo threads for sales environments.",
      },
    ],
  },
  {
    slug: "multi-tenant-cloud-run-architecture",
    title: "Multi-Tenant SaaS on Cloud Run: URLs, JWT, and Provisioning",
    excerpt:
      "Hostname routing, tenant provisioning in one API call, and why we avoid per-client Cloud Run services.",
    metaDescription:
      "How to run multi-tenant SaaS on one cloud project using hostname routing, JWT isolation, and admin provisioning.",
    keywords: ["multi-tenant SaaS", "Cloud Run architecture", "JWT tenant isolation"],
    publishedAt: "2026-07-15",
    readMinutes: 7,
    heroImage: "/portfolio/propcrm-ui.png",
    relatedServiceSlug: "multi-tenant-saas-gcp",
    relatedCaseStudySlug: "kaana-business-automation-suite",
    sections: [
      {
        heading: "One deploy, many tenants",
        paragraphs: [
          "Per-client container services do not scale operationally. Hostname and JWT context resolve tenants at request time — many subdomains can hit the same deployment image.",
          "Platform admins provision tenants through an admin API that creates the tenant record, default admin access, and product deep links in one step.",
        ],
      },
      {
        heading: "Load balancer and SSL",
        paragraphs: [
          "Managed certificates and load-balancer URL maps route by host header to the right backend service. The same pattern works for product subdomains, tenant marketing sites, and API gateways on one project.",
        ],
      },
      {
        heading: "When to split databases",
        paragraphs: [
          "Early-stage products often use SQLite with backup or a shared PostgreSQL instance with separate schemas or databases per product. Split databases when traffic, compliance, or backup policies require it — not on day one.",
        ],
      },
    ],
    faqs: [
      {
        question: "How fast can you onboard a new tenant?",
        answer:
          "Under a minute via the platform admin console — tenant slug, default credentials, and product links are returned in one API response.",
      },
    ],
  },
  {
    slug: "offline-first-pwa-field-operations",
    title: "Offline-First PWAs for Field Teams in Low-Connectivity Areas",
    excerpt:
      "Phone + PIN auth, idempotent sync, and approval workflows — patterns for field apps where connectivity is unreliable.",
    metaDescription:
      "Building offline-first PWAs for field teams: local persistence, sync rules, and approval workflows on cloud backends.",
    keywords: ["offline-first PWA", "field operations", "aquaculture app", "idempotent sync"],
    publishedAt: "2026-07-10",
    readMinutes: 9,
    heroImage: "/portfolio/aquafarm-feeding.png",
    relatedServiceSlug: "offline-first-field-apps",
    relatedCaseStudySlug: "offline-aquaculture-operations",
    sections: [
      {
        heading: "The connectivity reality",
        paragraphs: [
          "Field staff often move through areas with intermittent mobile signal. An online-only form fails silently or frustrates users. Offline-first PWAs with local storage and background sync when signal returns are the practical default.",
        ],
      },
      {
        heading: "Business rules in sync, not just data",
        paragraphs: [
          "A two-day edit window for supervisors, immutable inventory ledger entries, and owner approval for late offline submissions are enforced server-side — the client optimistically updates UI but the API is the source of truth.",
          "Client entry IDs make sync idempotent so retries never duplicate feeding records.",
        ],
      },
      {
        heading: "Stack choices",
        paragraphs: [
          "React PWA front end, API on container hosting, PostgreSQL for persistence. Phone + short PIN keeps auth simple for staff who do not use email daily.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does it work on iOS?",
        answer:
          "PWA install on iOS is supported with some limitations on background sync. We prioritise Android for field deployments but keep iOS usable for owners reviewing dashboards.",
      },
    ],
  },
  {
    slug: "clinic-desk-whatsapp-booking",
    title: "Clinic Desk + WhatsApp Booking on a Shared API",
    excerpt:
      "How dental clinics get a front-desk app, marketing site, and WhatsApp confirmations from one multi-tenant backend.",
    metaDescription:
      "Architecture for clinic front-desk software, tenant marketing domains, and WhatsApp patient flows on GCP.",
    keywords: ["clinic software", "WhatsApp booking", "dental clinic app", "multi-tenant healthcare"],
    publishedAt: "2026-07-05",
    readMinutes: 6,
    heroImage: "/portfolio/clinic-crm-ui.png",
    relatedServiceSlug: "healthcare-clinic-software",
    relatedCaseStudySlug: "healthcare-clinic-digital-suite",
    sections: [
      {
        heading: "Three surfaces, one tenant",
        paragraphs: [
          "Clinic products usually need three surfaces: a staff desk app, a public marketing site, and messaging for booking confirmations — all authenticated against one multi-tenant API with tenant-scoped tokens.",
        ],
      },
      {
        heading: "Clinic desk workflows",
        paragraphs: [
          "The today board shows waiting patients, pending confirmations, and quick book actions. Staff use tablets at reception; the UI is touch-friendly with minimal training.",
        ],
      },
      {
        heading: "WhatsApp clinic bot",
        paragraphs: [
          "The shared API includes clinic bot flows for appointment reminders and booking intents. Meta webhook routing uses tenant context from the connected phone number and slug headers.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can clinics white-label the desk app?",
        answer:
          "Yes. Tenant name and hostname branding are resolved at login; marketing sites are fully branded per clinic.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
