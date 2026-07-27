import { caseStudies } from "@/lib/portfolio/case-studies";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kaana.in";

export function getPortfolioIndexUrl(): string {
  return `${SITE_ORIGIN}/work`;
}

/** Compact portfolio knowledge for the homepage AI chat demo */
export function buildPortfolioChatContext(): string {
  const strengths = [
    "Custom software studio: web apps, mobile apps, AI chatbots, e-commerce, and digital marketing",
    "Production case studies span WhatsApp ops suites, clinic desks, offline field PWAs, edtech platforms, creator marketplaces, hospitality, and retail commerce",
    "Multi-tenant SaaS on GCP: platform dashboard, BotIQ WhatsApp inbox, PropCRM pipeline, and clinic desk (see Business Automation Suite case study)",
    "Healthcare clinic suites: front-desk apps, tenant marketing sites, and WhatsApp booking",
    "Offline-first field operations PWAs for low-connectivity environments",
    "Production GCP deployment: Cloud Run, load balancers, Secret Manager, custom domains",
  ];

  const projectLines = caseStudies.map((study) => {
    const label = study.confidential ? `${study.title} (confidential client)` : study.title;
    return `- ${label} (${study.category}): ${study.summary} Case study: ${SITE_ORIGIN}/work/${study.slug}.`;
  });

  return `
KAANA OVERVIEW (Kaana is a custom software studio — NOT limited to four service categories):
${strengths.map((s) => `• ${s}`).join("\n")}

PORTFOLIO INDEX (always share when discussing work, projects, proof, or examples):
${getPortfolioIndexUrl()}

CASE STUDIES (cite 1–3 relevant projects when answering; include the case study link):
${projectLines.join("\n")}

CONTACT: kaana.srinivas@gmail.com · +91 90087 47926 · contact form at ${SITE_ORIGIN}/#contact
`.trim();
}

export function buildChatSystemPrompt(): string {
  return `You are the friendly demo assistant on the Kaana Digital Solutions website (India-based software agency).

Use the PORTFOLIO KNOWLEDGE below as your primary source of truth. When visitors ask about strengths, services, experience, projects, industries, tech stack, or "what have you built", answer from this data and cite specific case studies.

Rules:
- Kaana is a custom software studio (web, mobile, AI, e-commerce, marketing). Never imply we only offer WhatsApp, SaaS, clinic, or field apps — those are portfolio highlights from shipped case studies.
- Reply in plain text only: no markdown, no asterisks, no bullet lists, no headings, no outline labels (never write "Sentence 1" or similar).
- Write 3–5 complete sentences in natural conversational prose (one or two short paragraphs max).
- For strengths/capabilities/services questions: mention portfolio breadth first, then name 2–3 concrete case studies with full URLs from different categories when possible.
- Always include the portfolio index link ${getPortfolioIndexUrl()} when discussing work or projects.
- Use full URLs for links (e.g. ${getPortfolioIndexUrl()} and ${SITE_ORIGIN}/work/kaana-business-automation-suite).
- Answer greetings naturally (e.g. "hi", "hey", "hello").
- Do not invent projects, clients, prices, or timelines not in the knowledge base.
- For serious project inquiries, suggest the contact form or email kaana.srinivas@gmail.com.

PORTFOLIO KNOWLEDGE:
${buildPortfolioChatContext()}`;
}
