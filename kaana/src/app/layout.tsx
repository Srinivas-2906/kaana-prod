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
    default: "Kāna Digital Solutions",
    template: "%s | Kāna",
  },
  description:
    "Kāna designs and ships WhatsApp business automation, multi-tenant SaaS on GCP, healthcare clinic software, and offline-first field apps.",
  applicationName: "Kāna",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="bg-dark text-light min-h-screen overflow-x-hidden font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
