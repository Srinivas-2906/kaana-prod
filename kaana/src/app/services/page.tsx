import Link from "next/link";
import type { Metadata } from "next";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { services } from "@/lib/seo/services";
import { buildPageMetadata } from "@/lib/seo/site";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = buildPageMetadata({
  title: "Services — Software, Automation, SaaS & Marketing",
  description:
    "Custom software, automation and AI chatbots, multi-tenant SaaS on GCP, and digital marketing — with production case studies across healthcare, edtech, commerce, and more.",
  path: "/services",
  keywords: [
    "custom software development",
    "WhatsApp automation services",
    "SaaS development GCP",
    "clinic software development",
    "offline PWA development",
    "edtech platform development",
  ],
});

export default function ServicesIndexPage() {
  return (
    <PortfolioShell>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mb-16">
            <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block">
              Services
            </span>
            <h1 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-6">
              Software, automation, and digital growth
            </h1>
            <p className="text-neutral-400 max-w-2xl text-lg">
              We build custom software, intelligent automation, multi-tenant SaaS, and
              digital marketing — backed by production case studies in WhatsApp ops,
              healthcare, edtech, commerce, and field operations. Explore highlights
              below or see the full portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group border border-neutral-800 rounded-sm overflow-hidden hover:border-accent/50 transition-colors link-trigger"
              >
                <div
                  className="aspect-[16/9] bg-neutral-900 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `url(${service.heroImage})` }}
                />
                <div className="p-8">
                  <h2 className="text-xl font-display text-neutral-100 mb-3 group-hover:text-accent transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {service.headline}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-20 text-center p-10 border border-neutral-800 rounded-sm">
            <p className="text-neutral-400 mb-6 max-w-xl mx-auto">
              These are production-proven specialties from our work — browse case studies
              for edtech, hospitality, commerce, and more.
            </p>
            <Link href="/work" className="btn btn-outline link-trigger inline-flex">
              View case studies
              <Icon name="arrow-right" className="text-xs ml-2 btn-icon" />
            </Link>
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
