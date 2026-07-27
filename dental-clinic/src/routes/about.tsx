import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, GraduationCap, Award, BriefcaseMedical, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-dentist.jpg";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Dr. D. Ajit | Dentist in Muralinagar, Visakhapatnam" },
      {
        name: "description",
        content:
          "Dr. D. Ajit is a Dentist in Muralinagar, Visakhapatnam with 18 years of experience. He practices at Denta Care Dental Clinic and completed BDS (2002) and MDS - Oral Medicine & Radiology (2007).",
      },
      { property: "og:title", content: "About Dr. D. Ajit" },
      {
        property: "og:description",
        content: "Dr. D. Ajit — Dentist at Denta Care Dental Clinic, Muralinagar, Visakhapatnam.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="page-container grid items-center gap-8 pb-14 pt-10 sm:gap-10 sm:pb-16 sm:pt-12 lg:grid-cols-2 lg:gap-12 lg:pb-20 lg:pt-16">
          <Reveal immediate direction="right" className="max-w-xl">
            <span className="eyebrow text-primary">About the dentist</span>
            <h1 className="display-xl mt-3">
              Dr. D. Ajit — <em className="font-normal italic text-primary">dentist at Denta Care.</em>
            </h1>
            <p className="lead mt-5 sm:mt-6">
              Dr. D. Ajit is a Dentist in Muralinagar, Visakhapatnam and has an experience of 18
              years in this field. Dr. D. Ajit practices at Denta Care Dental Clinic in Muralinagar,
              Visakhapatnam.
            </p>
          </Reveal>
          <Reveal immediate delayMs={80} direction="left">
            <img
              src={heroImg}
              alt="Dr. D. Ajit"
              width={1536}
              height={1280}
              loading="lazy"
              className="mx-auto aspect-[5/6] w-full max-w-md rounded-[1.75rem] object-cover object-top shadow-[var(--shadow-elegant)] sm:max-w-lg lg:mx-0 lg:max-w-none lg:rounded-[2rem]"
            />
          </Reveal>
        </div>
      </section>

      <section className="page-container section-y">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
          <Reveal className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg lg:col-span-2">
            <p>
              He completed BDS from Maaruti College of Dental Sciences & Research Center, Bangalore
              in 2002 and MDS - Oral Medicine and Radiology from The Oxford dental College, Bangalore
              in 2007.
            </p>
            <p>
              He is a member of Indian Dental Association. Some of the services provided by the
              doctor are: Complete/Partial Dentures Fixing, Artificial Teeth, Cosmetic/ Aesthetic
              Dentistry and Conservative Dentistry etc.
            </p>
            <p>
              Most importantly, he takes time to explain what’s needed and why, so you can make a
              clear decision without pressure.
            </p>
          </Reveal>
          <div className="h-fit self-start lg:sticky lg:top-24">
            <Reveal delayMs={80} direction="left">
            <aside className="h-fit rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h3 className="font-display text-xl">At a glance</h3>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Specialisation", "Dentist · Oral Medicine"],
                ["Experience", "18 years"],
                ["Languages", "English · Telugu · Hindi"],
                ["Consult fee", "₹300"],
                ["Registration", "A3147 · AP State Dental Council"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-border pb-3 last:border-0"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="page-container section-y">
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: GraduationCap,
                t: "Education",
                items: [
                  "BDS — Maaruti College of Dental Sciences, Bangalore (2002)",
                  "MDS — Oral Medicine & Radiology, The Oxford Dental College, Bangalore (2007)",
                ],
              },
              {
                icon: BriefcaseMedical,
                t: "Experience",
                items: [
                  "2007 – Present · Dentist at Denta Care Dental Clinic, Muralinagar, Visakhapatnam",
                ],
              },
              {
                icon: Award,
                t: "Memberships & Reg.",
                items: [
                  "Indian Dental Association (Member)",
                  "Reg. A3147 — Andhra Pradesh State Dental Council, 2007",
                ],
              },
            ].map((b, i) => (
              <Reveal key={b.t} delayMs={i * 60} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl">{b.t}</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {b.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container section-y text-center">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="display-lg">Want to book an appointment?</h2>
          <p className="lead mx-auto mt-4 max-w-xl">
            You can walk in during clinic hours, or call ahead to book a time.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Contact the clinic <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Browse services
          </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
