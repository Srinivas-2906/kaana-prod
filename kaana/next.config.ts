import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
};

export default nextConfig;
