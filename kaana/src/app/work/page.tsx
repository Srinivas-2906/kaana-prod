import Link from "next/link";
import type { Metadata } from "next";
import { caseStudies } from "@/lib/portfolio/case-studies";
import CaseStudyCard from "@/components/portfolio/CaseStudyCard";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Work & Case Studies | Kaana Digital Solutions",
  description:
    "Explore how Kaana designs and delivers multi-tenant SaaS, offline field ops, creator commerce platforms, healthcare suites, and more.",
  path: "/work",
});

export default function WorkPage() {
  const featured = caseStudies.filter((c) => c.featured);
  const rest = caseStudies.filter((c) => !c.featured);

  return (
    <PortfolioShell>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mb-16">
            <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">
              Our Work
            </span>
            <h1 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-6 reveal-up">
              Solutions we&apos;ve built for real-world operations
            </h1>
            <p className="text-neutral-400 max-w-2xl reveal-up text-lg">
              We don&apos;t just ship apps — we design systems: integrations,
              workflows, infrastructure, and the business rules that make software
              work in production.
            </p>
          </div>

          <div className="mb-20">
            <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-8">
              Featured
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              {featured.map((study, i) => (
                <div key={study.slug} style={{ transitionDelay: `${0.1 * i}s` }}>
                  <CaseStudyCard study={study} featured={i === 0} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-8">
              More projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {rest.map((study) => (
                <CaseStudyCard key={study.slug} study={study} />
              ))}
            </div>
          </div>

          <div className="mt-20 text-center p-10 border border-neutral-800 rounded-sm bg-dark/50">
            <h2 className="text-2xl font-display text-neutral-100 mb-4">
              Have a similar challenge?
            </h2>
            <p className="text-neutral-400 mb-6 max-w-xl mx-auto">
              Tell us about your operations, integrations, or industry constraints.
              We&apos;ll map a solution — not just a feature list.
            </p>
            <Link href="/#contact" className="btn btn-outline link-trigger inline-flex">
              Start a conversation
              <i className="fas fa-arrow-right text-xs ml-2 btn-icon" />
            </Link>
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
