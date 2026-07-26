import type { CaseStudy } from "@/lib/portfolio/types";
import { absoluteUrl } from "@/lib/seo/site";

export function caseStudyJsonLd(study: CaseStudy) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.summary,
    image: absoluteUrl(study.heroImage),
    author: {
      "@type": "Organization",
      name: "Kāna Digital Solutions",
    },
    publisher: {
      "@type": "Organization",
      name: "Kāna Digital Solutions",
    },
    mainEntityOfPage: absoluteUrl(`/work/${study.slug}`),
    articleSection: study.category,
    keywords: [...study.solutionTags, ...study.industryTags].join(", "),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function serviceJsonLd(service: {
  title: string;
  metaDescription: string;
  slug: string;
  faqs: { question: string; answer: string }[];
}) {
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      description: service.metaDescription,
      provider: {
        "@type": "Organization",
        name: "Kāna Digital Solutions",
      },
      url: absoluteUrl(`/services/${service.slug}`),
    },
  ];
  const faq = faqJsonLd(service.faqs);
  if (faq) schemas.push(faq);
  return schemas;
}

export function articleJsonLd(article: {
  title: string;
  metaDescription: string;
  slug: string;
  publishedAt: string;
  heroImage: string;
  faqs: { question: string; answer: string }[];
}) {
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDescription,
      datePublished: article.publishedAt,
      image: absoluteUrl(article.heroImage),
      author: {
        "@type": "Organization",
        name: "Kāna Digital Solutions",
      },
      mainEntityOfPage: absoluteUrl(`/insights/${article.slug}`),
    },
  ];
  const faq = faqJsonLd(article.faqs);
  if (faq) schemas.push(faq);
  return schemas;
}

/** Map case study solution tags to service pages for internal linking */
export function relatedServicesForStudy(study: CaseStudy): string[] {
  const map: Partial<Record<string, string>> = {
    "whatsapp-automation": "whatsapp-business-automation",
    "multi-tenant": "multi-tenant-saas-gcp",
    healthcare: "healthcare-clinic-software",
    "offline-first": "offline-first-field-apps",
    operations: "offline-first-field-apps",
    pwa: "offline-first-field-apps",
  };
  const slugs = new Set<string>();
  for (const tag of study.solutionTags) {
    const slug = map[tag];
    if (slug) slugs.add(slug);
  }
  if (study.industryTags.includes("healthcare")) {
    slugs.add("healthcare-clinic-software");
  }
  if (study.industryTags.includes("aquaculture")) {
    slugs.add("offline-first-field-apps");
  }
  if (study.industryTags.includes("saas")) {
    slugs.add("multi-tenant-saas-gcp");
  }
  return [...slugs];
}
