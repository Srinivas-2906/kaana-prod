import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kaana.in";

export const SITE_NAME = "Kāna Digital Solutions";

export const DEFAULT_DESCRIPTION =
  "Kāna designs and ships WhatsApp business automation, multi-tenant SaaS on GCP, healthcare clinic software, and offline-first field apps for teams in India and beyond.";

export const DEFAULT_KEYWORDS = [
  "WhatsApp business automation",
  "multi-tenant SaaS",
  "GCP Cloud Run",
  "clinic CRM software",
  "offline-first PWA",
  "custom software development India",
  "PropCRM",
  "BotIQ inbox",
];

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage = "/portfolio/kaana-platform-desktop.png",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage)],
    },
  };
}

export function homeMetadata(): Metadata {
  const verification: Metadata["verification"] = {};
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.GOOGLE_SITE_VERIFICATION;
  }

  return {
    ...buildPageMetadata({
      title: "WhatsApp Automation & Multi-Tenant SaaS on GCP | Kāna",
      description: DEFAULT_DESCRIPTION,
      path: "/",
      keywords: [
        ...DEFAULT_KEYWORDS,
        "WhatsApp CRM India",
        "clinic front desk software",
        "aquaculture field app",
        "digital product studio",
      ],
    }),
    verification,
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/portfolio/kaana-platform-desktop.png"),
    description: DEFAULT_DESCRIPTION,
    sameAs: [],
    areaServed: ["IN", "Worldwide"],
    knowsAbout: [
      "WhatsApp Business API",
      "Multi-tenant SaaS",
      "Google Cloud Platform",
      "Healthcare clinic software",
      "Offline-first mobile apps",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/work?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
