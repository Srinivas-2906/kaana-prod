import { type ElementType, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RevealProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
  delayMs?: number;
};

export function Reveal<T extends ElementType = "div">({
  as,
  className,
  children,
  delayMs,
}: RevealProps<T>) {
  const Comp = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "120px 0px 0px 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [prefersReducedMotion]);

  return (
    <Comp
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={(node: any) => {
        ref.current = node;
      }}
      className={cn(
        "transform-gpu will-change-transform will-change-opacity transition-[opacity,transform] duration-350 ease-out motion-reduce:transition-none motion-reduce:transform-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className,
      )}
      style={delayMs ? ({ transitionDelay: `${delayMs}ms` } as const) : undefined}
    >
      {children}
    </Comp>
  );
}

