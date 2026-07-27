export const caseStudyFaqs: Record<
  string,
  { question: string; answer: string }[]
> = {
  "kaana-business-automation-suite": [
    {
      question: "What products are included in the Kaana suite?",
      answer:
        "Marketing site, platform dashboard, BotIQ WhatsApp inbox, PropCRM pipeline, clinic front-desk app, and a shared Express API — all multi-tenant on GCP.",
    },
    {
      question: "How are new clients provisioned?",
      answer:
        "Platform admins create tenants via a provisioning API that returns inbox, CRM, and clinic URLs plus default credentials in under a minute.",
    },
    {
      question: "Which cloud provider hosts production?",
      answer:
        "Google Cloud Platform — Cloud Run services behind a global HTTPS load balancer with Secret Manager for credentials.",
    },
  ],
  "offline-aquaculture-operations": [
    {
      question: "Does the app work without internet?",
      answer:
        "Yes. Supervisors record feeding offline; data syncs when connectivity returns, with owner approval for late submissions.",
    },
    {
      question: "What auth do field staff use?",
      answer: "Phone number and 6-digit PIN — no email required for pond supervisors.",
    },
    {
      question: "Can owners export reports?",
      answer:
        "Yes. PDF and Excel feeding reports are generated from confirmed entries and inventory deductions.",
    },
  ],
  "creator-commerce-operations-platform": [
    {
      question: "Why is this case study confidential?",
      answer:
        "The client platform includes KYC, payments, and creator data under NDA. We describe architecture and outcomes without naming the brand.",
    },
    {
      question: "What integrations were involved?",
      answer:
        "Razorpay payments, Amazon S3 media, social account linking, chat, voice, and 40+ backend modules on Express and Prisma.",
    },
  ],
  "student-recognition-platform": [
    {
      question: "How is authentication handled?",
      answer:
        "Clerk protects admin and university portals; the public student app uses the Faralin API with PostgreSQL on Cloud SQL.",
    },
    {
      question: "Where is it hosted?",
      answer:
        "GCP Cloud Run (faralin-web, faralin-api, faralin-university, faralin-admin) with a shared PostgreSQL instance.",
    },
  ],
  "healthcare-clinic-digital-suite": [
    {
      question: "Can each clinic have its own domain?",
      answer:
        "Yes. Tenant marketing sites and clinic desk URLs use per-clinic subdomains on the shared load balancer.",
    },
    {
      question: "Is WhatsApp used for patient communication?",
      answer:
        "Yes. Booking confirmations and clinic bot flows run through the shared API and Meta WhatsApp provider.",
    },
  ],
  "restaurant-digital-menu": [
    {
      question: "Does the QR menu require an app install?",
      answer: "No. It is a mobile web app — customers scan a QR code and browse in the browser.",
    },
    {
      question: "How many menu items does it support?",
      answer:
        "The New Ram Sai deployment includes 200+ items across 32 categories with veg/non-veg filters and local cart.",
    },
  ],
  "retail-commerce-storefront": [
    {
      question: "How does checkout work today?",
      answer:
        "Phase 1 uses WhatsApp order deep links from the cart drawer; payment gateway integration is planned for phase 2.",
    },
    {
      question: "Is the storefront a template theme?",
      answer:
        "No. ONLY GODS uses a bespoke dark cinematic design on TanStack Start — not a generic e-commerce template.",
    },
  ],
  "firebase-productivity-pwa": [
    {
      question: "Which Firebase products are used?",
      answer: "Firebase Auth, Firestore for real-time sync, and Storage for voice memos.",
    },
    {
      question: "Is data isolated per user?",
      answer:
        "Yes. Firestore security rules enforce uid == resource.data.uid on all reads and writes.",
    },
  ],
  "inventory-operations-demo": [
    {
      question: "Is this a production WMS?",
      answer:
        "No. StockFlow is a frontend prototype for sales conversations — local state, no backend API.",
    },
    {
      question: "What does the AI score indicate?",
      answer:
        "Demo reorder intelligence scores SKUs by demand, turnover, and lead time to prioritise purchase orders.",
    },
  ],
};

export function getCaseStudyFaqs(slug: string) {
  return caseStudyFaqs[slug] ?? [];
}
