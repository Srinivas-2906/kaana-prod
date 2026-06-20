'use client';

export default function WorkSection() {
  return (
    <>
      
          <section id="work" className="py-20 md:py-32 bg-dark/80">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mb-16">
                <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">Our Work</span>
                <h2 className="text-3xl text-neutral-100 md:text-5xl font-display font-medium mb-6 reveal-up" style={{ transitionDelay: "0.1s" }}>
                  Featured projects
                </h2>
                <p className="text-neutral-400 max-w-2xl reveal-up" style={{ transitionDelay: "0.2s" }}>
                  Explore our portfolio of innovative digital solutions that have transformed businesses across various industries.
                </p>
              </div>
      
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                
                <div className="reveal-up" style={{ transitionDelay: "0.3s" }}>
                  <div className="image-hover rounded-sm overflow-hidden mb-6">
                    <img src="https://kaana.in/wp-content/uploads/2025/04/Rythumela-04-04-2025_11_36_AM.webp" alt="E-commerce Platform" className="w-full aspect-[4/3] object-cover" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-neutral-400 mb-2 block">E-commerce</span>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">Farmers e-market multi-vendor Platform</h3>
                  <p className="text-neutral-400 mb-4">
                    A premium e-commerce platform with advanced product filtering, secure checkout, and inventory management.
                  </p>
                  <a href="#" className="text-sm text-accent flex items-center link-trigger">
                    View case study
                    <i className="fas fa-arrow-right text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                  </a>
                </div>
                
                
                <div className="reveal-up" style={{ transitionDelay: "0.4s" }}>
                  <div className="image-hover rounded-sm overflow-hidden mb-6">
                    <img src="https://kaana.in/wp-content/uploads/2025/04/145902eb-8f54-4173-9c6b-3ff645ee9d8a.webp" alt="Mobile Banking App" className="w-full aspect-[4/3] object-cover" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-neutral-400 mb-2 block">Mobile App</span>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">GCSE UK course platform</h3>
                  <p className="text-neutral-400 mb-4">
                    A secure, intuitive mobile solution that redefines digital learning experiences.
                  </p>
                  <a href="#" className="text-sm text-accent flex items-center link-trigger">
                    View case study
                    <i className="fas fa-arrow-right text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                  </a>
                </div>
                
                
                <div className="reveal-up" style={{ transitionDelay: "0.5s" }}>
                  <div className="image-hover rounded-sm overflow-hidden mb-6">
                    <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80" alt="Customer Support Chatbot" className="w-full aspect-[4/3] object-cover" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-neutral-400 mb-2 block">Chatbot Solution</span>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">Developed as a study project</h3>
                  <p className="text-neutral-400 mb-4">
                    An intelligent chatbot that handles studentslanguage learning skills, reducing support costs by 45%.
                  </p>
                  <a href="#" className="text-sm text-accent flex items-center link-trigger">
                    View case study
                    <i className="fas fa-arrow-right text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                  </a>
                </div>
                
                
                <div className="reveal-up" style={{ transitionDelay: "0.6s" }}>
                  <div className="image-hover rounded-sm overflow-hidden mb-6">
                    <video 
              className="w-full max-w-4xl rounded-2xl shadow-xl" 
              autoPlay 
              muted 
              loop 
              playsInline
          >
              <source src="https://kaana.in/wp-content/uploads/2025/04/Elegance-Interiors-_-Luxury-Interior-Design-Studio.mp4" type="video/mp4" />
              Your browser does not support the video tag.
          </video>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-neutral-400 mb-2 block">Web Design</span>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">Elegance interiors Mobile App & WEb App</h3>
                  <p className="text-neutral-400 mb-4">
                    A responsive corporate app with interactive elements that increased lead generation by 60%.
                  </p>
                  <a href="#" className="text-sm text-accent flex items-center link-trigger">
                    View case study
                    <i className="fas fa-arrow-right text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                  </a>
                </div>
              </div>
              
              <div className="mt-16 text-center reveal-up" style={{ transitionDelay: "0.7s" }}>
                <a href="#" className="btn btn-outline link-trigger">
                  View all projects
                  <i className="fas fa-arrow-right text-xs ml-2 btn-icon"></i>
                </a>
              </div>
            </div>
          </section>
    </>
  );
}
