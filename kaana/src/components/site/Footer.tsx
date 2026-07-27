'use client';

import Link from "next/link";

import KaanaLogo from "./KaanaLogo";

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
                  We create minimalist, cutting-edge digital solutions that transform businesses and elevate user experiences in the digital landscape.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg text-neutral-100 font-medium mb-4">Services</h3>
                <ul className="space-y-2">
                  <li><Link href="/services/whatsapp-business-automation" className="text-neutral-400 hover:text-accent transition-colors link-trigger">WhatsApp Automation</Link></li>
                  <li><Link href="/services/multi-tenant-saas-gcp" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Multi-Tenant SaaS</Link></li>
                  <li><Link href="/services/healthcare-clinic-software" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Clinic Software</Link></li>
                  <li><Link href="/services/offline-first-field-apps" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Offline Field Apps</Link></li>
                  <li><Link href="/services" className="text-neutral-400 hover:text-accent transition-colors link-trigger">All services</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg text-neutral-100 font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/work" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Case Studies</Link></li>
                  <li><Link href="/insights" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Insights</Link></li>
                  <li><Link href="/#about" className="text-neutral-400 hover:text-accent transition-colors link-trigger">About Us</Link></li>
                  <li><a href="#" className="text-neutral-400 hover:text-accent transition-colors link-trigger careers-trigger">Careers</a></li>
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
