'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  homeHref: string;
  pageHref: string;
  matchPath?: string;
  className?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", homeHref: "#home", pageHref: "/#home" },
  { label: "Services", homeHref: "/services", pageHref: "/services", matchPath: "/services" },
  { label: "Work", homeHref: "/work", pageHref: "/work", matchPath: "/work" },
  { label: "Insights", homeHref: "/insights", pageHref: "/insights", matchPath: "/insights" },
  { label: "AI Demo", homeHref: "#ai-demo", pageHref: "/#ai-demo" },
  { label: "Process", homeHref: "#process", pageHref: "/#process" },
  { label: "About", homeHref: "#about", pageHref: "/#about" },
  {
    label: "Careers",
    homeHref: "#",
    pageHref: "#",
    className: "careers-trigger",
  },
  { label: "Contact", homeHref: "#contact", pageHref: "/#contact" },
];

export default function MobileMenu() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const isPageLink = (item: NavItem) =>
    item.matchPath === "/work" ||
    item.matchPath === "/services" ||
    item.matchPath === "/insights";

  const isActive = (item: NavItem) => {
    if (item.matchPath === "/work") return pathname.startsWith("/work");
    if (item.matchPath === "/services") return pathname.startsWith("/services");
    if (item.matchPath === "/insights") return pathname.startsWith("/insights");
    return false;
  };

  return (
    <div
      className="fixed inset-0 bg-dark z-40 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-500"
      id="mobileMenu"
    >
      <nav className="flex flex-col items-center gap-8">
        {NAV_ITEMS.map((item) => {
          const href = onHome ? item.homeHref : item.pageHref;
          const active = isActive(item);
          const className = `text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger ${item.className ?? ""} ${active ? "text-accent" : ""}`;

          if (href === "#") {
            return (
              <a key={item.label} href="#" className={className}>
                {item.label}
              </a>
            );
          }

          if (isPageLink(item)) {
            return (
              <Link key={item.label} href={item.pageHref} className={className}>
                {item.label}
              </Link>
            );
          }

          return (
            <a key={item.label} href={href} className={className}>
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
