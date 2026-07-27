export type SolutionTag =
  | "multi-tenant"
  | "offline-first"
  | "whatsapp-automation"
  | "payments"
  | "kyc-compliance"
  | "social-integrations"
  | "voice-telephony"
  | "ai-automation"
  | "pwa"
  | "e-commerce"
  | "healthcare"
  | "education"
  | "operations"
  | "creator-economy";

export type IndustryTag =
  | "saas"
  | "aquaculture"
  | "creator-commerce"
  | "education"
  | "healthcare"
  | "retail"
  | "hospitality"
  | "productivity";

export type StackGroup = {
  label: string;
  items: string[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  featured: boolean;
  confidential: boolean;
  /** Live production vs actively evolving engagement */
  projectStatus?: "live" | "ongoing" | "demo";
  solutionTags: SolutionTag[];
  industryTags: IndustryTag[];
  heroImage: string;
  /** Additional real UI screenshots for detail pages */
  galleryImages?: { label: string; src: string }[];
  /** Shorter copy for homepage featured grid */
  homePreview?: {
    category: string;
    title: string;
    excerpt: string;
    image: string;
    /** Extra screenshots for homepage carousel */
    images?: string[];
  };
  summary: string;
  context: string;
  scenario: string;
  constraints: string[];
  solution: string[];
  architecture: string[];
  integrations?: string[];
  reliability: string[];
  outcomes: string[];
  stack: StackGroup[];
  cta: string;
  socialHook: string;
  linkedInBullets: string[];
};
