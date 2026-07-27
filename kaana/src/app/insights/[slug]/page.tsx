import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import PortfolioShell, { SectionBlock } from "@/components/portfolio/PortfolioShell";
import { getCaseStudy } from "@/lib/portfolio/case-studies";
import { getAllArticleSlugs, getArticle } from "@/lib/seo/articles";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { getService } from "@/lib/seo/services";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Insights | Kaana" };
  return buildPageMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/insights/${article.slug}`,
    keywords: article.keywords,
    ogImage: article.heroImage,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const relatedService = getService(article.relatedServiceSlug);
  const relatedStudy = getCaseStudy(article.relatedCaseStudySlug);

  return (
    <PortfolioShell>
      <JsonLd data={articleJsonLd(article)} />
      <article className="pb-24">
        <nav className="container mx-auto px-6 mb-8 pt-4 text-sm text-neutral-500">
          <Link href="/" className="hover:text-accent transition-colors link-trigger">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/insights" className="hover:text-accent transition-colors link-trigger">
            Insights
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-400 line-clamp-1">{article.title}</span>
        </nav>

        <header className="container mx-auto px-6 mb-12 max-w-3xl">
          <time
            dateTime={article.publishedAt}
            className="text-xs text-neutral-500 uppercase tracking-widest block mb-4"
          >
            {new Date(article.publishedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {article.readMinutes} min read
          </time>
          <h1 className="text-3xl md:text-4xl text-neutral-100 font-display font-medium mb-6">
            {article.title}
          </h1>
          <p className="text-lg text-neutral-400">{article.excerpt}</p>
        </header>

        <div className="container mx-auto px-6 mb-12 max-w-4xl">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-sm border border-neutral-800">
            <Image
              src={article.heroImage}
              alt=""
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-3xl">
          {article.sections.map((section) => (
            <SectionBlock key={section.heading} title={section.heading}>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </SectionBlock>
          ))}

          {article.faqs.length > 0 && (
            <SectionBlock title="FAQ">
              <div className="space-y-6">
                {article.faqs.map((faq) => (
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

          <section className="mt-16 p-8 border border-neutral-800 rounded-sm space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-neutral-500">
              Related
            </h2>
            {relatedService && (
              <p>
                <span className="text-neutral-500">Service: </span>
                <Link
                  href={`/services/${relatedService.slug}`}
                  className="text-accent hover:underline link-trigger"
                >
                  {relatedService.title}
                </Link>
              </p>
            )}
            {relatedStudy && (
              <p>
                <span className="text-neutral-500">Case study: </span>
                <Link
                  href={`/work/${relatedStudy.slug}`}
                  className="text-accent hover:underline link-trigger"
                >
                  {relatedStudy.title}
                </Link>
              </p>
            )}
          </section>

          <div className="mt-12">
            <Link
              href="/insights"
              className="text-sm text-accent hover:underline link-trigger"
            >
              ← All insights
            </Link>
          </div>
        </div>
      </article>
    </PortfolioShell>
  );
}
