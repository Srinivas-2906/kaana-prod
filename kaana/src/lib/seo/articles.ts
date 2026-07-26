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
    slug: "whatsapp-business-api-crm-gcp",
    title: "Connecting WhatsApp Business API to a CRM on GCP",
    excerpt:
      "How we wire Meta webhooks, a shared inbox, and a lead pipeline on Cloud Run — without a separate deploy per client.",
    metaDescription:
      "Technical guide: WhatsApp Business API webhooks, BotIQ inbox, PropCRM pipeline, and multi-tenant auth on Google Cloud Run.",
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
          "We built the Kaana suite so Meta webhooks hit one Express API, conversations land in BotIQ, and enquiries sync to PropCRM — all behind tenant-scoped JWT auth.",
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
          "Yes. BotIQ supports agent takeover with live WhatsApp send via the API, plus demo threads for sales environments.",
      },
    ],
  },
  {
    slug: "multi-tenant-cloud-run-architecture",
    title: "Multi-Tenant SaaS on Cloud Run: URLs, JWT, and Provisioning",
    excerpt:
      "Hostname routing, tenant provisioning in one API call, and why we avoid per-client Cloud Run services.",
    metaDescription:
      "How Kāna runs unlimited SaaS tenants on one GCP project using Cloud Run, wildcard domains, and platform-admin provisioning.",
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
          "Per-client Cloud Run services do not scale operationally. We use hostname and JWT context to resolve tenants at request time — dentacare.inbox.kaana.in and prestige-properties.crm.kaana.in hit the same container image.",
          "Platform admins provision tenants via POST /api/platform/admin/provision, which creates the tenant row, default Admin user, and deep links to inbox, CRM, and clinic products.",
        ],
      },
      {
        heading: "Load balancer and SSL",
        paragraphs: [
          "Google-managed certificates cover kaana.in subdomains and selected wildcards. The URL map routes by Host header to serverless NEGs backed by Cloud Run revisions.",
          "This pattern also works for aquafarm.kaana.in, faralin.kaana.in, and tenant marketing sites on the same project.",
        ],
      },
      {
        heading: "When to split databases",
        paragraphs: [
          "Early-stage suites use SQLite with GCS backup or a shared PostgreSQL instance with separate schemas or databases per product. Faralin and Aquafarm share a Cloud SQL instance with separate database names — cost-effective at moderate scale.",
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
      "Phone + PIN auth, idempotent sync, and owner approvals — lessons from aquaculture feeding apps in rural India.",
    metaDescription:
      "Building offline-first PWAs for shrimp farms and field ops: local persistence, sync rules, and approval workflows on GCP.",
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
          "Supervisors walk pond-to-pond with intermittent 4G. An online-only form fails silently or frustrates users. We built Aquafarm as an installable PWA with local storage and background sync when signal returns.",
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
          "React PWA front end, NestJS API on Cloud Run, PostgreSQL on Cloud SQL. Phone + 6-digit PIN keeps auth simple for field staff who do not use email daily.",
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
          "Denta Care runs crm.dentacare.kaana.in for front-desk staff, dentacare.kaana.in for public marketing, and WhatsApp for booking confirmations — all authenticated against api.kaana.in with tenant-scoped JWT.",
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
