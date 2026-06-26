import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="page-container grid gap-8 py-12 sm:gap-10 sm:py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-primary)] font-display text-lg text-primary-foreground">
              D
            </span>
            <span className="font-display text-lg">Denta Care</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Compassionate, expert dental care in MuraliNagar, Visakhapatnam — led by Dr. D. Ajit, BDS,
            MDS.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                About Dr. Ajit
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary">
                Services
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Visit</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              #39-11-70, 1st Floor, Shankar Plaza, Muralinagar, Visakhapatnam
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Mon – Sat · 10AM–1PM · 5PM–9PM
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a href="tel:+910000000000" className="hover:text-primary">
                Call the clinic
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              care@dentacare.in
            </li>
            <li className="text-xs">Consultation fee ₹100</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="page-container flex flex-col items-center justify-between gap-2 py-4 text-center text-xs text-muted-foreground sm:py-5 md:flex-row md:text-left">
          <span>© {new Date().getFullYear()} Denta Care Dental Clinic. All rights reserved.</span>
          <span>Reg. A3147 · Andhra Pradesh State Dental Council</span>
        </div>
      </div>
    </footer>
  );
}
