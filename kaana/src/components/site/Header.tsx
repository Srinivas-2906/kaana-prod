'use client';

export default function Header() {
  return (
    <>
      
        <header className="fixed top-0 left-0 w-full py-6 z-50 transition-all duration-300" id="header">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <a href="#" className="text-xl font-display font-bold tracking-normal link-trigger">
                Kāna
              </a>
      
              <nav className="hidden md:flex items-center gap-8">
                <a href="#home" className="text-base hover-line nav-link link-trigger">Home</a>
                <a href="#solutions" className="text-base hover-line nav-link link-trigger">Solutions</a>
                <a href="#ai-demo" className="text-base hover-line nav-link link-trigger">AI Demo</a>
                <a href="#process" className="text-base hover-line nav-link link-trigger">Process</a>
                <a href="#work" className="text-base hover-line nav-link link-trigger">Work</a>
                <a href="#about" className="text-base hover-line nav-link link-trigger">About</a>
                <a href="#" className="text-base hover-line nav-link link-trigger careers-trigger">Careers</a>
                <a href="#contact" className="text-base hover-line nav-link link-trigger">Contact</a>
              </nav>
      
              <div className="flex items-center gap-4">
                <a href="#contact" className="hidden md:inline-flex btn btn-outline text-sm link-trigger">
                  Get in touch
                </a>
      
                <button className="menu-button md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5" id="menuButton">
                  <span className="w-6 h-px bg-light transition-all duration-300"></span>
                  <span className="w-6 h-px bg-light transition-all duration-300"></span>
                </button>
              </div>
            </div>
          </div>
        </header>
    </>
  );
}
