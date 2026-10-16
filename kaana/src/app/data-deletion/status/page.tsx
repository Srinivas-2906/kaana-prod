import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/site/Footer";
import KaanaLogo from "@/components/site/KaanaLogo";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Data Deletion Status",
    description: "Check the status of your Kaana data deletion request.",
    path: "/data-deletion/status",
  }),
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function DataDeletionStatusPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const code = (id || "").trim();

  return (
    <div className="min-h-screen bg-dark text-light">
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-6 py-6">
          <KaanaLogo variant="name" href="/" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl text-neutral-100 font-display font-medium mb-4">
            Data deletion status
          </h1>

          {!code ? (
            <p className="text-neutral-300">
              No confirmation code provided. If Meta sent you a confirmation
              code after removing the Kaana app, add it to the URL as{" "}
              <code className="text-neutral-200">?id=YOUR_CODE</code>.
            </p>
          ) : (
            <div className="border border-neutral-800 rounded-sm p-6 bg-dark/50 space-y-4">
              <p className="text-neutral-400 text-sm">Confirmation code</p>
              <p className="text-2xl font-mono text-neutral-100">{code}</p>
              <p className="text-neutral-300">
                Your deletion request has been received and is being processed.
                Associated Kaana account data linked to your Meta user ID will be
                deleted within 30 days unless we must retain specific records for
                legal compliance.
              </p>
              <p className="text-neutral-400 text-sm">
                Questions? Email{" "}
                <a
                  href={`mailto:kaana.srinivas@gmail.com?subject=Deletion%20status%20${encodeURIComponent(code)}`}
                  className="text-accent hover:underline"
                >
                  kaana.srinivas@gmail.com
                </a>{" "}
                with your confirmation code.
              </p>
            </div>
          )}

          <p className="mt-8 text-neutral-400 text-sm">
            <Link href="/data-deletion" className="text-accent hover:underline">
              ← Data deletion instructions
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
