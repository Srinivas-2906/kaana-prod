"use client";

import { useCallback, useEffect, useState } from "react";
import type { CarouselSlide } from "@/lib/portfolio/images";

type AspectVariant = "card" | "hero" | "wide";

type Props = {
  slides: CarouselSlide[];
  aspect?: AspectVariant;
  className?: string;
  autoplayMs?: number;
  /** Stop click from bubbling (e.g. when nested in a link) */
  stopPropagation?: boolean;
};

const aspectClasses: Record<AspectVariant, string> = {
  card: "aspect-[4/3] sm:aspect-[16/10]",
  hero: "aspect-[4/3] sm:aspect-[16/10] lg:aspect-[21/9]",
  wide: "aspect-[16/10] lg:aspect-[21/9]",
};

export default function PortfolioImageCarousel({
  slides,
  aspect = "card",
  className = "",
  autoplayMs = 5000,
  stopPropagation = false,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = slides.length;
  const hasMultiple = count > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!hasMultiple || paused || reduceMotion) return;
    const id = window.setInterval(() => go(1), autoplayMs);
    return () => window.clearInterval(id);
  }, [hasMultiple, paused, reduceMotion, go, autoplayMs]);

  const handleControlClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    action();
  };

  if (count === 0) return null;

  return (
    <div
      className={`portfolio-carousel group relative overflow-hidden rounded-sm border border-neutral-800/60 bg-neutral-950 ${aspectClasses[aspect]} ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {slides.map((slide, i) => (
        <figure
          key={`${slide.src}-${i}`}
          className={`absolute inset-0 m-0 transition-opacity duration-700 ease-in-out ${
            i === index ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <img
            src={slide.src}
            alt={slide.label}
            className="h-full w-full bg-neutral-950 object-contain object-top"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          {slide.label && hasMultiple && (
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent px-4 pb-10 pt-8 text-[10px] uppercase tracking-widest text-neutral-400 sm:text-xs">
              {slide.label}
            </figcaption>
          )}
        </figure>
      ))}

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous screenshot"
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm border border-neutral-700/80 bg-neutral-950/80 text-neutral-300 opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent focus:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={(e) => handleControlClick(e, () => go(-1))}
          >
            <i className="fas fa-chevron-left text-xs" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next screenshot"
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm border border-neutral-700/80 bg-neutral-950/80 text-neutral-300 opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent focus:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={(e) => handleControlClick(e, () => go(1))}
          >
            <i className="fas fa-chevron-right text-xs" aria-hidden />
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
            role="tablist"
            aria-label="Screenshot slides"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${slide.label}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-accent"
                    : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
                }`}
                onClick={(e) => handleControlClick(e, () => setIndex(i))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
