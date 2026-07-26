'use client';

import Link from "next/link";
import { getFeaturedCaseStudies } from "@/lib/portfolio/case-studies";
import { getStudySlides } from "@/lib/portfolio/images";
import PortfolioImageCarousel from "@/components/portfolio/PortfolioImageCarousel";

const featured = getFeaturedCaseStudies().slice(0, 4);

export default function WorkSection() {
  return (
    <section id="work" className="py-20 md:py-32 bg-dark/80">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-16">
          <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">
            Our Work
          </span>
          <h2
            className="text-3xl text-neutral-100 md:text-5xl font-display font-medium mb-6 reveal-up"
            style={{ transitionDelay: "0.1s" }}
          >
            Featured projects
          </h2>
          <p
            className="text-neutral-400 max-w-2xl reveal-up"
            style={{ transitionDelay: "0.2s" }}
          >
            Explore our portfolio of innovative digital solutions that have
            transformed businesses across various industries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {featured.map((study, i) => {
            const preview = study.homePreview ?? {
              category: study.category,
              title: study.title,
              excerpt: study.summary,
              image: study.heroImage,
            };
            const slides = getStudySlides(study, "home");

            return (
              <div
                key={study.slug}
                className="reveal-up group/carousel"
                style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
              >
                <div className="image-hover mb-6">
                  <PortfolioImageCarousel slides={slides} aspect="card" className="w-full" />
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-neutral-400">
                    {preview.category}
                  </span>
                  {study.projectStatus === "ongoing" && (
                    <span className="text-[10px] uppercase tracking-widest border border-amber-600/40 text-amber-200/90 px-2 py-0.5 rounded-sm">
                      Ongoing
                    </span>
                  )}
                </div>
                <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">
                  {preview.title}
                </h3>
                <p className="text-neutral-400 mb-4">{preview.excerpt}</p>
                <Link
                  href={`/work/${study.slug}`}
                  className="text-sm text-accent flex items-center link-trigger"
                >
                  View case study
                  <i className="fas fa-arrow-right text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>

        <div
          className="mt-16 text-center reveal-up"
          style={{ transitionDelay: "0.7s" }}
        >
          <Link href="/work" className="btn btn-outline link-trigger inline-flex">
            View all projects
            <i className="fas fa-arrow-right text-xs ml-2 btn-icon" />
          </Link>
        </div>
      </div>
    </section>
  );
}
