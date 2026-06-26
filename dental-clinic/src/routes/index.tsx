import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Phone,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CalendarCheck,
  HeartHandshake,
  Award,
} from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-dentist.jpg";
import smileImg from "@/assets/smile.jpg";
import clinicImg from "@/assets/clinic-interior.jpg";
import treatmentImg from "@/assets/treatment-room.jpg";
import toolsImg from "@/assets/tools.jpg";
import patientImg from "@/assets/patient-smile.jpg";
import { Reveal } from "@/components/site/Reveal";
import { services } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Denta Care Dental Clinic | Dentist in Murali Nagar, Visakhapatnam" },
      {
        name: "description",
        content:
          "Denta Care Dental Clinic in Murali Nagar, Visakhapatnam. Dr. D. Ajit (BDS, MDS). Dental cleaning, fillings, RCT, dentures and cosmetic dentistry. Call to book. ₹100 consultation.",
      },
      { property: "og:title", content: "Denta Care · Dr. D. Ajit, Visakhapatnam" },
      {
        property: "og:description",
        content:
          "Dentist in Murali Nagar, Visakhapatnam. Dr. D. Ajit (BDS, MDS). Cleanings, fillings, RCT, dentures and cosmetic dentistry.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const gallery = [
    { src: clinicImg, alt: "Clinic interior at Denta Care Dental Clinic", label: "Clinic interior" },
    { src: treatmentImg, alt: "Treatment room at Denta Care Dental Clinic", label: "Treatment room" },
    { src: toolsImg, alt: "Sterilised dental tools at Denta Care", label: "Sterilised tools" },
    { src: patientImg, alt: "Happy patient at Denta Care Dental Clinic", label: "Patient smile" },
    { src: smileImg, alt: "Healthy smile after dental treatment", label: "Healthy smile" },
    { src: heroImg, alt: "Dentist at Denta Care Dental Clinic", label: "Dentist" },
  ] as const;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex == null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="page-container pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-14">
          <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14">
            <div className="max-w-xl lg:max-w-2xl">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-medium text-[var(--color-teal)] backdrop-blur sm:text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal)]" />
                <span className="truncate">Now accepting new patients · ₹100 consultation</span>
              </span>
              <h1 className="display-xl mt-5 sm:mt-6">
                Dental care made simple.
              </h1>
              <p className="lead mt-4 max-w-lg sm:mt-5">
                Visit Denta Care Dental Clinic for dental cleaning, fillings, root canal treatment
                (RCT), dentures and cosmetic dentistry. We’re based in Murali Nagar, Visakhapatnam.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                <a
                  href="tel:+910000000000"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:scale-[1.02] sm:px-6 sm:py-3.5"
                >
                  <Phone className="h-4 w-4" /> Book a visit
                </a>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:px-6 sm:py-3.5"
                >
                  Explore services <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
              <div className="absolute -inset-3 -z-10 rounded-[1.75rem] bg-[var(--gradient-aqua)] opacity-30 blur-2xl sm:-inset-4 sm:rounded-[2rem]" />
              <img
                src={heroImg}
                alt="Dr. D. Ajit at Denta Care Dental Clinic"
                width={1024}
                height={1280}
                className="aspect-[4/5] max-h-[min(72vh,520px)] w-full rounded-[1.75rem] object-cover object-top shadow-[var(--shadow-elegant)] sm:rounded-[2rem] lg:max-h-[540px]"
              />
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border bg-card/95 p-3 shadow-[var(--shadow-soft)] backdrop-blur sm:inset-x-4 sm:bottom-4 sm:p-4">
                <div className="grid grid-cols-3 divide-x divide-border text-center">
                  {[
                    { k: "18+", v: "Years" },
                    { k: "10k+", v: "Patients" },
                    { k: "4.9★", v: "Rated" },
                  ].map((s) => (
                    <div key={s.v} className="px-1.5 sm:px-2">
                      <div className="font-display text-lg font-semibold text-foreground sm:text-xl">
                        {s.k}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
                        {s.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:mt-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 sm:pt-8 lg:grid-cols-4 lg:gap-x-8">
            {[
              { icon: ShieldCheck, label: "Medical reg. verified" },
              { icon: GraduationCap, label: "BDS · MDS" },
              { icon: Award, label: "18+ years experience" },
              { icon: HeartHandshake, label: "Indian Dental Assoc." },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-[var(--color-teal)]" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* COMMON REASONS */}      
      <section className="page-container section-y-sm">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How we can help</span>
          <h2 className="display-lg mt-3">Common reasons patients visit</h2>
          <p className="lead mt-3">
            If you’re not sure what you need, that’s okay. Start with a consultation and we’ll guide
            you from there.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {[
            {
              t: "Tooth pain / sensitivity",
              d: "Sharp pain, sensitivity to hot/cold, or pain while chewing.",
            },
            { t: "Cavities & fillings", d: "Small holes, food getting stuck, or old fillings." },
            { t: "Bleeding gums", d: "Bleeding while brushing, swelling, or bad breath." },
            { t: "Dental cleaning", d: "Scaling and polishing for healthier gums and teeth." },
            { t: "Root canal (RCT)", d: "When the tooth needs to be saved instead of removed." },
            { t: "Missing teeth", d: "Dentures, bridges or implants to restore function." },
          ].map((c, i) => (
            <Reveal
              key={c.t}
              delayMs={i * 40}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="font-display text-lg text-foreground">{c.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</div>
              <div className="mt-4 text-sm font-medium text-primary">
                <Link to="/contact" className="hover:underline">
                  Ask for an appointment
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BENTO: WHY DENTA CARE */}
      <section className="page-container section-y">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Why Denta Care</span>
          <h2 className="display-lg mt-3">Comfortable care. Clear advice.</h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:gap-5 lg:mt-14 lg:grid-cols-12 lg:items-stretch">
          <Reveal className="relative min-h-[260px] overflow-hidden rounded-3xl sm:min-h-[300px] lg:col-span-5 lg:min-h-[440px]">
            <img
              src={treatmentImg}
              alt="Modern dental treatment room at Denta Care"
              width={1280}
              height={1280}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.20_0.05_245_/_0.88)] via-[oklch(0.20_0.05_245_/_0.3)] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground sm:p-7">
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-aqua)]">
                The clinic
              </span>
              <h3 className="mt-2 font-display text-xl sm:text-2xl">A clean, comfortable clinic</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">
                Sterilised instruments, modern equipment, and a calm setup designed around patient
                comfort.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:gap-5 lg:col-span-7 lg:grid-cols-6 lg:grid-rows-2 lg:auto-rows-fr">
            <Reveal className="flex min-h-[10.5rem] flex-col justify-between rounded-3xl bg-primary p-5 text-primary-foreground sm:min-h-[11.5rem] sm:p-7 lg:col-span-4 lg:row-start-1">
              <Award className="h-6 w-6 text-[var(--color-aqua)] sm:h-7 sm:w-7" />
              <div>
                <div className="font-display text-4xl font-semibold sm:text-5xl">18+</div>
                <div className="mt-1 text-sm leading-snug text-white/75">
                  years of dental care in Visakhapatnam
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={60} className="flex min-h-[10.5rem] flex-col justify-center rounded-3xl border border-border bg-card p-5 sm:min-h-[11.5rem] sm:p-6 lg:col-span-2 lg:row-start-1">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-aqua)]/20 text-[var(--color-deep)] sm:h-11 sm:w-11">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base text-foreground sm:mt-5 sm:text-lg">
                Gentle treatment
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:mt-1.5">
                Calm approach and careful work.
              </p>
            </Reveal>

            <Reveal delayMs={90} className="flex min-h-[10.5rem] flex-col justify-center rounded-3xl border border-border bg-card p-5 sm:min-h-[11.5rem] sm:p-6 lg:col-span-2 lg:row-start-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-aqua)]/20 text-[var(--color-deep)] sm:h-11 sm:w-11">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base text-foreground sm:mt-5 sm:text-lg">
                Sterilised
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:mt-1.5">
                Hygiene you can rely on.
              </p>
            </Reveal>

            <Reveal delayMs={120} className="relative flex min-h-[10.5rem] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--gradient-aqua)] p-5 text-primary-foreground sm:min-h-[11.5rem] sm:p-7 lg:col-span-4 lg:row-start-2">
              <CalendarCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              <div>
                <h3 className="font-display text-lg sm:text-xl">Easy bookings</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/90">
                Call ahead or walk in during clinic hours.
                </p>
                <a
                  href="tel:+910000000000"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:underline"
                >
                  Call the clinic <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-secondary/50">
        <div className="page-container section-y">
          <div className="flex flex-col items-start justify-between gap-5 sm:gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="eyebrow">Treatments</span>
            <h2 className="display-lg mt-3">Dental services under one roof.</h2>
              <p className="lead mt-3 sm:mt-4">
              From routine cleaning to root canal treatment, dentures and cosmetic dentistry — we
              cover the care most families need.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              See all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-12 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-[var(--color-teal)]/40 hover:shadow-[var(--shadow-soft)] sm:p-6"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-aqua)]/20 text-[var(--color-deep)] transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-12 sm:w-12">
                  <s.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 font-display text-lg text-foreground sm:mt-5">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:right-5 sm:top-5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTOR */}
      <section className="page-container section-y">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <img
              src={smileImg}
              alt="Bright healthy smile"
              width={1280}
              height={1280}
              loading="lazy"
              className="aspect-square w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-soft)] sm:rounded-[2rem]"
            />
            <div className="absolute -bottom-4 -right-2 w-36 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-soft)] sm:-bottom-5 sm:-right-5 sm:w-44 sm:p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Reg. number
              </div>
              <div className="mt-1 font-display text-lg text-foreground">A3147</div>
              <div className="text-[11px] text-muted-foreground">AP State Dental Council</div>
            </div>
          </div>
          <div>
            <span className="eyebrow">Meet your dentist</span>
            <h2 className="display-lg mt-3">Dr. D. Ajit — clear advice, careful care.</h2>
            <p className="lead mt-4 sm:mt-5">
              Dr. D. Ajit (BDS, MDS) has 18+ years of experience. He explains options in simple
              terms and focuses on comfortable, long-lasting results.
            </p>
            <ul className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2">
              {[
                "BDS — Maaruti College of Dental Sciences (2002)",
                "MDS — Oral Medicine & Radiology, Oxford Dental (2007)",
                "Member, Indian Dental Association",
                "Reg. A3147 — AP State Dental Council",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-teal)]" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] sm:mt-8"
            >
              More about Dr. Ajit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-0 opacity-30">
          <img src={toolsImg} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        </div>
        <div className="page-container section-y relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-aqua)]">
              Your visit
            </span>
            <h2 className="display-lg mt-3 text-primary-foreground">
              Your visit, step by step.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-3 lg:mt-14">
            {[
              {
                n: "01",
                t: "Book your visit",
                d: "Call us, or walk in during clinic hours.",
              },
              {
                n: "02",
                t: "Consultation",
                d: "We listen first, check the issue, and explain the options.",
              },
              {
                n: "03",
                t: "Treatment",
                d: "If treatment is needed, we plan it clearly and proceed at your pace.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="flex h-full flex-col rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur sm:p-8"
              >
                <span className="font-display text-4xl font-semibold text-[var(--color-aqua)] sm:text-5xl">
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-lg sm:mt-4 sm:text-xl">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="page-container section-y">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5">
            <span className="eyebrow">Patient stories</span>
            <h2 className="display-lg mt-3">Trusted by patients in Visakhapatnam.</h2>
            <img
              src={patientImg}
              alt="Happy Denta Care patient"
              width={1024}
              height={1280}
              loading="lazy"
              className="mt-6 aspect-[4/5] w-full max-h-[420px] rounded-[1.75rem] object-cover object-top shadow-[var(--shadow-soft)] sm:mt-8 sm:max-h-none sm:rounded-[2rem]"
            />
          </div>
          <div className="grid gap-4 sm:gap-5 lg:col-span-7">
            {[
              {
                n: "Lakshmi P.",
                r: "Cosmetic dentistry",
                q: "I was nervous about veneers, but Dr. Ajit explained everything clearly. The result looks natural and I'm very happy.",
              },
              {
                n: "Ravi K.",
                r: "Root canal",
                q: "My root canal was comfortable and well explained. The clinic is clean and the staff are helpful.",
              },
              {
                n: "Sunita M.",
                r: "Dentures",
                q: "My mother's dentures fit well and she's eating comfortably again. Thank you to the doctor and team.",
              },
            ].map((t) => (
              <figure
                key={t.n}
                className="rounded-3xl border border-border bg-card p-5 sm:p-7"
              >
                <div className="flex gap-0.5 text-[var(--color-teal)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 text-base leading-relaxed text-foreground sm:mt-4">
                  "{t.q}"
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 text-sm sm:mt-5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-aqua)]/30 font-display text-sm font-semibold text-[var(--color-deep)]">
                    {t.n.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{t.n}</div>
                    <div className="text-muted-foreground">{t.r}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-secondary/50">
        <div className="page-container section-y">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Gallery</span>
            <h2 className="display-lg mt-3">A quick look at the clinic</h2>
            <p className="lead mt-3">
              Clean spaces, calm setup, and a comfortable experience. Tap an image to view it larger.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {gallery.map((g, i) => (
              <Reveal key={g.label} delayMs={i * 40}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
                  aria-label={`Open image: ${g.label}`}
                >
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="font-display text-base text-foreground">{g.label}</div>
                    <span className="text-sm font-medium text-primary opacity-90 group-hover:underline">
                      View
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="page-container pb-16 sm:pb-20 lg:pb-24">
        <div className="grid gap-8 overflow-hidden rounded-[1.75rem] border border-border bg-[var(--gradient-hero)] p-6 sm:rounded-[2rem] sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-10 lg:p-12 xl:p-14">
          <div>
            <span className="eyebrow">Visit us</span>
            <h2 className="display-lg mt-3">Visit Denta Care Dental Clinic</h2>
            <p className="lead mt-3 max-w-md sm:mt-4">
              We’re in Shankar Plaza, Murali Nagar. Call ahead to book, or visit during clinic
              hours.
            </p>
            <ul className="mt-6 space-y-4 text-sm sm:mt-8">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-teal)]" />
                <span className="text-foreground">
                  #39-11-70, 1st Floor, Shankar Plaza,
                  <br />
                  Muralinagar, Visakhapatnam
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-teal)]" />
                <span className="text-foreground">
                  Mon – Sat
                  <br />
                  <span className="text-muted-foreground">
                    10:00 AM – 1:00 PM · 5:00 PM – 9:00 PM
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-teal)]" />
                <a
                  href="tel:+910000000000"
                  className="text-foreground hover:text-[var(--color-teal)]"
                >
                  Call the clinic
                </a>
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] sm:mt-8"
            >
              Request appointment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img
            src={clinicImg}
            alt="Denta Care clinic interior"
            width={1280}
            height={960}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-soft)]"
          />
        </div>
      </section>

      {openIndex != null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl bg-background shadow-[var(--shadow-elegant)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <div className="truncate font-display text-base text-foreground">
                  {gallery[openIndex].label}
                </div>
                <div className="truncate text-xs text-muted-foreground">Press Esc to close</div>
              </div>
              <button
                type="button"
                className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
                onClick={() => setOpenIndex(null)}
              >
                Close
              </button>
            </div>
            <img
              src={gallery[openIndex].src}
              alt={gallery[openIndex].alt}
              className="max-h-[75vh] w-full object-contain bg-black"
            />
          </div>
        </div>
      )}
    </>
  );
}
