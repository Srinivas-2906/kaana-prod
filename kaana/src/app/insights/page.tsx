import Link from "next/link";
import type { Metadata } from "next";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { articles } from "@/lib/seo/articles";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights — Technical Articles from Production | Kāna",
  description:
    "Project-backed technical writing on WhatsApp API integration, multi-tenant Cloud Run, offline PWAs, and clinic software — no generic marketing fluff.",
  path: "/insights",
  keywords: [
    "WhatsApp API technical guide",
    "Cloud Run multi-tenant",
    "offline PWA architecture",
    "clinic software engineering",
  ],
});

export default function InsightsIndexPage() {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <PortfolioShell>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mb-16">
            <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block">
              Insights
            </span>
            <h1 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-6">
              Technical notes from shipped work
            </h1>
            <p className="text-neutral-400 max-w-2xl text-lg">
              Architecture decisions, integration patterns, and field constraints —
              drawn from case studies we&apos;ve actually built and deployed.
            </p>
          </div>

          <div className="space-y-10 max-w-3xl">
            {sorted.map((article) => (
              <article
                key={article.slug}
                className="border-b border-neutral-800 pb-10 last:border-0"
              >
                <time
                  dateTime={article.publishedAt}
                  className="text-xs text-neutral-500 uppercase tracking-widest"
                >
                  {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" · "}
                  {article.readMinutes} min read
                </time>
                <h2 className="text-2xl font-display text-neutral-100 mt-3 mb-3">
                  <Link
                    href={`/insights/${article.slug}`}
                    className="hover:text-accent transition-colors link-trigger"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="text-neutral-400 mb-4">{article.excerpt}</p>
                <Link
                  href={`/insights/${article.slug}`}
                  className="text-sm text-accent hover:underline link-trigger"
                >
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
