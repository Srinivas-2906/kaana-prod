export type ServicePage = {
  slug: string;
  title: string;
  headline: string;
  metaDescription: string;
  keywords: string[];
  heroImage: string;
  problem: string;
  approach: string[];
  deliverables: string[];
  relatedCaseStudySlugs: string[];
  relatedArticleSlugs: string[];
  faqs: { question: string; answer: string }[];
};

export const services: ServicePage[] = [
  {
    slug: "whatsapp-business-automation",
    title: "WhatsApp Business Automation",
    headline: "Inbox, CRM, and clinic flows on the WhatsApp Business API",
    metaDescription:
      "Kaana builds WhatsApp Business API integrations — shared inbox, lead capture, CRM pipeline, and clinic booking — on GCP with multi-tenant isolation.",
    keywords: [
      "WhatsApp Business API integration",
      "WhatsApp CRM India",
      "WhatsApp inbox software",
      "Meta WhatsApp automation",
    ],
    heroImage: "/portfolio/botiq-inbox-ui.png",
    problem:
      "Most Indian SMBs run customer conversations on WhatsApp, but leads live in personal chats, spreadsheets, and disconnected CRM tools. Teams lose context, miss follow-ups, and cannot scale beyond one phone.",
    approach: [
      "Meta Cloud API webhooks with verified tokens stored in Secret Manager",
      "Shared BotIQ inbox with conversation routing and agent takeover",
      "PropCRM pipeline synced from WhatsApp enquiries and site forms",
      "Optional clinic desk module for appointment and patient workflows",
      "Per-tenant subdomains and JWT isolation on a single GCP deploy",
    ],
    deliverables: [
      "Production WhatsApp webhook + message send pipeline",
      "Tenant-scoped inbox and CRM web apps",
      "Platform admin provisioning for new clients",
      "Cloud Run deployment with custom domains and SSL",
    ],
    relatedCaseStudySlugs: [
      "kaana-business-automation-suite",
      "healthcare-clinic-digital-suite",
    ],
    relatedArticleSlugs: ["whatsapp-business-api-crm-gcp"],
    faqs: [
      {
        question: "Do you use the official WhatsApp Business API?",
        answer:
          "Yes. We integrate via Meta's Cloud API (and can support Twilio where required), including webhook verification, phone number ID configuration, and template messaging where applicable.",
      },
      {
        question: "Can one platform serve multiple business tenants?",
        answer:
          "Yes. Our Kaana suite is multi-tenant from day one — each client gets isolated JWT auth, optional per-tenant subdomains, and shared infrastructure on GCP Cloud Run.",
      },
      {
        question: "How long does a typical WhatsApp automation project take?",
        answer:
          "An MVP inbox + CRM for one tenant often ships in 4–8 weeks depending on webhook complexity, CRM customisation, and Meta Business verification timelines.",
      },
    ],
  },
  {
    slug: "multi-tenant-saas-gcp",
    title: "Multi-Tenant SaaS on GCP",
    headline: "One codebase, unlimited tenants — Cloud Run, JWT, and wildcard domains",
    metaDescription:
      "Design and build multi-tenant SaaS on Google Cloud Run with tenant provisioning, Secret Manager, global HTTPS load balancing, and per-tenant URLs.",
    keywords: [
      "multi-tenant SaaS GCP",
      "Cloud Run SaaS architecture",
      "tenant provisioning API",
      "SaaS development India",
    ],
    heroImage: "/portfolio/propcrm-ui.png",
    problem:
      "Teams rebuilding separate deployments per client burn ops budget. You need tenant isolation, fast provisioning, and one release pipeline — without sacrificing security or custom domains.",
    approach: [
      "JWT + hostname-based tenant context across all product surfaces",
      "Platform-admin API to create tenants, default users, and product links in one call",
      "Cloud Build CI/CD with environment-specific build args per app",
      "Global HTTPS load balancer with host-based routing to Cloud Run services",
      "Secret Manager for JWT, payment keys, and third-party tokens",
    ],
    deliverables: [
      "Multi-app suite (marketing, dashboard, inbox, CRM, API)",
      "Tenant provisioning and admin console",
      "Production GCP infrastructure with managed SSL",
      "Documentation for onboarding new tenants",
    ],
    relatedCaseStudySlugs: [
      "kaana-business-automation-suite",
      "student-recognition-platform",
    ],
    relatedArticleSlugs: [
      "instagram-influencer-collaboration-platform",
      "multi-tenant-cloud-run-architecture",
    ],
    faqs: [
      {
        question: "Which GCP services do you typically use?",
        answer:
          "Cloud Run for web and API services, Cloud Build for CI/CD, Artifact Registry for images, Secret Manager for credentials, Cloud SQL or SQLite with backup buckets depending on scale, and a global HTTPS load balancer for custom domains.",
      },
      {
        question: "How is tenant data isolated?",
        answer:
          "Every API request carries a tenant-scoped JWT. Database queries filter by tenant ID, and platform-admin routes are role-separated from tenant user routes.",
      },
      {
        question: "Can you add new product modules later?",
        answer:
          "Yes. Our suite pattern uses a shared API with product flags per tenant — inbox, CRM, and clinic modules can be enabled independently at provision time.",
      },
    ],
  },
  {
    slug: "healthcare-clinic-software",
    title: "Healthcare & Clinic Software",
    headline: "Front-desk apps, tenant marketing sites, and WhatsApp-connected patient ops",
    metaDescription:
      "Clinic desk software, branded tenant websites, and WhatsApp booking flows for dental and specialty practices — deployed on shared GCP infrastructure.",
    keywords: [
      "clinic CRM software",
      "dental clinic app India",
      "healthcare front desk software",
      "clinic WhatsApp booking",
    ],
    heroImage: "/portfolio/clinic-crm-ui.png",
    problem:
      "Clinics need more than a brochure website. Front-desk staff need daily operations software for appointments, patients, and payments — plus WhatsApp for reminders — while each practice keeps its own brand.",
    approach: [
      "React clinic desk PWA with today board, bookings, and patient records",
      "Tenant marketing sites on separate Cloud Run services with custom domains",
      "Shared API for auth, appointments, and WhatsApp clinic bot flows",
      "Wildcard subdomain routing for per-clinic URLs (*.clinic, crm.{tenant})",
    ],
    deliverables: [
      "Clinic front-desk application",
      "Branded marketing website per tenant",
      "WhatsApp-connected booking and reminder flows",
      "Managed SSL and load balancer configuration",
    ],
    relatedCaseStudySlugs: ["healthcare-clinic-digital-suite"],
    relatedArticleSlugs: ["clinic-desk-whatsapp-booking"],
    faqs: [
      {
        question: "Is the clinic desk mobile-friendly for tablets?",
        answer:
          "Yes. The clinic desk is built mobile-first for front-desk tablets and phones, with tenant slug resolution from hostname or query parameters for local development.",
      },
      {
        question: "Can each clinic have its own domain?",
        answer:
          "Yes. We deploy tenant marketing sites (e.g. dentacare.kaana.in) and clinic desk URLs (crm.dentacare.kaana.in) on the shared GCP load balancer with managed certificates.",
      },
      {
        question: "Does this replace a full hospital EMR?",
        answer:
          "No. This is front-desk and patient-flow software for small and mid-sized clinics — appointments, daily board, and WhatsApp — not a full electronic medical records system.",
      },
    ],
  },
  {
    slug: "offline-first-field-apps",
    title: "Offline-First Field Apps",
    headline: "PWAs that work without signal — sync safely when connectivity returns",
    metaDescription:
      "Offline-first mobile PWAs for field teams: aquaculture feeding, inventory, approvals, and audit trails — built for low-end Android in rural India.",
    keywords: [
      "offline-first PWA",
      "field operations app",
      "aquaculture software",
      "low connectivity mobile app India",
    ],
    heroImage: "/portfolio/aquafarm-dashboard.png",
    problem:
      "Field staff in aquaculture, logistics, and rural operations cannot rely on continuous connectivity. Paper processes break audit trails; naive online-only apps fail in the pond.",
    approach: [
      "Installable PWA with local persistence and optimistic UI",
      "Idempotent sync API to prevent duplicate entries",
      "Phone + PIN auth for supervisors without email overhead",
      "Owner approval workflows for late or offline submissions",
      "English + regional language-ready architecture",
    ],
    deliverables: [
      "Mobile PWA with offline data layer",
      "NestJS or Node API with sync endpoints",
      "Owner dashboard and approval queues",
      "PDF/Excel export for compliance reporting",
    ],
    relatedCaseStudySlugs: ["offline-aquaculture-operations"],
    relatedArticleSlugs: ["offline-first-pwa-field-operations"],
    faqs: [
      {
        question: "What devices do you target?",
        answer:
          "Low-end Android phones from 360px width upward. We test PWA install flows, touch targets, and performance on mid-range devices common in rural India.",
      },
      {
        question: "How does sync handle conflicts?",
        answer:
          "We use idempotent client entry IDs, server-side validation rules (e.g. two-day edit windows), and owner approval queues for late offline submissions.",
      },
      {
        question: "Can this work for industries beyond aquaculture?",
        answer:
          "Yes. The same offline-first pattern applies to inventory checks, inspections, delivery confirmations, and any field workflow with intermittent connectivity.",
      },
    ],
  },
];

export function getService(slug: string): ServicePage | undefined {
  return services.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}
