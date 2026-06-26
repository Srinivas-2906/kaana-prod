import {
  Sparkles,
  HeartPulse,
  Crown,
  Wrench,
  Droplets,
  ScanLine,
  Baby,
  ShieldCheck,
} from "lucide-react";

export const services = [
  {
    icon: Sparkles,
    title: "Cosmetic Dentistry",
    desc: "Whitening, veneers and smile makeovers designed to look natural.",
  },
  {
    icon: Crown,
    title: "Crowns, Bridges & Dentures",
    desc: "Custom teeth replacements to help you eat and smile comfortably.",
  },
  {
    icon: HeartPulse,
    title: "Root Canal Treatment (RCT)",
    desc: "Relieve tooth pain and save the tooth with careful, modern treatment.",
  },
  {
    icon: ShieldCheck,
    title: "Fillings (Conservative Dentistry)",
    desc: "Tooth-coloured fillings that keep as much natural tooth as possible.",
  },
  {
    icon: Droplets,
    title: "Scaling & Cleaning",
    desc: "Professional cleaning to keep gums healthy and breath fresh.",
  },
  {
    icon: Wrench,
    title: "Implants & Artificial Teeth",
    desc: "Fixed replacements for missing teeth that feel stable and look real.",
  },
  {
    icon: ScanLine,
    title: "Oral Diagnosis & X-rays",
    desc: "Clear diagnosis and treatment planning when you need a second look.",
  },
  {
    icon: Baby,
    title: "Family & Kids Dentistry",
    desc: "Gentle care for children, adults and seniors — all in one clinic.",
  },
] as const;
  