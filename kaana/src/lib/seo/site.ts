import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kaana.in";

export const SITE_NAME = "Kaana Digital Solutions";

export const WHATSAPP_URL =
  "https://wa.me/919008747926?text=Hi%20Kaana%2C%20I%27d%20like%20to%20discuss%20a%20project";

export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/kaanaaitechnologies/";

export const LINKEDIN_URL =
  process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() ||
  "https://www.linkedin.com/company/kaana-ai-technologies-pvt-ltd/";

export const DEFAULT_DESCRIPTION =
  "Kaana is a custom software studio in India — web apps, mobile, AI chatbots, e-commerce, and digital marketing — with production case studies in WhatsApp automation, SaaS, healthcare, edtech, commerce, and offline field ops.";

export const DEFAULT_KEYWORDS = [
  "custom software development India",
  "web app development",
  "mobile app development",
  "AI chatbot development",
  "e-commerce development",
  "WhatsApp business automation",
  "multi-tenant SaaS",
  "GCP Cloud Run",
  "clinic CRM software",
  "offline-first PWA",
  "edtech platform development",
  "creator marketplace development",
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
      title: "Kaana",
      description: DEFAULT_DESCRIPTION,
      path: "/",
      keywords: [
        ...DEFAULT_KEYWORDS,
        "digital product studio",
        "software agency India",
        "web design and development",
      ],
    }),
    title: { absolute: "Kaana" },
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
    sameAs: [LINKEDIN_URL, INSTAGRAM_URL, WHATSAPP_URL],
    areaServed: ["IN", "Worldwide"],
    knowsAbout: [
      "Custom software development",
      "Web and mobile applications",
      "AI chatbots",
      "E-commerce platforms",
      "WhatsApp Business API",
      "Multi-tenant SaaS",
      "Google Cloud Platform",
      "Healthcare clinic software",
      "EdTech platforms",
      "Creator commerce",
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
