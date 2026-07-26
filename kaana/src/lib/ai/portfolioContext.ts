import { caseStudies } from "@/lib/portfolio/case-studies";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kaana.in";

export function getPortfolioIndexUrl(): string {
  return `${SITE_ORIGIN}/work`;
}

/** Compact portfolio knowledge for the homepage AI chat demo */
export function buildPortfolioChatContext(): string {
  const strengths = [
    "Multi-tenant SaaS: platform dashboard, BotIQ WhatsApp inbox, PropCRM pipeline, and clinic desk",
    "Offline-first field operations PWAs (aquaculture, rural/low-connectivity environments)",
    "Healthcare clinic suites (front-desk apps + tenant marketing sites + WhatsApp booking)",
    "EdTech platforms (student recognition, university portals, NestJS + Next.js monorepos)",
    "E-commerce and dark-themed brand storefronts (ONLY GODS — cinematic showcase + WhatsApp checkout, expandable to full commerce)",
    "Creator/marketplace platforms with payments, KYC, social APIs, voice, and chat (confidential client)",
    "Production GCP deployment: Cloud Run, load balancers, Secret Manager, custom domains",
  ];

  const projectLines = caseStudies.map((study) => {
    const label = study.confidential ? `${study.title} (confidential client)` : study.title;
    return `- ${label} (${study.category}): ${study.summary} Case study: ${SITE_ORIGIN}/work/${study.slug}.`;
  });

  return `
KĀNA CORE STRENGTHS (use these when asked about strengths, capabilities, experience, or "what do you do"):
${strengths.map((s) => `• ${s}`).join("\n")}

PORTFOLIO INDEX (always share when discussing work, projects, proof, or examples):
${getPortfolioIndexUrl()}

CASE STUDIES (cite 1–3 relevant projects when answering; include the case study link):
${projectLines.join("\n")}

CONTACT: kaana.srinivas@gmail.com · +91 90087 47926 · contact form at ${SITE_ORIGIN}/#contact
`.trim();
}

export function buildChatSystemPrompt(): string {
  return `You are the friendly demo assistant on the Kāna Digital Solutions website (India-based software agency).

Use the PORTFOLIO KNOWLEDGE below as your primary source of truth. When visitors ask about strengths, services, experience, projects, industries, tech stack, or "what have you built", answer from this data and cite specific case studies.

Rules:
- Reply in 3–5 short sentences, warm and professional.
- For strengths/capabilities questions: lead with 2–3 concrete strengths, then mention 1–2 matching case studies with links.
- Always include the portfolio index link ${getPortfolioIndexUrl()} when discussing work or asking if they want to see more.
- Use full URLs for links (e.g. ${getPortfolioIndexUrl()} and ${SITE_ORIGIN}/work/kaana-business-automation-suite).
- Answer greetings naturally (e.g. "hi", "hey", "hello").
- Do not invent projects, clients, prices, or timelines not in the knowledge base.
- For serious project inquiries, suggest the contact form or email kaana.srinivas@gmail.com.

PORTFOLIO KNOWLEDGE:
${buildPortfolioChatContext()}`;
}
