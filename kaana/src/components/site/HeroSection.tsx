'use client';

export default function HeroSection() {
  return (
    <>
      
          <section id="home" className="relative min-h-screen flex items-center pt-20">
            
            <canvas id="particles-canvas"></canvas>
            
            
            <canvas id="neural-network" className="neural-network"></canvas>
            
            
            <div className="animated-bg">
              <div className="animated-bg-shape" style={{ width: "600px", height: "600px", top: "-10%", left: "-10%" }}></div>
              <div className="animated-bg-shape" style={{ width: "500px", height: "500px", bottom: "-10%", right: "-10%", animationDelay: "2s" }}></div>
            </div>
      
            
            <div className="ai-blob" style={{ width: "300px", height: "300px", top: "20%", left: "10%" }}></div>
            <div className="ai-blob" style={{ width: "250px", height: "250px", bottom: "10%", right: "15%", animationDelay: "3s" }}></div>
      
            <div className="container mx-auto px-6 py-10 md:py-20">
              <div className="max-w-4xl mx-auto text-center">
                <div className="overflow-hidden mb-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl text-neutral-100 font-display font-medium leading-tight reveal-up" id="heroTitle" style={{ transitionDelay: "0.05s" }}>
                    Digital <span className="text-gradient">Solutions</span> for Tomorrow
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-neutral-100 mb-8 max-w-2xl mx-auto reveal-up" style={{ transitionDelay: "0.2s" }}>
                  Creating cutting-edge digital experiences and technology solutions for forward-thinking businesses
                </p>
                <div className="flex flex-wrap justify-center gap-4 reveal-up" style={{ transitionDelay: "0.4s" }}>
                  <div className="magnetic-wrap">
                    <a href="#solutions" className="magnetic-area btn btn-primary link-trigger">
                      Explore Solutions
                      <i className="fas fa-arrow-right text-xs ml-2 btn-icon"></i>
                    </a>
                  </div>
                  <div className="magnetic-wrap">
                    <a href="#ai-demo" className="magnetic-area btn btn-outline link-trigger">
                      Try AI Demo
                    </a>
                  </div>
                </div>
                
                
                <div className="swiper hero-swiper mt-10 reveal-up" style={{ transitionDelay: "0.6s" }}>
                  <div className="swiper-wrapper">
                    
                    <div className="swiper-slide">
                      <div className="card-3d w-full max-w-md">
                        <div className="card-3d-inner border border-neutral-800 rounded-sm p-6 text-center hover-lift bg-dark/50 backdrop-blur-md">
                          <div className="text-accent text-3xl mb-4">
                            <i className="fas fa-laptop-code"></i>
                          </div>
                          <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">Web Design</h3>
                         <p className="text-neutral-400">Responsive, SEO-ready websites with clean UI/UX, fast performance, accessibility best practices, and easy CMS integration—designed to convert visitors into customers across all devices.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                     <div className="swiper-slide">
                      <div className="card-3d w-full max-w-md">
                        <div className="card-3d-inner border border-neutral-800 rounded-sm p-6 text-center hover-lift bg-dark/50 backdrop-blur-md">
                          <div className="text-accent text-3xl mb-4">
                            <i className="fas fa-bullhorn"></i>
                          </div>
                          <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">Print & Digital Marketing</h3>
                         <p className="text-neutral-400">Instagram boosts, Google Ads, Facebook Ads, YouTube promotions, strategic SEO, content marketing, social media management, PPC, and email campaigns.</p>
                        </div>
                      </div>
                    </div>
                  
                    
                    
                    
                    <div className="swiper-slide">
                      <div className="card-3d w-full max-w-md">
                        <div className="card-3d-inner border border-neutral-800 rounded-sm p-6 text-center hover-lift bg-dark/50 backdrop-blur-md">
                          <div className="text-accent text-3xl mb-4">
                            <i className="fas fa-robot"></i>
                          </div>
                          <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">Chatbot Solutions</h3>
                         <p className="text-neutral-400">AI-powered chatbots with natural language understanding for 24/7 support, lead capture, FAQs, bookings, and order status—integrated with your website, WhatsApp, and CRM to reduce response time and support costs.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                    <div className="swiper-slide">
                      <div className="card-3d w-full max-w-md">
                        <div className="card-3d-inner border border-neutral-800 rounded-sm p-6 text-center hover-lift bg-dark/50 backdrop-blur-md">
                          <div className="text-accent text-3xl mb-4">
                            <i className="fas fa-shopping-cart"></i>
                          </div>
                          <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">E-commerce</h3>
                         <p className="text-neutral-400">Conversion-focused storefronts with secure payments, intuitive product catalogs, inventory and shipping automation, abandoned cart recovery, and analytics for data-driven growth.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                    <div className="swiper-slide">
                      <div className="card-3d w-full max-w-md">
                        <div className="card-3d-inner border border-neutral-800 rounded-sm p-6 text-center hover-lift bg-dark/50 backdrop-blur-md">
                          <div className="text-accent text-3xl mb-4">
                            <i className="fas fa-mobile-alt"></i>
                          </div>
                          <h3 className="text-xl text-neutral-100 font-display font-medium mb-2">App Development</h3>
                         <p className="text-neutral-400">High-performance native and cross-platform apps for iOS and Android with intuitive UX, offline support, push notifications, and scalable backends for long-term growth.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hero-swiper-pagination mt-6"></div>
                </div>
      
                
                <div className="mt-10 max-w-lg mx-auto border border-neutral-800 rounded-sm p-4 bg-dark/50 backdrop-blur-md reveal-up" style={{ transitionDelay: "0.8s" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent-secondary flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-dark text-xs"></i>
                    </div>
                    <div className="text-sm font-medium">Kāna AI Assistant</div>
                  </div>
                  <div className="text-left text-sm text-neutral-300 overflow-hidden" style={{ minHeight: "1.25rem" }}>
                    <span className="typing" id="aiTyping">How can I help transform your business with digital solutions today?</span>
                  </div>
                </div>
              </div>
            </div>
      
            <div className="scroll-indicator">
              <span>Scroll</span>
              <div className="scroll-line"></div>
            </div>
          </section>
    </>
  );
}
