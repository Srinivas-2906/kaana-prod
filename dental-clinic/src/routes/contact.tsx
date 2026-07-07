import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, Mail, HelpCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Denta Care | Muralinagar, Visakhapatnam" },
      {
        name: "description",
        content:
          "Contact Denta Care Dental Clinic in Muralinagar, Visakhapatnam. Address, clinic hours, phone number and appointment request form.",
      },
      { property: "og:title", content: "Contact Denta Care" },
      {
        property: "og:description",
        content:
          "Address, hours and phone number for Denta Care Dental Clinic in Muralinagar, Visakhapatnam.",
      },
    ],
  }),
  component: Contact,
});

const faqs = [
  {
    q: "Where does Dr. D. Ajit practice?",
    a: "At Denta Care Dental Clinic, #39-11-70, 1st Floor, Shankar Plaza, Muralinagar, Visakhapatnam (Landmark: Shankar Plaza).",
  },
  {
    q: "What are the consultation hours?",
    a: "Monday to Saturday, 10:00 AM – 1:00 PM and 5:00 PM – 9:00 PM. The clinic is closed on Sundays.",
  },
  {
    q: "What is the consultation fee?",
    a: "₹300 for a standard consultation. Treatment costs are explained and confirmed before any procedure begins.",
  },
  {
    q: "What is the WhatsApp number?",
    a: "WhatsApp / Call: 6301433852.",
  },
  {
    q: "What qualifications does Dr. Ajit hold?",
    a: "BDS (Maaruti College of Dental Sciences, Bangalore, 2002) and MDS in Oral Medicine & Radiology (The Oxford Dental College, Bangalore, 2007).",
  },
  {
    q: "Which treatments are offered?",
    a: "Cosmetic & aesthetic dentistry, complete/partial dentures, artificial teeth, conservative dentistry, orthodontic aligners, root canal treatment, cleanings, and family dental care.",
  },
];

function Contact() {
  return (
    <>
      <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="page-container pb-12 pt-10 sm:pb-14 sm:pt-12 lg:pb-16 lg:pt-16">
          <Reveal immediate>
            <span className="eyebrow text-primary">Contact</span>
            <h1 className="display-xl mt-3 max-w-3xl">
              Visit, call, or message — <em className="font-normal italic text-primary">we’ll help you.</em>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="page-container section-y-sm">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4 sm:space-y-5">
            {[
              {
                icon: MapPin,
                t: "Address",
                lines: [
                  "Denta Care Dental Clinic",
                  "#39-11-70, 1st Floor, Shankar Plaza,",
                  "Muralinagar, Visakhapatnam",
                  "Landmark: Shankar Plaza",
                ],
              },
              {
                icon: Clock,
                t: "Hours",
                lines: ["Monday – Saturday", "10:00 AM – 1:00 PM", "5:00 PM – 9:00 PM"],
              },
              {
                icon: Phone,
                t: "Call",
                lines: ["WhatsApp / Call: 6301433852", "Consultation fee: ₹300"],
              },
              { icon: Mail, t: "Email", lines: ["ajitdentacare@gmail.com"] },
            ].map((b, i) => (
              <Reveal key={b.t} delayMs={i * 60}>
                <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 sm:gap-5 sm:p-6">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground sm:h-12 sm:w-12">
                    <b.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg">{b.t}</h3>
                    <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                      {b.lines.map((l) => (
                        <div key={l}>{l}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="h-fit self-start lg:sticky lg:top-24">
          <Reveal delayMs={80} direction="left">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fd = new FormData(form);
              const name = String(fd.get("name") ?? "").trim();
              const phone = String(fd.get("phone") ?? "").trim();
              const msg = String(fd.get("msg") ?? "").trim();

              const text = [
                "Appointment request",
                name ? `Name: ${name}` : null,
                phone ? `Phone: ${phone}` : null,
                msg ? `Reason: ${msg}` : null,
              ]
                .filter(Boolean)
                .join("\n");

              const waUrl = `https://wa.me/916301433852?text=${encodeURIComponent(text)}`;
              window.open(waUrl, "_blank", "noopener,noreferrer");
            }}
            className="h-fit rounded-[1.75rem] border border-border bg-card p-6 sm:rounded-[2rem] sm:p-8 lg:p-10"
          >
            <h2 className="font-display text-2xl text-foreground">Request an appointment</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Share a few details. We’ll open WhatsApp so you can message the clinic.
            </p>
            <div className="mt-5 grid gap-4 sm:mt-6">
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-foreground">Full name</span>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-foreground">Phone</span>
                <input
                  required
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-foreground">Reason for visit</span>
                <textarea
                  name="msg"
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
              >
                Message on WhatsApp
              </button>
            </div>
          </form>
          </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="page-container section-y-sm">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <HelpCircle className="h-4 w-4" /> FAQ
            </span>
            <h2 className="display-lg mt-3">FAQ</h2>
          </Reveal>
          <div className="mx-auto mt-8 max-w-4xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:mt-12">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delayMs={i * 40}>
                <details className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-foreground sm:text-base">
                  {f.q}
                  <span className="text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
