import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import PortfolioShell, {
  BulletList,
  SectionBlock,
} from "@/components/portfolio/PortfolioShell";
import { getCaseStudy } from "@/lib/portfolio/case-studies";
import { getArticle } from "@/lib/seo/articles";
import { serviceJsonLd } from "@/lib/seo/jsonld";
import {
  getAllServiceSlugs,
  getService,
} from "@/lib/seo/services";
import { buildPageMetadata } from "@/lib/seo/site";
import Icon from "@/components/ui/Icon";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service" };
  return buildPageMetadata({
    title: `${service.title} — Services`,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
    keywords: service.keywords,
    ogImage: service.heroImage,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const relatedStudies = service.relatedCaseStudySlugs
    .map((s) => getCaseStudy(s))
    .filter(Boolean);
  const relatedArticles = service.relatedArticleSlugs
    .map((s) => getArticle(s))
    .filter(Boolean);

  return (
    <PortfolioShell>
      <JsonLd data={serviceJsonLd(service)} />
      <article className="pb-24">
        <nav className="container mx-auto px-6 mb-8 pt-4 text-sm text-neutral-500">
          <Link href="/" className="hover:text-accent transition-colors link-trigger">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/services" className="hover:text-accent transition-colors link-trigger">
            Services
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-400">{service.title}</span>
        </nav>

        <header className="container mx-auto px-6 mb-12">
          <div className="max-w-4xl mb-8">
            <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block">
              Service
            </span>
            <h1 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-4">
              {service.title}
            </h1>
            <p className="text-xl text-neutral-400">{service.headline}</p>
          </div>
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-sm border border-neutral-800">
            <Image
              src={service.heroImage}
              alt={service.title}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </header>

        <div className="container mx-auto px-6 max-w-4xl">
          <SectionBlock title="The problem">
            <p>{service.problem}</p>
          </SectionBlock>

          <SectionBlock title="Our approach">
            <BulletList items={service.approach} />
          </SectionBlock>

          <SectionBlock title="Deliverables">
            <BulletList items={service.deliverables} />
          </SectionBlock>

          {service.faqs.length > 0 && (
            <SectionBlock title="FAQ">
              <div className="space-y-6">
                {service.faqs.map((faq) => (
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

          {relatedStudies.length > 0 && (
            <section className="mt-16">
              <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
                Related case studies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedStudies.map(
                  (study) =>
                    study && (
                      <Link
                        key={study.slug}
                        href={`/work/${study.slug}`}
                        className="p-6 border border-neutral-800 rounded-sm hover:border-accent/50 transition-colors link-trigger"
                      >
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">
                          {study.category}
                        </span>
                        <h3 className="text-lg text-neutral-100 font-display mt-2">
                          {study.title}
                        </h3>
                      </Link>
                    ),
                )}
              </div>
            </section>
          )}

          {relatedArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
                Technical insights
              </h2>
              <ul className="space-y-3">
                {relatedArticles.map(
                  (article) =>
                    article && (
                      <li key={article.slug}>
                        <Link
                          href={`/insights/${article.slug}`}
                          className="text-accent hover:underline link-trigger"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ),
                )}
              </ul>
            </section>
          )}

          <section className="mt-16 p-8 border border-neutral-800 rounded-sm bg-gradient-to-br from-dark to-neutral-900">
            <h2 className="text-lg font-display text-neutral-100 mb-4">
              Discuss {service.title.toLowerCase()}
            </h2>
            <p className="text-neutral-400 mb-6">
              Tell us about your integrations, tenant model, or field constraints.
            </p>
            <Link href="/#contact" className="btn btn-outline link-trigger inline-flex">
              Get in touch
              <Icon name="arrow-right" className="text-xs ml-2 btn-icon" />
            </Link>
          </section>
        </div>
      </article>
    </PortfolioShell>
  );
}
