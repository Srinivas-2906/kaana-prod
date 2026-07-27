import { type ElementType, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type MotionDirection = "up" | "down" | "left" | "right";
type RevealDirection = "auto" | MotionDirection;

type RevealProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
  delayMs?: number;
  direction?: RevealDirection;
  once?: boolean;
  /** Skip animation — content is visible on first paint (use for above-the-fold hero). */
  immediate?: boolean;
};

const hiddenByDirection: Record<MotionDirection, string> = {
  up: "translate-y-10 opacity-0",
  down: "-translate-y-10 opacity-0",
  left: "translate-x-10 opacity-0",
  right: "-translate-x-10 opacity-0",
};

export function Reveal<T extends ElementType = "div">({
  as,
  className,
  children,
  delayMs,
  direction = "auto",
  once = false,
  immediate = false,
}: RevealProps<T>) {
  const Comp = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(immediate);
  const [enterDirection, setEnterDirection] = useState<MotionDirection>("up");

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (immediate || prefersReducedMotion) {
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (direction === "auto") {
              const fromBelow = entry.boundingClientRect.top > 0;
              setEnterDirection(fromBelow ? "up" : "down");
            }
            setShown(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [prefersReducedMotion, direction, once, immediate]);

  const activeDirection: MotionDirection = direction === "auto" ? enterDirection : direction;

  return (
    <Comp
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={(node: any) => {
        ref.current = node;
      }}
      className={cn(
        !immediate &&
          "transform-gpu will-change-[transform,opacity] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:transform-none",
        !immediate && (shown ? "translate-x-0 translate-y-0 opacity-100" : hiddenByDirection[activeDirection]),
        className,
      )}
      style={delayMs ? ({ transitionDelay: `${delayMs}ms` } as const) : undefined}
    >
      {children}
    </Comp>
  );
}
