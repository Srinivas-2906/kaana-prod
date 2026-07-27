import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, SITE_URL, websiteJsonLd } from "@/lib/seo/site";
import "./globals.css";
import "./kaana.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kaana",
    template: "%s | Kaana",
  },
  description:
    "Kaana designs and ships WhatsApp business automation, multi-tenant SaaS on GCP, healthcare clinic software, and offline-first field apps.",
  applicationName: "Kaana",
  robots: { index: true, follow: true },
  icons: {
    icon: [
      {
        url: "/icon-light.png",
        media: "(prefers-color-scheme: light)",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-light-48.png",
        media: "(prefers-color-scheme: light)",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-dark-48.png",
        media: "(prefers-color-scheme: dark)",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="bg-dark text-light min-h-screen overflow-x-hidden font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
