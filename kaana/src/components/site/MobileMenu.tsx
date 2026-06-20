'use client';

export default function MobileMenu() {
  return (
    <>
      
        <div className="fixed inset-0 bg-dark z-40 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-500" id="mobileMenu">
          <nav className="flex flex-col items-center gap-8">
            <a href="#home" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger">Home</a>
            <a href="#solutions" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger">Solutions</a>
            <a href="#ai-demo" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger">AI Demo</a>
            <a href="#process" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger">Process</a>
            <a href="#work" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger">Work</a>
            <a href="#about" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger">About</a>
            <a href="#" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger careers-trigger">Careers</a>
            <a href="#contact" className="text-3xl font-display font-medium hover:text-accent transition-colors mobile-nav-link link-trigger">Contact</a>
          </nav>
        </div>
    </>
  );
}
