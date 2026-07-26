'use client';

export default function Footer() {
  return (
    <>
      
        <footer className="py-12 border-t border-neutral-800">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <a href="/" className="text-xl font-display font-medium mb-4 inline-block link-trigger">
                  Kāna<span className="text-accent">.</span>
                </a>
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
                  <li><a href="/services/whatsapp-business-automation" className="text-neutral-400 hover:text-accent transition-colors link-trigger">WhatsApp Automation</a></li>
                  <li><a href="/services/multi-tenant-saas-gcp" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Multi-Tenant SaaS</a></li>
                  <li><a href="/services/healthcare-clinic-software" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Clinic Software</a></li>
                  <li><a href="/services/offline-first-field-apps" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Offline Field Apps</a></li>
                  <li><a href="/services" className="text-neutral-400 hover:text-accent transition-colors link-trigger">All services</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg text-neutral-100 font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="/work" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Case Studies</a></li>
                  <li><a href="/insights" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Insights</a></li>
                  <li><a href="/#about" className="text-neutral-400 hover:text-accent transition-colors link-trigger">About Us</a></li>
                  <li><a href="#" className="text-neutral-400 hover:text-accent transition-colors link-trigger careers-trigger">Careers</a></li>
                  <li><a href="/#contact" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Contact</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center">
              <p className="text-neutral-400 mb-4 md:mb-0">© {new Date().getFullYear()} Kāna. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Privacy Policy</a>
                <a href="#" className="text-neutral-400 hover:text-accent transition-colors link-trigger">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
    </>
  );
}
