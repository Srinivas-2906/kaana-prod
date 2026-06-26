import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, GraduationCap, Award, BriefcaseMedical, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-dentist.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Dr. D. Ajit | Dentist in Murali Nagar, Visakhapatnam" },
      {
        name: "description",
        content:
          "Meet Dr. D. Ajit (BDS, MDS), dentist at Denta Care Dental Clinic in Murali Nagar, Visakhapatnam. 18+ years of experience and a focus on clear, honest advice.",
      },
      { property: "og:title", content: "About Dr. D. Ajit" },
      {
        property: "og:description",
        content: "Dr. D. Ajit (BDS, MDS) — dentist at Denta Care Dental Clinic, Murali Nagar, Visakhapatnam.",
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
          <div className="max-w-xl">
            <span className="eyebrow text-primary">About the dentist</span>
            <h1 className="display-xl mt-3">
              Dr. D. Ajit — <em className="font-normal italic text-primary">dentist at Denta Care.</em>
            </h1>
            <p className="lead mt-5 sm:mt-6">
              Dr. Ajit has been treating patients in Murali Nagar, Visakhapatnam for 18+ years. He
              focuses on honest guidance, comfortable care, and treatments that last.
            </p>
          </div>
          <img
            src={heroImg}
            alt="Dr. D. Ajit"
            width={1536}
            height={1280}
            loading="lazy"
            className="mx-auto aspect-[5/6] w-full max-w-md rounded-[1.75rem] object-cover object-top shadow-[var(--shadow-elegant)] sm:max-w-lg lg:mx-0 lg:max-w-none lg:rounded-[2rem]"
          />
        </div>
      </section>

      <section className="page-container section-y">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg lg:col-span-2">
            <p>
              Dr. Ajit completed his Bachelor of Dental Surgery (BDS) at Maaruti College of Dental
              Sciences & Research Center, Bangalore (2002), and his MDS in Oral Medicine & Radiology
              from The Oxford Dental College, Bangalore (2007).
            </p>
            <p>
              Since then, he has practiced at Denta Care Dental Clinic and treated thousands of
              patients across routine, restorative and cosmetic dental care. As a member of the
              Indian Dental Association, he stays up to date with current techniques and hygiene
              standards.
            </p>
            <p>
              Most importantly, he takes time to explain what’s needed and why, so you can make a
              clear decision without pressure.
            </p>
          </div>
          <aside className="h-fit rounded-2xl border border-border bg-card p-6 sm:p-8 lg:sticky lg:top-24">
            <h3 className="font-display text-xl">At a glance</h3>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Specialisation", "Dentist · Oral Medicine"],
                ["Experience", "18+ years"],
                ["Languages", "English · Telugu · Hindi"],
                ["Consult fee", "₹100"],
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
                  "2007 – Present · Dentist at Denta Care Dental Clinic, Murali Nagar, Visakhapatnam",
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
            ].map((b) => (
              <div key={b.t} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 sm:p-8">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container section-y text-center">
        <h2 className="display-lg mx-auto max-w-2xl">Want to book an appointment?</h2>
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
      </section>
    </>
  );
}
