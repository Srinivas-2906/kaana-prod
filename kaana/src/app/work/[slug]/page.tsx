import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import {
  caseStudies,
  getAllSlugs,
  getCaseStudy,
} from "@/lib/portfolio/case-studies";
import PortfolioShell, {
  BulletList,
  PortfolioBreadcrumb,
  SectionBlock,
  StackGrid,
} from "@/components/portfolio/PortfolioShell";
import PortfolioImageCarousel from "@/components/portfolio/PortfolioImageCarousel";
import { getStudySlides } from "@/lib/portfolio/images";
import { getCaseStudyFaqs } from "@/lib/seo/case-study-faqs";
import {
  caseStudyJsonLd,
  faqJsonLd,
  relatedServicesForStudy,
} from "@/lib/seo/jsonld";
import { getService } from "@/lib/seo/services";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Case Study | Kaana" };
  return buildPageMetadata({
    title: `${study.title} | Kaana Case Study`,
    description: study.summary,
    path: `/work/${study.slug}`,
    keywords: [...study.solutionTags, ...study.industryTags],
    ogImage: study.heroImage,
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const related = caseStudies
    .filter((c) => c.slug !== slug && c.industryTags.some((t) => study.industryTags.includes(t)))
    .slice(0, 2);
  const slides = getStudySlides(study, "detail");
  const faqs = getCaseStudyFaqs(slug);
  const serviceSlugs = relatedServicesForStudy(study);
  const relatedServices = serviceSlugs
    .map((s) => getService(s))
    .filter(Boolean);

  const jsonLd = [
    caseStudyJsonLd(study),
    ...(faqJsonLd(faqs) ? [faqJsonLd(faqs)!] : []),
  ];

  return (
    <PortfolioShell>
      <JsonLd data={jsonLd} />
      <article className="pb-24">
        <PortfolioBreadcrumb title={study.title} />

        <header className="container mx-auto px-6 mb-12">
          <div className="max-w-4xl">
            <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block">
              {study.category}
              {study.projectStatus === "ongoing" && " · Ongoing project"}
              {study.confidential && " · Confidential client"}
            </span>
            <h1 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-4">
              {study.title}
            </h1>
            <p className="text-xl text-neutral-400 mb-8">{study.subtitle}</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {study.solutionTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-wider text-neutral-400 border border-neutral-800 px-2 py-1 rounded-sm"
                >
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>
          <PortfolioImageCarousel
            slides={slides}
            aspect="hero"
            className="mb-8 w-full"
          />
        </header>

        <div className="container mx-auto px-6 max-w-4xl">
          <SectionBlock title="Overview">
            <p className="text-lg text-neutral-200">{study.summary}</p>
          </SectionBlock>

          <SectionBlock title="Context">
            <p>{study.context}</p>
          </SectionBlock>

          <SectionBlock title="Real-world scenario">
            <p className="border-l-2 border-accent pl-6 italic text-neutral-200">
              {study.scenario}
            </p>
          </SectionBlock>

          <SectionBlock title="Constraints">
            <BulletList items={study.constraints} />
          </SectionBlock>

          <SectionBlock title="What we built">
            <BulletList items={study.solution} />
          </SectionBlock>

          <SectionBlock title="Architecture">
            <BulletList items={study.architecture} />
          </SectionBlock>

          {study.integrations && study.integrations.length > 0 && (
            <SectionBlock title="Integrations & platforms">
              <BulletList items={study.integrations} />
            </SectionBlock>
          )}

          <SectionBlock title="Reliability & security">
            <BulletList items={study.reliability} />
          </SectionBlock>

          <SectionBlock title="Outcomes">
            <BulletList items={study.outcomes} />
          </SectionBlock>

          <SectionBlock title="Technology stack">
            <StackGrid groups={study.stack} />
          </SectionBlock>

          {faqs.length > 0 && (
            <SectionBlock title="FAQ">
              <div className="space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="text-neutral-100 font-medium mb-2">
                      {faq.question}
                    </h3>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {relatedServices.length > 0 && (
            <section className="mt-12">
              <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
                Related services
              </h2>
              <div className="flex flex-wrap gap-3">
                {relatedServices.map(
                  (service) =>
                    service && (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="text-sm border border-neutral-800 px-4 py-2 rounded-sm text-neutral-300 hover:border-accent/50 hover:text-accent transition-colors link-trigger"
                      >
                        {service.title}
                      </Link>
                    ),
                )}
              </div>
            </section>
          )}

          <section className="mt-16 p-8 border border-neutral-800 rounded-sm bg-gradient-to-br from-dark to-neutral-900">
            <h2 className="text-xs uppercase tracking-widest text-accent mb-4">
              For social · LinkedIn hook
            </h2>
            <p className="text-lg text-neutral-100 font-display mb-4">
              {study.socialHook}
            </p>
            <ul className="space-y-2 text-neutral-400 text-sm mb-6">
              {study.linkedInBullets.map((b) => (
                <li key={b}>→ {b}</li>
              ))}
            </ul>
            <p className="text-neutral-300 mb-6">{study.cta}</p>
            <Link href="/#contact" className="btn btn-outline link-trigger inline-flex">
              Discuss a similar project
              <i className="fas fa-arrow-right text-xs ml-2 btn-icon" />
            </Link>
          </section>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
                Related work
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/work/${r.slug}`}
                    className="p-6 border border-neutral-800 rounded-sm hover:border-accent/50 transition-colors link-trigger"
                  >
                    <span className="text-xs text-neutral-500 uppercase tracking-widest">
                      {r.category}
                    </span>
                    <h3 className="text-lg text-neutral-100 font-display mt-2">
                      {r.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12">
            <Link
              href="/work"
              className="text-sm text-accent hover:underline link-trigger"
            >
              ← All case studies
            </Link>
          </div>
        </div>
      </article>
    </PortfolioShell>
  );
}
