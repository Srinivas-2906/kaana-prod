'use client';

export default function AboutSection() {
  return (
    <>
      
          <section id="about" className="py-20 md:py-32">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">About Us</span>
                  <h2 className="text-3xl text-neutral-100 md:text-5xl font-display font-medium mb-6 reveal-up" style={{ transitionDelay: "0.1s" }}>
                    We build digital solutions for tomorrow
                  </h2>
                  <p className="text-neutral-400 mb-6 reveal-up" style={{ transitionDelay: "0.2s" }}>
                    Kāna is a technology solutions company focused on creating minimalist, cutting-edge digital experiences that solve complex business challenges.
                  </p>
                  <p className="text-neutral-400 mb-8 reveal-up" style={{ transitionDelay: "0.3s" }}>
                    Our team of experts combines technical excellence with design thinking to deliver solutions that are not only functional but also aesthetically refined and future-proof.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="reveal-up" style={{ transitionDelay: "0.4s" }}>
                      <div className="text-3xl font-display font-medium mb-2 text-accent">5+</div>
                      <p className="text-neutral-400">Years of experience</p>
                    </div>
                    <div className="reveal-up" style={{ transitionDelay: "0.5s" }}>
                      <div className="text-3xl font-display font-medium mb-2 text-accent">20+</div>
                      <p className="text-neutral-400">Projects delivered</p>
                    </div>
                    <div className="reveal-up" style={{ transitionDelay: "0.6s" }}>
                      <div className="text-3xl font-display font-medium mb-2 text-accent">10+</div>
                      <p className="text-neutral-400">Team members</p>
                    </div>
                    <div className="reveal-up" style={{ transitionDelay: "0.7s" }}>
                      <div className="text-3xl font-display font-medium mb-2 text-accent">80%</div>
                      <p className="text-neutral-400">Industry score</p>
                    </div>
                  </div>
                  
                  <div className="reveal-up" style={{ transitionDelay: "0.8s" }}>
                    <a href="#" className="btn btn-primary link-trigger">
                      Learn more about us
                      <i className="fas fa-arrow-right text-xs ml-2 btn-icon"></i>
                    </a>
                  </div>
                </div>
                
                <div className="relative reveal-up" style={{ transitionDelay: "0.4s" }}>
                  <div className="border border-neutral-800 rounded-sm overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=1000&q=80" alt="Our Team" className="w-full aspect-[4/5] object-cover" />
                  </div>
                  
                  
                  <div className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 bg-dark border border-neutral-800 rounded-sm p-6 max-w-xs">
                    <p className="text-neutral-300 italic mb-4">
                      "Our mission is to create digital solutions that are as elegant in their simplicity as they are powerful in their functionality."
                    </p>
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">Navya Teja</div>
                        <div className="text-sm text-neutral-400">Founder & CEO</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
    </>
  );
}
