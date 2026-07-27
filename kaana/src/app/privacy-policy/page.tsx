import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/site/Footer";
import KaanaLogo from "@/components/site/KaanaLogo";

export const metadata: Metadata = {
  title: "Privacy Policy | Kaana",
  description:
    "Privacy Policy for Kaana website, products, and services.",
};

export default function PrivacyPolicyPage() {
  const effectiveDate = "July 27, 2026";

  return (
    <div className="min-h-screen bg-dark text-light">
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <KaanaLogo variant="name" href="/" />
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/terms-of-service"
              className="text-neutral-400 hover:text-accent transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy-policy"
              className="text-neutral-200 hover:text-accent transition-colors"
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
            Privacy Policy
          </h1>
          <p className="text-neutral-400 mb-10">Effective date: {effectiveDate}</p>

          <section className="space-y-4 mb-10">
            <p className="text-neutral-300">
              This Privacy Policy explains how Kaana (“we”, “us”, “our”) collects,
              uses, and shares information when you visit our website or use our
              products and services (the “Services”), including websites, apps,
              chat/AI experiences, automation workflows, and integrations.
            </p>
            <p className="text-neutral-300">
              If you are an end-customer messaging a business that uses Kaana to
              communicate with you, that business is responsible for its customer
              communications, notices, and consents. Kaana may process information
              on that business’s behalf to deliver the Services.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Information we collect
            </h2>
            <ul className="list-disc pl-5 text-neutral-300 space-y-2">
              <li>
                <span className="font-medium text-neutral-200">Contact data</span>{" "}
                such as name, email, phone number (when provided).
              </li>
              <li>
                <span className="font-medium text-neutral-200">
                  Messages and interaction data
                </span>{" "}
                such as message content you send through supported channels (e.g.,
                messaging apps, web chat), timestamps, delivery/read status, and
                conversation IDs.
              </li>
              <li>
                <span className="font-medium text-neutral-200">Usage data</span>{" "}
                such as pages viewed, device/browser information, and approximate
                location derived from IP address.
              </li>
              <li>
                <span className="font-medium text-neutral-200">
                  Business account data
                </span>{" "}
                such as business name, business contact details, and configuration
                settings for integrations.
              </li>
            </ul>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              How we use information
            </h2>
            <ul className="list-disc pl-5 text-neutral-300 space-y-2">
              <li>Provide, operate, and improve the Services.</li>
              <li>
                Facilitate conversations and workflows for businesses using our
                automations and integrations.
              </li>
              <li>Send service-related notices and respond to requests.</li>
              <li>
                Maintain security, prevent abuse, and comply with legal
                obligations.
              </li>
            </ul>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Messaging channels and opt-in (including WhatsApp)
            </h2>
            <p className="text-neutral-300">
              Some Services support messaging channels such as WhatsApp. Businesses
              using Kaana are responsible for obtaining any required user
              permissions/opt-in before messaging, and for honoring opt-out
              requests. If you no longer wish to receive messages from a business,
              you can typically reply with “STOP” (or follow the business’s
              instructions) and/or block the business in the relevant app.
            </p>
            <p className="text-neutral-300">
              Please do not share sensitive information (for example, government
              IDs, full payment card numbers, passwords, or highly sensitive health
              information) via messaging channels unless you are
              comfortable doing so and the recipient has requested it through an
              appropriate process.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Cookies and analytics
            </h2>
            <p className="text-neutral-300">
              We may use cookies and similar technologies to provide core site
              functionality, remember preferences, understand usage, and improve
              performance. You can control cookies through your browser settings.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              How we share information
            </h2>
            <ul className="list-disc pl-5 text-neutral-300 space-y-2">
              <li>
                <span className="font-medium text-neutral-200">
                  With service providers
                </span>{" "}
                (hosting, analytics, support) who help us run the Services.
              </li>
              <li>
                <span className="font-medium text-neutral-200">
                  With messaging platforms
                </span>{" "}
                (such as WhatsApp/Meta) when you or our customers choose to use
                those channels.
              </li>
              <li>
                <span className="font-medium text-neutral-200">
                  For legal and safety reasons
                </span>{" "}
                if required by law or to protect rights, safety, and security.
              </li>
              <li>
                <span className="font-medium text-neutral-200">
                  With your organization
                </span>{" "}
                if you use Services through a business account (for example, if
                your team provides you access).
              </li>
            </ul>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Data retention
            </h2>
            <p className="text-neutral-300">
              We retain information for as long as needed to provide the Services,
              comply with legal obligations, resolve disputes, and enforce
              agreements. Retention periods may vary based on the type of data and
              the customer configuration.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Security
            </h2>
            <p className="text-neutral-300">
              We implement reasonable administrative, technical, and
              organizational safeguards designed to protect information. No method
              of transmission or storage is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Your choices and rights
            </h2>
            <p className="text-neutral-300">
              Depending on where you live, you may have rights to access, correct,
              delete, or object to certain processing of your information. If you
              are an end-customer communicating with one of our business customers,
              please contact that business first; we may need to coordinate with
              them to fulfill requests.
            </p>
          </section>

          <section className="space-y-3 mb-12">
            <h2 className="text-xl md:text-2xl text-neutral-100 font-display font-medium">
              Contact us
            </h2>
            <p className="text-neutral-300">
              If you have questions about this Privacy Policy, contact us at:
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

