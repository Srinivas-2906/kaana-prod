import Link from "next/link";
import type { Metadata } from "next";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { services } from "@/lib/seo/services";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Services — WhatsApp, SaaS, Clinic & Field Apps | Kaana",
  description:
    "WhatsApp Business automation, multi-tenant SaaS on GCP, healthcare clinic software, and offline-first field apps — built from production case studies.",
  path: "/services",
  keywords: [
    "WhatsApp automation services",
    "SaaS development GCP",
    "clinic software development",
    "offline PWA development",
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
              What we build — from production systems
            </h1>
            <p className="text-neutral-400 max-w-2xl text-lg">
              Each service maps to shipped work on GCP: WhatsApp inboxes, tenant
              provisioning, clinic desks, and offline field ops. No generic agency
              menus — only what we&apos;ve proven in production.
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
              See the full portfolio behind these services.
            </p>
            <Link href="/work" className="btn btn-outline link-trigger inline-flex">
              View case studies
              <i className="fas fa-arrow-right text-xs ml-2 btn-icon" />
            </Link>
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
