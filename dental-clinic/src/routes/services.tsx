import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { services } from "@/lib/services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Dental Services | Denta Care Clinic, Murali Nagar, Visakhapatnam" },
      {
        name: "description",
        content:
          "Dental services at Denta Care Dental Clinic in Murali Nagar, Visakhapatnam. Cleaning, fillings, root canal treatment (RCT), dentures, crowns and cosmetic dentistry.",
      },
      { property: "og:title", content: "Dental Services · Denta Care" },
      {
        property: "og:description",
        content:
          "Dental services in Murali Nagar, Visakhapatnam — cleaning, fillings, RCT, dentures and cosmetic dentistry.",
      },
    ],
  }),
  component: Services,
});

const highlights = [
  "Sterilised instruments and clean clinic",
  "Clear pricing explained before treatment",
  "Comfort-focused care",
  "Family-friendly clinic",
];

function Services() {
  return (
    <>
      <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="page-container pb-14 pt-10 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-16">
          <span className="eyebrow text-primary">Services</span>
          <h1 className="display-xl mt-3 max-w-3xl">
            Dental services for everyday needs — <em className="font-normal italic text-primary">done carefully.</em>
          </h1>
          <p className="lead mt-5 max-w-2xl sm:mt-6">
            We offer cleaning, fillings, root canal treatment (RCT), dentures, crowns and cosmetic
            dentistry. We’ll explain what you need and share options that fit your budget.
          </p>
        </div>
      </section>

      <section className="page-container section-y">
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.title}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-soft)] sm:p-8"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-xl text-foreground sm:mt-6 sm:text-2xl">
                {s.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline sm:mt-6"
              >
                Ask about this <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="page-container section-y">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="eyebrow text-primary">Why Denta Care</span>
              <h2 className="display-lg mt-3">What you can expect.</h2>
              <p className="lead mt-4">
                Simple things that matter for a good dental visit.
              </p>
              <ul className="mt-6 space-y-3 text-sm sm:mt-8">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-border bg-card p-8 sm:rounded-[2rem] sm:p-10">
              <div className="font-display text-4xl text-primary sm:text-5xl">₹100</div>
              <div className="mt-1 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Consultation
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:mt-6">
                Meet Dr. Ajit for a check-up and a clear plan. We’ll explain the findings and the
                next steps.
              </p>
              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] sm:mt-8"
              >
                Book a consultation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
