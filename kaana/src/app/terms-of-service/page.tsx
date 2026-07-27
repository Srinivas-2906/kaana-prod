import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/site/Footer";
import KaanaLogo from "@/components/site/KaanaLogo";

export const metadata: Metadata = {
  title: "Terms of Service | Kaana",
  description:
    "Terms of Service for Kaana services, including WhatsApp automation and chatbot solutions.",
};

export default function TermsOfServicePage() {
  const effectiveDate = "July 27, 2026";

  return (
    <div className="min-h-screen bg-dark text-light">
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <KaanaLogo variant="name" href="/" />
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/terms-of-service"
              className="text-neutral-200 hover:text-accent transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy-policy"
              className="text-neutral-400 hover:text-accent transition-colors"
            >
              Privacy
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
            Terms of Service
          </h1>
          <p className="text-neutral-400 mb-10">Effective date: {effectiveDate}</p>

          <section className="space-y-4 mb-10">
            <p className="text-neutral-300">
              These Terms of Service (“Terms”) govern your access to and use of
              Kaana’s website, products, and services (the “Services”). By using
              the Services, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Who the Services are for
            </h2>
            <p className="text-neutral-300">
              Our Services are primarily offered to businesses (for example,
              clinics) to help manage customer interactions, automations, and
              digital experiences. If you are an end-customer messaging a business
              that uses Kaana, your relationship for that conversation is with the
              business you are contacting.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Acceptable use
            </h2>
            <ul className="list-disc pl-5 text-neutral-300 space-y-2">
              <li>Do not use the Services for unlawful, harmful, or abusive activity.</li>
              <li>
                Do not attempt to access accounts, data, or systems you are not
                authorized to access.
              </li>
              <li>
                Do not transmit malware, spam, or content that violates the rights
                of others.
              </li>
              <li>
                If you use WhatsApp or other messaging channels, you must comply
                with the platform’s terms and policies.
              </li>
            </ul>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              WhatsApp automation requirements
            </h2>
            <p className="text-neutral-300">
              If you use the Services to message people on WhatsApp, you are
              responsible for obtaining any required user permissions/opt-in before
              messaging, and for providing any notices required by law. You must
              also honor opt-out requests (for example, when a user replies “STOP”)
              and comply with WhatsApp Business policies.
            </p>
            <p className="text-neutral-300">
              You must not use the Services to request or share sensitive
              identifiers (such as full payment card numbers, government ID
              numbers, passwords), and you should avoid requesting or sending
              highly sensitive health information via WhatsApp unless your use case
              and compliance requirements allow it.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              No emergency use; informational only
            </h2>
            <p className="text-neutral-300">
              The Services are not designed for emergency communications. If you
              think you may have a medical emergency, contact local emergency
              services immediately. Any responses or automations are provided for
              general informational and operational purposes and are not medical
              advice.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Privacy
            </h2>
            <p className="text-neutral-300">
              Our Privacy Policy explains how we handle information. By using the
              Services, you acknowledge our Privacy Policy.
            </p>
            <p className="text-neutral-300">
              <Link
                href="/privacy-policy"
                className="text-accent hover:underline underline-offset-4"
              >
                Read the Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Third-party services
            </h2>
            <p className="text-neutral-300">
              The Services may integrate with third-party products and platforms
              (such as WhatsApp/Meta). Those third parties’ terms and policies may
              apply to your use of their services. Kaana is not responsible for
              third-party services.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Disclaimers and limitation of liability
            </h2>
            <p className="text-neutral-300">
              The Services are provided on an “as is” and “as available” basis, to
              the fullest extent permitted by law. We do not guarantee that the
              Services will be uninterrupted or error-free.
            </p>
            <p className="text-neutral-300">
              To the fullest extent permitted by law, Kaana will not be liable for
              indirect, incidental, special, consequential, or punitive damages, or
              for any loss of profits, revenues, data, or goodwill arising out of
              or related to your use of the Services.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Changes to these Terms
            </h2>
            <p className="text-neutral-300">
              We may update these Terms from time to time. The updated version will
              be posted on this page with a revised effective date.
            </p>
          </section>

          <section className="space-y-3 mb-12">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Contact
            </h2>
            <p className="text-neutral-300">
              Questions about these Terms can be sent to:
            </p>
            <div className="border border-neutral-800 rounded-sm p-4 bg-dark/50 text-neutral-300 space-y-1">
              <div>
                <span className="text-neutral-200 font-medium">Email:</span>{" "}
                kaana.srinivas@gmail.com
              </div>
              <div>
                <span className="text-neutral-200 font-medium">Phone:</span> +91
                9008747926
              </div>
              <div>
                <span className="text-neutral-200 font-medium">Address:</span>{" "}
                Balaji plaza, 39-8-77/7, near Haritha Park, Muralinagar,
                Madhavadhara, Visakhapatnam, Andhra Pradesh 530007
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

