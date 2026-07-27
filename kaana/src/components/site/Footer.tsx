'use client';

import Link from "next/link";

import KaanaLogo from "./KaanaLogo";
import { INSTAGRAM_URL, LINKEDIN_URL, WHATSAPP_URL } from "@/lib/seo/site";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <>
      
        <footer className="py-12 border-t border-neutral-800">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <KaanaLogo variant="name" href="/" />
                </div>
                <p className="text-neutral-400 mb-6 max-w-md">
                  Kaana is a custom software studio — web apps, mobile, AI chatbots, e-commerce, and marketing — with production case studies across WhatsApp ops, healthcare, edtech, commerce, and more.
                </p>
                <div className="flex gap-4">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger"
                  >
                    <Icon name="whatsapp" className="text-lg" />
                  </a>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Kaana on LinkedIn"
                    className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger"
                  >
                    <Icon name="linkedin" className="text-lg" />
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Kaana on Instagram"
                    className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger"
                  >
                    <Icon name="instagram" className="text-lg" />
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg text-neutral-100 font-medium mb-4">Services</h3>
                <ul className="space-y-2">
                  <li><Link href="/#solutions" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Software</Link></li>
                  <li><Link href="/services/whatsapp-business-automation" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Automation & AI</Link></li>
                  <li><Link href="/services/multi-tenant-saas-gcp" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Multi-Tenant SaaS</Link></li>
                  <li><Link href="/#solutions" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Digital Marketing</Link></li>
                  <li><Link href="/services" className="text-neutral-400 hover:text-accent transition-colors link-trigger">All services</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg text-neutral-100 font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/work" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Case Studies</Link></li>
                  <li><Link href="/insights" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Insights</Link></li>
                  <li><Link href="/#about" className="text-neutral-400 hover:text-accent transition-colors link-trigger">About Us</Link></li>
                  <li>
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-accent transition-colors link-trigger careers-trigger"
                    >
                      Careers
                    </button>
                  </li>
                  <li><Link href="/#contact" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Contact</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center">
              <p className="text-neutral-400 mb-4 md:mb-0">
                © {year} Kaana Digital Solutions. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/privacy-policy" className="text-neutral-400 hover:text-accent transition-colors link-trigger">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-neutral-400 hover:text-accent transition-colors link-trigger">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>
    </>
  );
}
