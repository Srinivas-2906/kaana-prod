"use client";

import Link from "next/link";
import { useSiteEffects } from "@/hooks/useSiteEffects";
import Header from "@/components/site/Header";
import MobileMenu from "@/components/site/MobileMenu";
import Footer from "@/components/site/Footer";
import BackToTop from "@/components/site/BackToTop";
import GlobalOverlays from "@/components/site/GlobalOverlays";

export default function PortfolioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useSiteEffects();

  return (
    <>
      <GlobalOverlays />
      <Header />
      <MobileMenu />
      <main className="pt-24 min-h-screen">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}

export function PortfolioBreadcrumb({
  title,
}: {
  title: string;
}) {
  return (
    <nav className="container mx-auto px-6 mb-8 text-sm text-neutral-500">
      <Link href="/" className="hover:text-accent transition-colors link-trigger">
        Home
      </Link>
      <span className="mx-2">/</span>
      <Link href="/work" className="hover:text-accent transition-colors link-trigger">
        Work
      </Link>
      <span className="mx-2">/</span>
      <span className="text-neutral-400">{title}</span>
    </nav>
  );
}

export function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4">
        {title}
      </h2>
      <div className="text-neutral-300 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="text-accent mt-1 shrink-0">
            <i className="fas fa-check text-xs" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function StackGrid({
  groups,
}: {
  groups: { label: string; items: string[] }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {groups.map((group) => (
        <div
          key={group.label}
          className="ai-feature-card p-6 border border-neutral-800 rounded-sm"
        >
          <h3 className="text-sm uppercase tracking-widest text-accent mb-3">
            {group.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
