'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import KaanaLogo from "./KaanaLogo";

type NavItem = {
  label: string;
  homeHref: string;
  pageHref: string;
  matchPath?: string;
  className?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", homeHref: "#home", pageHref: "/#home", matchPath: "/" },
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

function isActive(pathname: string, item: NavItem) {
  if (item.matchPath === "/work") {
    return pathname.startsWith("/work");
  }
  if (item.matchPath === "/services") {
    return pathname.startsWith("/services");
  }
  if (item.matchPath === "/insights") {
    return pathname.startsWith("/insights");
  }
  if (item.matchPath === "/" && pathname === "/") {
    return false; // scroll spy handles section highlights on home
  }
  return false;
}

export default function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <header
      className="fixed top-0 left-0 w-full py-6 z-50 transition-all duration-300"
      id="header"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <KaanaLogo variant="name" href="/" priority height={56} />

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const href = onHome ? item.homeHref : item.pageHref;
              const active = isActive(pathname, item);
              const isHashOnly = href === "#";

              if (isHashOnly) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`text-base hover-line nav-link link-trigger ${item.className ?? ""}`}
                  >
                    {item.label}
                  </button>
                );
              }

              if (item.matchPath === "/work" || item.matchPath === "/services" || item.matchPath === "/insights") {
                return (
                  <Link
                    key={item.label}
                    href={item.pageHref}
                    className={`text-base hover-line nav-link link-trigger ${active ? "text-accent" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.label}
                  href={href}
                  className={`text-base hover-line nav-link link-trigger ${item.className ?? ""}`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={onHome ? "#contact" : "/#contact"}
              className="hidden md:inline-flex btn btn-outline text-sm link-trigger"
            >
              Get in touch
            </a>

            <button
              className="menu-button md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5"
              id="menuButton"
            >
              <span className="w-6 h-px bg-light transition-all duration-300" />
              <span className="w-6 h-px bg-light transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
