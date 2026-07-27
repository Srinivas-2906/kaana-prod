"use client";

import Link from "next/link";
import type { CaseStudy } from "@/lib/portfolio/types";
import { getStudySlides } from "@/lib/portfolio/images";
import PortfolioImageCarousel from "@/components/portfolio/PortfolioImageCarousel";
import Icon from "@/components/ui/Icon";

type Props = {
  study: CaseStudy;
  featured?: boolean;
};

export default function CaseStudyCard({ study, featured }: Props) {
  const slides = getStudySlides(study, "card");

  return (
    <article
      className={`reveal-up group ${featured ? "md:col-span-2" : ""}`}
    >
      <Link href={`/work/${study.slug}`} className="block link-trigger">
        <div className="image-hover group/carousel mb-6 relative">
          <PortfolioImageCarousel
            slides={slides}
            aspect={featured ? "wide" : "card"}
            stopPropagation
            className="w-full"
          />
          <div className="pointer-events-none absolute top-3 left-3 z-30 flex flex-wrap gap-2">
            {study.projectStatus === "ongoing" && (
              <span className="text-[10px] uppercase tracking-widest bg-dark/80 border border-amber-600/50 text-amber-200 px-2 py-1 rounded-sm">
                Ongoing
              </span>
            )}
            {study.confidential && (
              <span className="text-[10px] uppercase tracking-widest bg-dark/80 border border-neutral-700 text-neutral-300 px-2 py-1 rounded-sm">
                Confidential client
              </span>
            )}
          </div>
        </div>
        <span className="text-xs uppercase tracking-widest text-neutral-400 mb-2 block">
          {study.category}
        </span>
        <h3 className="text-xl text-neutral-100 font-display font-medium mb-2 group-hover:text-accent transition-colors">
          {study.title}
        </h3>
        <p className="text-neutral-400 mb-4 line-clamp-2">{study.summary}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {study.solutionTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded-sm"
            >
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <span className="text-sm text-accent flex items-center group">
          View case study
          <Icon name="arrow-right" className="text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </article>
  );
}
