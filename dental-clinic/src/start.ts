import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const seoMiddleware = createMiddleware().server(async ({ request, pathname, next }) => {
  const url = new URL(request.url);
  const origin = url.origin;

  if (pathname === "/robots.txt") {
    const body = [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${origin}/sitemap.xml`,
      "",
    ].join("\n");
    return new Response(body, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (pathname === "/sitemap.xml") {
    const pages = ["/", "/about", "/services", "/contact"];
    const now = new Date().toISOString();
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      pages
        .map(
          (p) =>
            `  <url>\n` +
            `    <loc>${origin}${p}</loc>\n` +
            `    <lastmod>${now}</lastmod>\n` +
            `  </url>\n`,
        )
        .join("") +
      `</urlset>\n`;

    return new Response(xml, {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [seoMiddleware, errorMiddleware],
}));
