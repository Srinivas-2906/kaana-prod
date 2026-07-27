import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APEX_HOST = "kaana.in";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const url = request.nextUrl.clone();

  // Canonical host: apex only (fixes www duplicate in Search Console)
  if (host === `www.${APEX_HOST}`) {
    // Important: do not preserve any internal port (e.g. :8080) in redirects.
    const dest = new URL(`${url.pathname}${url.search}`, `https://${APEX_HOST}`);
    return NextResponse.redirect(dest, 301);
  }

  // Legacy WordPress blog paths → insights
  if (/^\/blog(\/|$)/i.test(url.pathname)) {
    const dest = new URL("/insights", `https://${APEX_HOST}`);
    return NextResponse.redirect(dest, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
