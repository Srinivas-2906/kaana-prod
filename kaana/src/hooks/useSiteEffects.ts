"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initSiteEffects, resetNavigationUi } from "@/lib/initSiteEffects";

export function useSiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanup = initSiteEffects();
    return cleanup;
  }, []);

  useEffect(() => {
    resetNavigationUi();
  }, [pathname]);
}
