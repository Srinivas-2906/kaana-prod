"use client";

import { useEffect } from "react";
import { initSiteEffects } from "@/lib/initSiteEffects";

export function useSiteEffects() {
  useEffect(() => {
    const cleanup = initSiteEffects();
    return cleanup;
  }, []);
}
