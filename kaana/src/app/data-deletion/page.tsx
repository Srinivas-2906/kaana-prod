import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/site/Footer";
import KaanaLogo from "@/components/site/KaanaLogo";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Data Deletion",
    description:
      "How Bot IQ by Kaana users and end customers can request deletion of personal data (Meta App Kaana Platform).",
    path: "/data-deletion",
  }),
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-dark text-light">
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <KaanaLogo variant="name" href="/" />
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/privacy-policy"
              className="text-neutral-400 hover:text-accent transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-neutral-400 hover:text-accent transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">
            Legal
          </p>
          <h1 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-4">
            Data deletion
          </h1>
          <p className="text-neutral-400 mb-6">
            How to request removal of personal data for{" "}
            <strong className="text-neutral-200">Bot IQ by Kaana</strong> (operated
            by Kaana AI Technologies). Meta Developer app:{" "}
            <strong className="text-neutral-200">Kaana Platform</strong> (App ID{" "}
            27724398370520714).
          </p>
          <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-10 pl-4 border-l-2 border-accent/80">
            Bot IQ is the WhatsApp inbox, templates, and automation product at{" "}
            <a
              href="https://app.kaana.in"
              className="text-accent hover:underline"
              rel="noopener noreferrer"
            >
              app.kaana.in
            </a>
            . Privacy and terms for the product are at{" "}
            <a
              href="https://app.kaana.in/privacy"
              className="text-accent hover:underline"
              rel="noopener noreferrer"
            >
              app.kaana.in/privacy
            </a>{" "}
            and{" "}
            <a
              href="https://app.kaana.in/terms"
              className="text-accent hover:underline"
              rel="noopener noreferrer"
            >
              app.kaana.in/terms
            </a>
            .
          </p>

          <section className="space-y-4 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Bot IQ business customers (app.kaana.in accounts)
            </h2>
            <p className="text-neutral-300">
              If you use Bot IQ and want your business account, WhatsApp
              connection, inbox data, templates, and configuration deleted:
            </p>
            <ol className="list-decimal pl-5 text-neutral-300 space-y-2">
              <li>
                Email{" "}
                <a
                  href="mailto:hello@kaana.in?subject=Bot%20IQ%20data%20deletion%20request"
                  className="text-accent hover:underline"
                >
                  hello@kaana.in
                </a>{" "}
                from your registered Bot IQ account email with the subject line{" "}
                <strong className="text-neutral-200">Bot IQ data deletion request</strong>.
              </li>
              <li>
                Include your business name and the WhatsApp number connected to
                Bot IQ (if any).
              </li>
              <li>
                We will confirm receipt within 7 business days and delete or
                anonymize account data within 30 days, except where retention is
                required by law.
              </li>
            </ol>
          </section>

          <section className="space-y-4 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              End customers (messaged by a business using Bot IQ)
            </h2>
            <p className="text-neutral-300">
              If a business contacted you on WhatsApp using Bot IQ automation,
              that business is the data controller for your conversation. Contact
              the business directly first to request deletion of your messages and
              contact details.
            </p>
            <p className="text-neutral-300">
              If you cannot reach the business, email us at{" "}
              <a
                href="mailto:hello@kaana.in?subject=End%20customer%20Bot%20IQ%20data%20deletion"
                className="text-accent hover:underline"
              >
                hello@kaana.in
              </a>{" "}
              with the business name and your phone number. Kaana AI Technologies
              will coordinate deletion with the business where we process data on
              their behalf.
            </p>
          </section>

          <section className="space-y-4 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Meta / Facebook Login users
            </h2>
            <p className="text-neutral-300">
              If you connected WhatsApp to Bot IQ through Meta Embedded Signup and
              removed the Kaana Platform app from your Facebook account, Meta may send us an
              automated deletion request. We process those requests and provide a
              confirmation code and status URL in our response to Meta.
            </p>
            <p className="text-neutral-300">
              You can also remove Kaana Platform from your Facebook apps at{" "}
              <a
                href="https://www.facebook.com/settings?tab=applications"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook Settings → Apps and Websites
              </a>{" "}
              and choose <strong className="text-neutral-200">Send Request</strong>{" "}
              to trigger automated deletion.
            </p>
          </section>

          <section className="space-y-3 mb-12">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              What we delete
            </h2>
            <ul className="list-disc pl-5 text-neutral-300 space-y-2">
              <li>Account profile, login credentials, and business settings</li>
              <li>WhatsApp connection tokens and phone number IDs stored for Bot IQ</li>
              <li>Conversation history, leads, and automation configuration</li>
              <li>Billing and onboarding records tied to your account</li>
            </ul>
            <p className="text-neutral-400 text-sm">
              See also{" "}
              <a
                href="https://app.kaana.in/privacy"
                className="text-accent hover:underline"
                rel="noopener noreferrer"
              >
                Bot IQ Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://app.kaana.in/terms"
                className="text-accent hover:underline"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
