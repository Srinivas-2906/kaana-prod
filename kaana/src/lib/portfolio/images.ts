import type { CaseStudy } from "./types";

export type CarouselSlide = { src: string; label: string };

/** Build de-duplicated carousel slides for portfolio surfaces */
export function getStudySlides(
  study: CaseStudy,
  mode: "detail" | "home" | "card" = "detail",
): CarouselSlide[] {
  if (mode === "home" && study.homePreview) {
    const sources = study.homePreview.images?.length
      ? study.homePreview.images
      : [study.homePreview.image];
    const labelBySrc = new Map(
      (study.galleryImages ?? []).map((g) => [g.src, g.label]),
    );
    return sources.map((src, i) => ({
      src,
      label:
        labelBySrc.get(src) ??
        study.galleryImages?.[i]?.label ??
        study.homePreview!.title,
    }));
  }

  const slides: CarouselSlide[] = [
    { src: study.heroImage, label: study.title },
  ];
  for (const item of study.galleryImages ?? []) {
    if (item.src !== study.heroImage) {
      slides.push(item);
    }
  }
  return slides;
}
