import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    // Avoid picking parent Demos/ lockfile as workspace root in dev
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "kaana.in" },
    ],
  },
  async redirects() {
    return [
      { source: "/Blog", destination: "/insights", permanent: true },
      { source: "/Blog/:path*", destination: "/insights", permanent: true },
    ];
  },
  async headers() {
    // Security headers: strong defaults without breaking Next.js rendering.
    const securityHeaders = [
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
      },
      {
        key: "Content-Security-Policy",
        // Note: Next.js uses inline scripts/styles; keep CSP permissive but safe.
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "img-src 'self' data: https:",
          "media-src 'self' https:",
          "font-src 'self' data: https:",
          "style-src 'self' 'unsafe-inline' https:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
          "connect-src 'self' https:",
          "form-action 'self' https:",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
